package com.campusskills.modules.sessions.services;

import com.campusskills.modules.sessions.models.RescheduleProposal;
import com.campusskills.modules.sessions.models.Session;
import com.campusskills.modules.sessions.repositories.SessionRepository;
import com.campusskills.shared.constants.SessionStatus;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;

public class SessionService {

    private final SessionRepository repository;
    private final io.vertx.core.eventbus.EventBus eventBus;
    private final com.campusskills.modules.users.repositories.UserStatsRepository statsRepository;
    private final com.campusskills.modules.users.repositories.UserProfileRepository profileRepository;
    private final com.campusskills.modules.listings.repositories.ListingRepository listingRepository;

    public SessionService(io.vertx.core.eventbus.EventBus eventBus) {
        this.repository = new SessionRepository();
        this.statsRepository = new com.campusskills.modules.users.repositories.UserStatsRepository();
        this.profileRepository = new com.campusskills.modules.users.repositories.UserProfileRepository();
        this.listingRepository = new com.campusskills.modules.listings.repositories.ListingRepository();
        this.eventBus = eventBus;
    }

    private void sendNotification(String userId, com.campusskills.shared.constants.NotificationType type, String title, String message, String sourceType, String sourceId) {
        if (eventBus == null) return;
        JsonObject payload = new JsonObject()
            .put("userId", userId)
            .put("type", type.name())
            .put("title", title)
            .put("message", message)
            .put("sourceType", sourceType)
            .put("sourceId", sourceId);
        eventBus.send("internal.notification.create", payload);
    }

    private void emitSessionEvent(String sessionId, String type, JsonObject data) {
        if (eventBus == null) return;
        JsonObject payload = new JsonObject().put("sessionId", sessionId).put("type", type);
        if (data != null) payload.put("data", data);
        eventBus.publish("ws.sessions." + sessionId, payload);
    }

    public Future<JsonObject> getUserSessions(String userId, int page, int limit) {
        int skip = (page - 1) * limit;
        return repository.countUserSessions(userId).compose(total -> 
            repository.fetchUserSessions(userId, skip, limit).map(list -> {
                io.vertx.core.json.JsonArray items = new io.vertx.core.json.JsonArray();
                list.forEach(req -> items.add(JsonObject.mapFrom(req)));
                return new JsonObject()
                    .put("items", items)
                    .put("page", page)
                    .put("limit", limit)
                    .put("total", total);
            })
        );
    }

    public Future<Session> getSessionByIdAuth(String sessionId, String userId) {
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) {
                return Future.failedFuture("Session not found");
            }
            if (!userId.equals(session.getTeacherId()) && !userId.equals(session.getStudentId())) {
                return Future.failedFuture("Not authorized to view this session");
            }
            return Future.succeededFuture(session);
        });
    }

    public Future<Void> markCompletion(String sessionId, String userId) {
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) return Future.failedFuture("Session not found");
            if (!userId.equals(session.getTeacherId()) && !userId.equals(session.getStudentId())) {
                return Future.failedFuture("Not authorized");
            }
            if (session.getStatus() != SessionStatus.SCHEDULED) {
                return Future.failedFuture("Session must be SCHEDULED to mark completion");
            }

            boolean isTeacher = userId.equals(session.getTeacherId());
            JsonObject updates = new JsonObject();
            if (isTeacher) {
                updates.put("teacherConfirmedCompletion", true);
            } else {
                updates.put("studentConfirmedCompletion", true);
            }

            return repository.updateSessionFields(sessionId, updates).compose(v -> repository.getSessionById(sessionId)).compose(updatedSession -> {
                if (Boolean.TRUE.equals(updatedSession.getTeacherConfirmedCompletion()) && Boolean.TRUE.equals(updatedSession.getStudentConfirmedCompletion())) {
                    JsonObject finalUpdate = new JsonObject().put("status", SessionStatus.COMPLETED.name());
                    return repository.updateSessionFields(sessionId, finalUpdate).compose(v2 -> {
                        if (session.getChatId() != null) {
                            createAndBroadcastSystemMessage(session.getChatId(), "Session completed successfully.\nPayment and reviews are now available.", sessionId, null, null, null);
                        }
                        
                        com.campusskills.modules.users.repositories.UserProfileRepository profileRepo = new com.campusskills.modules.users.repositories.UserProfileRepository();
                        return profileRepo.findByUserId(session.getTeacherId()).compose(teacherProfile -> {
                            String teacherName = teacherProfile != null ? teacherProfile.getName() : "Teacher";
                            return profileRepo.findByUserId(session.getStudentId()).compose(studentProfile -> {
                                String studentName = studentProfile != null ? studentProfile.getName() : "Student";
                                String topic = session.getTopic() != null ? session.getTopic() : "Session";
                                
                                String msgToTeacher = topic + " Session with " + studentName + " was completed.\nPayment is pending from " + studentName + ".";
                                String msgToStudent = topic + " Session with " + teacherName + " was completed.\nPlease complete payment.";
                                
                                sendNotification(session.getTeacherId(), com.campusskills.shared.constants.NotificationType.SESSION_COMPLETED, "Session Completed", msgToTeacher, "SESSION", sessionId);
                                sendNotification(session.getStudentId(), com.campusskills.shared.constants.NotificationType.SESSION_COMPLETED, "Session Completed", msgToStudent, "SESSION", sessionId);
                                statsRepository.recordActivity(session.getTeacherId());
                                statsRepository.recordActivity(session.getStudentId());
                                com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent(com.campusskills.shared.constants.WebSocketEventType.SESSION_BOTH_CONFIRMED, updatedSession);
                                return Future.succeededFuture();
                            });
                        });
                    }).mapEmpty();
                } else {
                    if (session.getChatId() != null) {
                        profileRepository.findByUserId(userId).onSuccess(profile -> {
                            String name = (profile != null) ? profile.getName() : "Someone";
                            createAndBroadcastSystemMessage(session.getChatId(), "{marker} marked this session as completed.", sessionId, userId, null, null);
                        });
                    }
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent(com.campusskills.shared.constants.WebSocketEventType.COMPLETION_REQUESTED, updatedSession);
                    profileRepository.findByUserId(userId).onSuccess(profile -> {
                        String name = (profile != null) ? profile.getName() : "Someone";
                        String otherUserId = userId.equals(session.getTeacherId()) ? session.getStudentId() : session.getTeacherId();
                        String topic = session.getTopic() != null ? session.getTopic() : "Session";
                        sendNotification(otherUserId, com.campusskills.shared.constants.NotificationType.COMPLETION_REQUESTED, "Completion Requested", name + " marked " + topic + " as completed.\nPlease confirm.", "SESSION", sessionId);
                    });
                    return Future.succeededFuture();
                }
            });
        });
    }

    public Future<Void> proposeReschedule(String sessionId, String userId, Long newStart, Long newEnd) {
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) return Future.failedFuture("Session not found");
            if (!userId.equals(session.getTeacherId()) && !userId.equals(session.getStudentId())) {
                return Future.failedFuture("Not authorized");
            }
            if (session.getStatus() != SessionStatus.SCHEDULED) {
                return Future.failedFuture("Session must be SCHEDULED to propose reschedule");
            }

            JsonObject proposal = new JsonObject()
                .put("proposedByUserId", userId)
                .put("newScheduledStart", newStart)
                .put("newScheduledEnd", newEnd)
                .put("status", "PENDING");

            JsonObject updates = new JsonObject().put("rescheduleProposal", proposal);
            return repository.updateSessionFields(sessionId, updates).onSuccess(v -> {
                emitSessionEvent(sessionId, "RESCHEDULE_PROPOSED", proposal);
            }).mapEmpty();
        });
    }

    public Future<Void> respondToReschedule(String sessionId, String userId, boolean accept) {
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) return Future.failedFuture("Session not found");
            if (!userId.equals(session.getTeacherId()) && !userId.equals(session.getStudentId())) {
                return Future.failedFuture("Not authorized");
            }
            if (session.getRescheduleProposal() == null) {
                return Future.failedFuture("No active reschedule proposal");
            }
            if (session.getRescheduleProposal().getProposedByUserId().equals(userId)) {
                return Future.failedFuture("Cannot respond to your own proposal");
            }

            JsonObject updates;
            if (accept) {
                updates = new JsonObject()
                    .put("scheduledStart", session.getRescheduleProposal().getNewScheduledStart())
                    .put("scheduledEnd", session.getRescheduleProposal().getNewScheduledEnd())
                    .putNull("rescheduleProposal");
            } else {
                updates = new JsonObject().putNull("rescheduleProposal");
            }

            return repository.updateSessionFields(sessionId, updates).onSuccess(v -> {
                emitSessionEvent(sessionId, accept ? "RESCHEDULE_ACCEPTED" : "RESCHEDULE_REJECTED", null);
            }).mapEmpty();
        });
    }

    public Future<Void> markPaid(String sessionId, String userId) {
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) return Future.failedFuture("Session not found");
            if (!userId.equals(session.getStudentId())) {
                return Future.failedFuture("Only the student can mark as paid");
            }
            if (session.getStatus() != SessionStatus.COMPLETED) {
                return Future.failedFuture("Session must be COMPLETED to mark as paid");
            }

            JsonObject updates = new JsonObject().put("studentMarkedPaid", true);
            return repository.updateSessionFields(sessionId, updates).compose(v -> repository.getSessionById(sessionId)).onSuccess(updatedSession -> {
                com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent(com.campusskills.shared.constants.WebSocketEventType.PAYMENT_SUBMITTED, updatedSession);
                profileRepository.findByUserId(session.getTeacherId()).onSuccess(profile -> {
                    String studentName = profile != null ? profile.getName() : "Student";
                    String topic = session.getTopic() != null ? session.getTopic() : "Session";
                    sendNotification(session.getTeacherId(), com.campusskills.shared.constants.NotificationType.MARKED_PAID, "Payment Claimed", studentName + " claims payment for " + topic + ".\nDid you receive it?", "SESSION", sessionId);
                });
            }).mapEmpty();
        });
    }

    public Future<Void> confirmPayment(String sessionId, String userId) {
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) return Future.failedFuture("Session not found");
            if (!userId.equals(session.getTeacherId())) {
                return Future.failedFuture("Only the teacher can confirm payment");
            }
            if (session.getStatus() != SessionStatus.COMPLETED) {
                return Future.failedFuture("Session must be COMPLETED to confirm payment");
            }
            if (!Boolean.TRUE.equals(session.getStudentMarkedPaid())) {
                return Future.failedFuture("Student has not marked payment yet");
            }

            JsonObject updates = new JsonObject().put("teacherConfirmedPayment", true);
            return repository.updateSessionFields(sessionId, updates).compose(v -> repository.getSessionById(sessionId)).onSuccess(updatedSession -> {
                com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent(com.campusskills.shared.constants.WebSocketEventType.PAYMENT_CONFIRMED, updatedSession);
                profileRepository.findByUserId(session.getTeacherId()).onSuccess(teacherProfile -> {
                    String teacherName = teacherProfile != null ? teacherProfile.getName() : "Teacher";
                    String topic = session.getTopic() != null ? session.getTopic() : "Session";
                    String msgToTeacher = "Payment confirmed for " + topic + ".\nPlease leave a review.";
                    String msgToStudent = teacherName + " confirmed payment for " + topic + ".\nPlease leave a review.";
                    sendNotification(session.getTeacherId(), com.campusskills.shared.constants.NotificationType.PAYMENT_CONFIRMED, "Payment Complete", msgToTeacher, "SESSION", sessionId);
                    sendNotification(session.getStudentId(), com.campusskills.shared.constants.NotificationType.PAYMENT_CONFIRMED, "Payment Complete", msgToStudent, "SESSION", sessionId);
                });
            }).mapEmpty();
        });
    }

    public Future<JsonObject> getPaymentInfo(String sessionId, String userId) {
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) return Future.failedFuture("Session not found");
            if (!userId.equals(session.getStudentId())) {
                return Future.failedFuture("Only the student can request payment info");
            }
            if (session.getStatus() != SessionStatus.COMPLETED) {
                return Future.failedFuture("Session must be COMPLETED to get payment info");
            }
            if (session.getSwapGroupId() != null && !session.getSwapGroupId().isEmpty()) {
                return Future.failedFuture("Swap sessions do not have payment info");
            }

            return profileRepository.findByUserId(session.getTeacherId()).compose(profile -> {
                if (profile == null || profile.getUpi() == null || profile.getUpi().trim().isEmpty()) {
                    return Future.failedFuture("Teacher does not have a UPI ID registered");
                }
                return Future.succeededFuture(new JsonObject().put("upiId", profile.getUpi()));
            });
        });
    }

    public Future<Void> cancelSession(String sessionId, String userId, String reason) {
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) return Future.failedFuture("Session not found");
            if (!userId.equals(session.getTeacherId()) && !userId.equals(session.getStudentId())) {
                return Future.failedFuture("Not authorized to cancel this session");
            }
            if (session.getStatus() != SessionStatus.SCHEDULED) {
                return Future.failedFuture("Only SCHEDULED sessions can be cancelled");
            }
            if (Boolean.TRUE.equals(session.getTeacherConfirmedCompletion()) || Boolean.TRUE.equals(session.getStudentConfirmedCompletion())) {
                return Future.failedFuture("Cannot cancel a session once completion confirmation has been started");
            }

            JsonObject updates = new JsonObject()
                .put("status", SessionStatus.CANCELLED.name())
                .put("cancelledBy", userId)
                .put("cancellationReason", reason);
            return repository.updateSessionFields(sessionId, updates).compose(v -> {
                com.campusskills.modules.users.repositories.UserProfileRepository profileRepo = new com.campusskills.modules.users.repositories.UserProfileRepository();
                return profileRepo.findByUserId(session.getTeacherId()).compose(teacherProfile -> {
                    String teacherName = teacherProfile != null ? teacherProfile.getName() : "Teacher";
                    return profileRepo.findByUserId(session.getStudentId()).compose(studentProfile -> {
                        String studentName = studentProfile != null ? studentProfile.getName() : "Student";
                        String topic = session.getTopic() != null ? session.getTopic() : "Session";
                        
                        boolean isTeacherCancelling = userId.equals(session.getTeacherId());
                        String cancellerForTeacher = isTeacherCancelling ? "You" : studentName;
                        String cancellerForStudent = isTeacherCancelling ? teacherName : "You";
                        
                        String msgToTeacher = topic + " Session with " + studentName + " was cancelled.\n" +
                                              "Cancelled by: " + cancellerForTeacher + "\n" +
                                              "Reason: " + (reason != null ? reason : "Other");
                                              
                        String msgToStudent = topic + " Session with " + teacherName + " was cancelled.\n" +
                                              "Cancelled by: " + cancellerForStudent + "\n" +
                                              "Reason: " + (reason != null ? reason : "Other");
                        
                        sendNotification(session.getTeacherId(), com.campusskills.shared.constants.NotificationType.SESSION_CANCELLED, "Session Cancelled", msgToTeacher, "SESSION", sessionId);
                        sendNotification(session.getStudentId(), com.campusskills.shared.constants.NotificationType.SESSION_CANCELLED, "Session Cancelled", msgToStudent, "SESSION", sessionId);
                        emitSessionEvent(sessionId, "SESSION_CANCELLED", new JsonObject().put("reason", reason));
                        return Future.succeededFuture();
                    });
                });
            }).mapEmpty();
        });
    }

    private void createAndBroadcastSystemMessage(String chatId, String text, String sessionId, String markerId, Long sessionScheduledStart, String sessionTopic) {
        if (chatId == null || chatId.trim().isEmpty()) return;
        com.campusskills.modules.messages.repositories.MessageRepository msgRepo = new com.campusskills.modules.messages.repositories.MessageRepository();
        com.campusskills.modules.messages.models.Message message = new com.campusskills.modules.messages.models.Message();
        message.setChatId(chatId);
        message.setSenderId("system");
        message.setMessage(text);
        message.setType(com.campusskills.shared.constants.MessageType.SYSTEM);
        message.setSessionId(sessionId);
        message.setMarkerId(markerId);
        message.setSessionScheduledStart(sessionScheduledStart);
        message.setSessionTopic(sessionTopic);
        message.setCreatedAt(System.currentTimeMillis());
        message.setIsRead(false);
        message.setIsDelivered(true);

        msgRepo.createMessage(message).onSuccess(id -> {
            message.setId(id);
            msgRepo.getChatById(chatId).onSuccess(chat -> {
                if (chat != null) {
                    io.vertx.core.json.JsonArray participantsArray = chat.getJsonArray("participants");
                    java.util.List<String> participantList = participantsArray.stream()
                        .map(Object::toString)
                        .collect(java.util.stream.Collectors.toList());
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastNewMessage(message, participantList);
                }
            });
        });
    }
}
