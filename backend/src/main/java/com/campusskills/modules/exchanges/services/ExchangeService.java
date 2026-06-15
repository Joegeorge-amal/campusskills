package com.campusskills.modules.exchanges.services;

import com.campusskills.modules.exchanges.models.Exchange;
import com.campusskills.modules.exchanges.repositories.ExchangeRepository;
import com.campusskills.modules.sessions.models.Session;
import com.campusskills.modules.sessions.repositories.SessionRepository;
import com.campusskills.shared.constants.ExchangeStatus;
import com.campusskills.shared.constants.SessionStatus;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.campusskills.web.websockets.ConnectionManager;
import com.campusskills.web.websockets.WebSocketMessageBuilder;
import com.campusskills.shared.constants.WebSocketEventType;

public class ExchangeService {
    private static final Logger log = LoggerFactory.getLogger(ExchangeService.class);

    private final ExchangeRepository repository;
    private final SessionRepository sessionRepository;
    private final com.campusskills.modules.listings.repositories.ListingRepository listingRepository;

    private final com.campusskills.modules.users.repositories.UserProfileRepository userProfileRepository;
    private final io.vertx.core.eventbus.EventBus eventBus;
    private final com.campusskills.modules.chats.services.ChatService chatService;

    public ExchangeService(io.vertx.core.eventbus.EventBus eventBus) {
        this.repository = new ExchangeRepository();
        this.sessionRepository = new SessionRepository();
        this.listingRepository = new com.campusskills.modules.listings.repositories.ListingRepository();
        this.userProfileRepository = new com.campusskills.modules.users.repositories.UserProfileRepository();
        this.chatService = new com.campusskills.modules.chats.services.ChatService(
                new com.campusskills.modules.chats.repositories.ChatRepository(),
                new com.campusskills.modules.messages.repositories.MessageRepository(),
                new com.campusskills.modules.users.repositories.UserRepository()
        );
        this.eventBus = eventBus;
    }

    private void sendNotification(String userId, String type, String title, String message, String sourceType, String sourceId) {
        if (eventBus == null) return;
        JsonObject payload = new JsonObject()
            .put("userId", userId)
            .put("type", type)
            .put("title", title)
            .put("message", message)
            .put("sourceType", sourceType)
            .put("sourceId", sourceId);
        eventBus.send("internal.notification.create", payload);
    }

    private void broadcastWebSocketEvent(String userId, WebSocketEventType type, JsonObject payload) {
        try {
            JsonObject event = new WebSocketMessageBuilder()
                    .type(type)
                    .payload(payload)
                    .build();
            ConnectionManager.broadcastToUser(userId, event);
        } catch (Exception e) {
            // Ignored
        }
    }

    public Future<String> createExchange(Exchange request) {
        if (request.getInitiatorId() != null && request.getInitiatorId().equals(request.getReceiverId())) {
            return Future.failedFuture("You cannot request an exchange from yourself.");
        }
        if (request.getReceiverId() == null) {
            return Future.failedFuture("Receiver ID is missing.");
        }

        return repository.hasActiveRequestForListing(request.getInitiatorId(), request.getListingId()).compose(hasActive -> {
            if (hasActive) {
                return Future.failedFuture("You already have an active request for this listing.");
            }
            return userProfileRepository.findByUserId(request.getInitiatorId()).compose(initiatorProfile -> {
                if (initiatorProfile != null && initiatorProfile.getBlockedUsers().contains(request.getReceiverId())) {
                    return Future.<String>failedFuture("FORBIDDEN");
                }
                return userProfileRepository.findByUserId(request.getReceiverId()).compose(receiverProfile -> {
                    if (receiverProfile != null && receiverProfile.getBlockedUsers().contains(request.getInitiatorId())) {
                        return Future.<String>failedFuture("FORBIDDEN");
                    }
                    
                    request.setStatus(ExchangeStatus.REQUESTED);
                return repository.createRequest(request).onSuccess(id -> {
                    // Increment the request count on the listing
                    listingRepository.incrementRequestCount(request.getListingId())
                        .onFailure(err -> log.error("Failed to increment request count", err));

                    sendNotification(
                        request.getReceiverId(),
                        "EXCHANGE_REQUEST_RECEIVED",
                        "New Exchange Request",
                        "You have received a new exchange request.",
                        "EXCHANGE",
                        id
                    );

                    JsonObject wsPayload = JsonObject.mapFrom(request);
                    JsonObject profileData = new JsonObject()
                        .put("name", initiatorProfile != null ? initiatorProfile.getName() : "Unknown User")
                        .put("avatarImg", initiatorProfile != null ? initiatorProfile.getProfilePicture() : null);
                    if (initiatorProfile != null && initiatorProfile.getAvatarColor() != null) {
                        try {
                            profileData.put("avatarColor", JsonObject.mapFrom(initiatorProfile.getAvatarColor()));
                        } catch(Exception e) {
                            if (initiatorProfile.getAvatarColor() instanceof java.util.Map) {
                                profileData.put("avatarColor", new JsonObject((java.util.Map<String, Object>)initiatorProfile.getAvatarColor()));
                            }
                        }
                    }
                    wsPayload.put("otherUser", profileData);
                    wsPayload.put("id", id);
                    broadcastWebSocketEvent(request.getReceiverId(), WebSocketEventType.NEW_REQUEST, wsPayload);

                    JsonObject wsPayloadForInitiator = JsonObject.mapFrom(request);
                    JsonObject receiverProfileData = new JsonObject()
                        .put("name", receiverProfile != null ? receiverProfile.getName() : "Unknown User")
                        .put("avatarImg", receiverProfile != null ? receiverProfile.getProfilePicture() : null);
                    if (receiverProfile != null && receiverProfile.getAvatarColor() != null) {
                        try {
                            receiverProfileData.put("avatarColor", JsonObject.mapFrom(receiverProfile.getAvatarColor()));
                        } catch(Exception e) {
                            if (receiverProfile.getAvatarColor() instanceof java.util.Map) {
                                receiverProfileData.put("avatarColor", new JsonObject((java.util.Map<String, Object>)receiverProfile.getAvatarColor()));
                            }
                        }
                    }
                    wsPayloadForInitiator.put("otherUser", receiverProfileData);
                    wsPayloadForInitiator.put("id", id);
                    broadcastWebSocketEvent(request.getInitiatorId(), WebSocketEventType.NEW_REQUEST, wsPayloadForInitiator);
                });
                });
            });
        });
    }

    public Future<Void> acceptExchange(String exchangeId, JsonObject payload) {
        return repository.findById(exchangeId).compose(exchange -> {
            if (exchange == null) {
                return Future.failedFuture("Exchange not found");
            }
            if (exchange.getStatus() != ExchangeStatus.REQUESTED) {
                return Future.failedFuture("Exchange is not REQUESTED");
            }

            // Update to ACCEPTED
            return repository.updateStatus(exchangeId, ExchangeStatus.ACCEPTED).compose(updated -> {
                sendNotification(
                    exchange.getInitiatorId(),
                    "EXCHANGE_REQUEST_ACCEPTED",
                    "Exchange Accepted",
                    "Your exchange request was accepted.",
                    "EXCHANGE",
                    exchangeId
                );


                // Create a chat for the exchange if it doesn't exist
                com.campusskills.modules.chats.models.Chat newChat = new com.campusskills.modules.chats.models.Chat();
                newChat.setSourceType(com.campusskills.shared.constants.ChatSourceType.EXCHANGE_REQUEST);
                newChat.setSourceId(exchangeId);
                newChat.setParticipants(java.util.Arrays.asList(exchange.getInitiatorId(), exchange.getReceiverId()));
                newChat.setStatus(com.campusskills.shared.constants.ChatStatus.ACTIVE);
                
                chatService.createChat(newChat, exchange.getReceiverId())
                    .onFailure(err -> {
                        if (!"CHAT_ALREADY_EXISTS".equals(err.getMessage())) {
                            log.error("Failed to create chat for exchange", err);
                        }
                    });

                return listingRepository.findById(exchange.getListingId()).compose(listing -> {
                    List<Future<String>> sessionFutures = new ArrayList<>();
                    
                    long durationMs = (exchange.getPreferredDurationMinutes() != null ? exchange.getPreferredDurationMinutes() : 60) * 60 * 1000L;
                    
                    if (exchange.getType() == com.campusskills.shared.constants.ExchangeType.SWAP) {
                        Number firstStartNum = payload.getNumber("firstSessionStart");
                        Number secondStartNum = payload.getNumber("secondSessionStart");
                        Long firstSessionStart = firstStartNum != null ? firstStartNum.longValue() : null;
                        Long secondSessionStart = secondStartNum != null ? secondStartNum.longValue() : null;
                        Boolean iGoFirst = payload.getBoolean("iGoFirst", true);
                        
                        if (firstSessionStart != null && secondSessionStart != null) {
                            String firstTeacherId = iGoFirst ? exchange.getReceiverId() : exchange.getInitiatorId();
                            String firstStudentId = iGoFirst ? exchange.getInitiatorId() : exchange.getReceiverId();
                            
                            // Session A
                            Session sessionA = new Session();
                            sessionA.setExchangeId(exchangeId);
                            sessionA.setTeacherId(firstTeacherId);
                            sessionA.setStudentId(firstStudentId);
                            sessionA.setStatus(SessionStatus.SCHEDULED);
                            sessionA.setScheduledStart(firstSessionStart);
                            sessionA.setScheduledEnd(firstSessionStart + durationMs);
                            sessionA.setListingId(exchange.getListingId());
                            
                            // Session B
                            Session sessionB = new Session();
                            sessionB.setExchangeId(exchangeId);
                            sessionB.setTeacherId(firstStudentId);
                            sessionB.setStudentId(firstTeacherId);
                            sessionB.setStatus(SessionStatus.SCHEDULED);
                            sessionB.setScheduledStart(secondSessionStart);
                            sessionB.setScheduledEnd(secondSessionStart + durationMs);
                            sessionB.setListingId(exchange.getListingId());
                            
                            sessionFutures.add(sessionRepository.createSession(sessionA).onSuccess(sessId -> {
                                sendNotification(sessionA.getTeacherId(), "SESSION_ACCEPTED", "Session Accepted", "A new session has been scheduled.", "SESSION", sessId);
                                sendNotification(sessionA.getStudentId(), "SESSION_ACCEPTED", "Session Accepted", "A new session has been scheduled.", "SESSION", sessId);
                            }));
                            sessionFutures.add(sessionRepository.createSession(sessionB).onSuccess(sessId -> {
                                sendNotification(sessionB.getTeacherId(), "SESSION_ACCEPTED", "Session Accepted", "A new session has been scheduled.", "SESSION", sessId);
                                sendNotification(sessionB.getStudentId(), "SESSION_ACCEPTED", "Session Accepted", "A new session has been scheduled.", "SESSION", sessId);
                            }));
                        }
                    } else {
                        // Tutoring
                        Number sessionStartNum = payload.getNumber("firstSessionStart");
                        Long sessionStart = sessionStartNum != null ? sessionStartNum.longValue() : null;
                        if (sessionStart != null) {
                            String teacherId = exchange.getReceiverId();
                            String studentId = exchange.getInitiatorId();
                            
                            if (listing != null && listing.getListingType() == com.campusskills.modules.listings.models.ListingType.LEARN) {
                                teacherId = exchange.getInitiatorId();
                                studentId = exchange.getReceiverId();
                            }
                            
                            Session session = new Session();
                            session.setExchangeId(exchangeId);
                            session.setTeacherId(teacherId);
                            session.setStudentId(studentId);
                            session.setStatus(SessionStatus.SCHEDULED);
                            session.setScheduledStart(sessionStart);
                            session.setScheduledEnd(sessionStart + durationMs);
                            session.setListingId(exchange.getListingId());
                            
                            final String fTeacherId = teacherId;
                            final String fStudentId = studentId;
                            
                            sessionFutures.add(sessionRepository.createSession(session).onSuccess(sessId -> {
                                sendNotification(fTeacherId, "SESSION_ACCEPTED", "Session Accepted", "A new session has been scheduled.", "SESSION", sessId);
                                if (!fTeacherId.equals(fStudentId)) {
                                    sendNotification(fStudentId, "SESSION_ACCEPTED", "Session Accepted", "A new session has been scheduled.", "SESSION", sessId);
                                }
                            }));
                        }
                    }
                    
                    if (sessionFutures.isEmpty()) {
                        return Future.succeededFuture((Void) null);
                    }
                    return Future.all(sessionFutures).mapEmpty();
                }).onSuccess(v -> {
                    JsonObject wsPayload = JsonObject.mapFrom(exchange);
                    wsPayload.put("id", exchangeId);
                    wsPayload.put("status", ExchangeStatus.ACCEPTED.name());
                    broadcastWebSocketEvent(exchange.getInitiatorId(), WebSocketEventType.REQUEST_ACCEPTED, wsPayload);
                    if (!exchange.getInitiatorId().equals(exchange.getReceiverId())) {
                        broadcastWebSocketEvent(exchange.getReceiverId(), WebSocketEventType.REQUEST_ACCEPTED, wsPayload);
                    }
                });
            });
            // TODO: Auto-reject/reschedule overlapping competing requests for First-to-Accept queue
        });
    }

    public Future<Void> rejectExchange(String exchangeId) {
        return repository.findById(exchangeId).compose(exchange -> {
            if (exchange == null) {
                return Future.failedFuture("Exchange not found");
            }
            if (exchange.getStatus() != ExchangeStatus.REQUESTED) {
                return Future.failedFuture("Exchange is not REQUESTED");
            }

            return repository.updateStatus(exchangeId, ExchangeStatus.REJECTED).compose(v -> {
                JsonObject wsPayload = JsonObject.mapFrom(exchange);
                wsPayload.put("id", exchangeId);
                wsPayload.put("status", ExchangeStatus.REJECTED.name());
                broadcastWebSocketEvent(exchange.getInitiatorId(), WebSocketEventType.REQUEST_REJECTED, wsPayload);
                return Future.<Void>succeededFuture();
            });
        });
    }

    public Future<Void> cancelExchange(String exchangeId, String userId) {
        return repository.findById(exchangeId).compose(exchange -> {
            if (exchange == null) {
                return Future.failedFuture("Exchange not found");
            }
            if (!exchange.getInitiatorId().equals(userId)) {
                return Future.failedFuture("Only the initiator can cancel the request");
            }
            if (exchange.getStatus() != ExchangeStatus.REQUESTED) {
                return Future.failedFuture("Exchange is not REQUESTED");
            }

            return repository.updateStatus(exchangeId, ExchangeStatus.CANCELLED).compose(v -> {
                JsonObject wsPayload = JsonObject.mapFrom(exchange);
                wsPayload.put("id", exchangeId);
                wsPayload.put("status", ExchangeStatus.CANCELLED.name());
                broadcastWebSocketEvent(exchange.getReceiverId(), WebSocketEventType.REQUEST_CANCELLED, wsPayload);
                return Future.<Void>succeededFuture();
            });
        });
    }

    public Future<List<Exchange>> getMyExchanges(String userId) {
        return repository.findRequestsForUser(userId);
    }
}
