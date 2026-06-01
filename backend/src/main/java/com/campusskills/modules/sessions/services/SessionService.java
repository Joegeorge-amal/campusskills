package com.campusskills.modules.sessions.services;

import com.campusskills.modules.sessions.models.Session;
import com.campusskills.modules.sessions.repositories.SessionRepository;
import com.campusskills.modules.exchangerequests.repositories.ExchangeRequestRepository;
import com.campusskills.modules.chats.repositories.ChatRepository;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import com.campusskills.shared.constants.SessionStatus;
import com.campusskills.shared.constants.MessageType;
import com.campusskills.shared.constants.RequestStatus;

import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;
import java.util.Arrays;
import java.util.Collections;
import java.util.stream.Collectors;

import io.vertx.core.eventbus.EventBus;

public class SessionService {

    private final EventBus eventBus;
    private final SessionRepository repository;
    private final ExchangeRequestRepository exchangeRepository;
    private final ChatRepository chatRepository;

    public SessionService(EventBus eventBus, SessionRepository repository, ExchangeRequestRepository exchangeRepository, ChatRepository chatRepository) {
        this.eventBus = eventBus;
        this.repository = repository;
        this.exchangeRepository = exchangeRepository;
        this.chatRepository = chatRepository;
    }

    private void publishSystemMessage(String chatId, MessageType type, String sessionId, String messageText) {
        if (chatId == null) return;
        JsonObject msg = new JsonObject()
                .put("chatId", chatId)
                .put("senderId", "SYSTEM")
                .put("message", messageText)
                .put("type", type.name())
                .put("sessionId", sessionId);
        eventBus.send("internal.message.create", msg);
    }

    public Future<String> createSession(Session session, String requesterId) {
        if (session.getExchangeId() == null) {
            return Future.failedFuture("exchangeId is required");
        }
        if (requesterId == null || requesterId.trim().isEmpty()) {
            return Future.failedFuture("requesterId is required");
        }

        return exchangeRepository.findById(session.getExchangeId()).compose(exchange -> {
            if (exchange == null) {
                return Future.failedFuture("EXCHANGE_NOT_FOUND");
            }
            if (!requesterId.equals(exchange.getSenderId()) && !requesterId.equals(exchange.getReceiverId())) {
                return Future.failedFuture("UNAUTHORIZED: User is not part of this exchange");
            }
            if (exchange.getStatus() != RequestStatus.ACCEPTED) {
                return Future.failedFuture("FORBIDDEN: Exchange must be ACCEPTED before proposing a session");
            }

            return chatRepository.findById(exchange.getChatId()).compose(chat -> {
                System.out.println("[DEBUG-LIFECYCLE] --- Session Creation Validation ---");
                if (chat == null) {
                    System.out.println("[DEBUG-LIFECYCLE] linked chatId: NOT FOUND");
                    return Future.failedFuture("CHAT_NOT_FOUND");
                }
                
                System.out.println("[DEBUG-LIFECYCLE] linked chatId: " + chat.getId());
                System.out.println("[DEBUG-LIFECYCLE] linked chat status detected during validation: " + chat.getStatus());

                if (chat.getStatus() != com.campusskills.shared.constants.ChatStatus.ACTIVE) {
                    return Future.failedFuture("FORBIDDEN: Linked chat is not ACTIVE");
                }

                // Derive backend state
                session.setOrganizerId(requesterId);
                List<String> participants = Arrays.asList(exchange.getSenderId(), exchange.getReceiverId());
                participants = participants.stream().distinct().collect(Collectors.toList());
                session.setParticipants(participants);
                session.setListingId(exchange.getListingId());
                session.setChatId(chat.getId());
                
                session.setStatus(SessionStatus.PROPOSED);
                session.setConfirmedBy(new HashSet<>());

                return repository.createSession(session).onSuccess(id -> {
                    session.setId(id);
                    if (session.getChatId() != null) {
                        publishSystemMessage(session.getChatId(), MessageType.SESSION_PROPOSED, id, "A session meeting time has been proposed.");
                    }
                    System.out.println(String.format("[LIFECYCLE] Session CREATED -> PROPOSED | sessionId=%s exchangeId=%s chatId=%s authenticatedUserId=%s", id, session.getExchangeId(), session.getChatId(), requesterId));
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent("SESSION_UPDATE", session);
                });
            });
        });
    }

    public Future<JsonObject> getUserSessions(String userId, int page, int limit) {
        if (userId == null || userId.trim().isEmpty()) {
            return Future.failedFuture("userId is required");
        }
        int skip = (page - 1) * limit;
        System.out.println("[RETRIEVAL] User " + userId + " requested sessions | page: " + page + " limit: " + limit);
        
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

    public Future<Session> getSessionByIdAuth(String sessionId, String requesterId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return Future.failedFuture("sessionId is required");
        }
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) {
                return Future.failedFuture("SESSION_NOT_FOUND");
            }
            if (session.getParticipants() == null || !session.getParticipants().contains(requesterId)) {
                return Future.failedFuture("UNAUTHORIZED: Only participants can view the session");
            }
            return Future.succeededFuture(session);
        });
    }

    public Future<Void> acceptSession(String sessionId, String requesterId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return Future.failedFuture("sessionId is required");
        }
        if (requesterId == null || requesterId.trim().isEmpty()) {
            return Future.failedFuture("requesterId is required");
        }
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) {
                return Future.failedFuture("SESSION_NOT_FOUND");
            }
            if (session.getParticipants() == null || !session.getParticipants().contains(requesterId)) {
                return Future.failedFuture("UNAUTHORIZED: Not a participant");
            }
            if (requesterId.equals(session.getOrganizerId())) {
                return Future.failedFuture("UNAUTHORIZED: The organizer cannot accept their own proposal");
            }
            if (session.getStatus() != SessionStatus.PROPOSED) {
                return Future.failedFuture("Session must be PROPOSED to be accepted");
            }
            JsonObject updates = new JsonObject().put("status", SessionStatus.SCHEDULED.name());
            return repository.updateSessionFields(sessionId, updates).compose(updated -> {
                if (updated) {
                    session.setStatus(SessionStatus.SCHEDULED);
                    if (session.getChatId() != null) {
                        publishSystemMessage(session.getChatId(), MessageType.SESSION_ACCEPTED, sessionId, "Session proposal has been accepted.");
                    }
                    System.out.println(String.format("[LIFECYCLE] Session PROPOSED -> SCHEDULED | sessionId=%s chatId=%s authenticatedUserId=%s", sessionId, session.getChatId(), requesterId));
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent("SESSION_UPDATE", session);
                    return Future.succeededFuture();
                } else {
                    return Future.failedFuture("SESSION_NOT_FOUND");
                }
            });
        });
    }

    public Future<Void> rejectSession(String sessionId, String requesterId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return Future.failedFuture("sessionId is required");
        }
        if (requesterId == null || requesterId.trim().isEmpty()) {
            return Future.failedFuture("requesterId is required");
        }
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) {
                return Future.failedFuture("SESSION_NOT_FOUND");
            }
            if (session.getParticipants() == null || !session.getParticipants().contains(requesterId)) {
                return Future.failedFuture("UNAUTHORIZED: Not a participant");
            }
            if (requesterId.equals(session.getOrganizerId())) {
                return Future.failedFuture("UNAUTHORIZED: The organizer cannot reject their own proposal");
            }
            if (session.getStatus() != SessionStatus.PROPOSED) {
                return Future.failedFuture("Session must be PROPOSED to be rejected");
            }
            JsonObject updates = new JsonObject().put("status", SessionStatus.REJECTED.name());
            return repository.updateSessionFields(sessionId, updates).compose(updated -> {
                if (updated) {
                    session.setStatus(SessionStatus.REJECTED);
                    if (session.getChatId() != null) {
                        publishSystemMessage(session.getChatId(), MessageType.SESSION_REJECTED, sessionId, "Session proposal has been declined.");
                    }
                    System.out.println(String.format("[LIFECYCLE] Session PROPOSED -> REJECTED | sessionId=%s chatId=%s authenticatedUserId=%s", sessionId, session.getChatId(), requesterId));
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent("SESSION_UPDATE", session);
                    return Future.succeededFuture();
                } else {
                    return Future.failedFuture("SESSION_NOT_FOUND");
                }
            });
        });
    }

    public Future<Void> cancelSession(String sessionId, String requesterId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return Future.failedFuture("sessionId is required");
        }
        if (requesterId == null || requesterId.trim().isEmpty()) {
            return Future.failedFuture("requesterId is required");
        }
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) {
                return Future.failedFuture("SESSION_NOT_FOUND");
            }
            if (session.getParticipants() == null || !session.getParticipants().contains(requesterId)) {
                return Future.failedFuture("UNAUTHORIZED: Only participants can cancel the session");
            }
            if (session.getStatus() != SessionStatus.PROPOSED && session.getStatus() != SessionStatus.SCHEDULED) {
                return Future.failedFuture("Only PROPOSED or SCHEDULED sessions can be cancelled");
            }
            JsonObject updates = new JsonObject().put("status", SessionStatus.CANCELLED.name());
            return repository.updateSessionFields(sessionId, updates).compose(updated -> {
                if (updated) {
                    session.setStatus(SessionStatus.CANCELLED);
                    if (session.getChatId() != null) {
                        publishSystemMessage(session.getChatId(), MessageType.SESSION_CANCELLED, sessionId, "Session has been cancelled.");
                    }
                    System.out.println(String.format("[LIFECYCLE] Session -> CANCELLED | sessionId=%s chatId=%s authenticatedUserId=%s", sessionId, session.getChatId(), requesterId));
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent("SESSION_UPDATE", session);
                    return Future.succeededFuture();
                } else {
                    return Future.failedFuture("SESSION_NOT_FOUND");
                }
            });
        });
    }

    public Future<Void> completeSession(String sessionId, String requesterId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return Future.failedFuture("sessionId is required");
        }
        if (requesterId == null || requesterId.trim().isEmpty()) {
            return Future.failedFuture("requesterId is required");
        }
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) {
                return Future.failedFuture("SESSION_NOT_FOUND");
            }
            if (session.getParticipants() == null || !session.getParticipants().contains(requesterId)) {
                return Future.failedFuture("UNAUTHORIZED: Only participants can complete the session");
            }
            if (session.getStatus() != SessionStatus.SCHEDULED) {
                return Future.failedFuture("Session must be SCHEDULED to be completed");
            }
            JsonObject updates = new JsonObject()
                    .put("status", SessionStatus.COMPLETED.name());
            return repository.updateSessionFields(sessionId, updates).compose(updated -> {
                if (updated) {
                    session.setStatus(SessionStatus.COMPLETED);
                    if (session.getChatId() != null) {
                        publishSystemMessage(session.getChatId(), MessageType.SYSTEM, sessionId, "Session marked as completed. Please confirm.");
                    }
                    System.out.println(String.format("[LIFECYCLE] Session SCHEDULED -> COMPLETED | sessionId=%s chatId=%s authenticatedUserId=%s", sessionId, session.getChatId(), requesterId));
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent("SESSION_UPDATE", session);
                    return Future.succeededFuture();
                } else {
                    return Future.failedFuture("SESSION_NOT_FOUND");
                }
            });
        });
    }

    public Future<Void> confirmSession(String sessionId, String requesterId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return Future.failedFuture("sessionId is required");
        }
        if (requesterId == null || requesterId.trim().isEmpty()) {
            return Future.failedFuture("requesterId is required");
        }
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) {
                return Future.failedFuture("SESSION_NOT_FOUND");
            }
            if (session.getParticipants() == null || !session.getParticipants().contains(requesterId)) {
                return Future.failedFuture("UNAUTHORIZED: Only participants can confirm the session");
            }
            if (session.getStatus() != SessionStatus.COMPLETED) {
                return Future.failedFuture("Session must be COMPLETED to be confirmed");
            }
            
            Set<String> confirmedBy = session.getConfirmedBy();
            if (confirmedBy == null) {
                confirmedBy = new HashSet<>();
            }
            confirmedBy.add(requesterId);
            
            io.vertx.core.json.JsonArray confirmedArray = new io.vertx.core.json.JsonArray();
            confirmedBy.forEach(confirmedArray::add);

            JsonObject updates = new JsonObject().put("confirmedBy", confirmedArray);
            
            final Set<String> finalConfirmedBy = confirmedBy;

            return repository.updateSessionFields(sessionId, updates).compose(updated -> {
                if (updated) {
                    session.setConfirmedBy(finalConfirmedBy);
                    if (finalConfirmedBy.size() == session.getParticipants().size()) {
                        if (session.getChatId() != null) {
                            publishSystemMessage(session.getChatId(), MessageType.SESSION_CONFIRMED, sessionId, "Session has been mutually confirmed by all participants.");
                        }
                        System.out.println(String.format("[LIFECYCLE] Session COMPLETED -> CONFIRMED | sessionId=%s chatId=%s authenticatedUserId=%s", sessionId, session.getChatId(), requesterId));
                    } else {
                         if (session.getChatId() != null) {
                            publishSystemMessage(session.getChatId(), MessageType.SYSTEM, sessionId, "A participant has confirmed the session.");
                        }
                        System.out.println(String.format("[LIFECYCLE] Session COMPLETED (Participant Confirmation) | sessionId=%s chatId=%s authenticatedUserId=%s", sessionId, session.getChatId(), requesterId));
                    }
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent("SESSION_UPDATE", session);
                    return Future.succeededFuture();
                } else {
                    return Future.failedFuture("SESSION_NOT_FOUND");
                }
            });
        });
    }

    public Future<Void> disputeSession(String sessionId, String requesterId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return Future.failedFuture("sessionId is required");
        }
        if (requesterId == null || requesterId.trim().isEmpty()) {
            return Future.failedFuture("requesterId is required");
        }
        return repository.getSessionById(sessionId).compose(session -> {
            if (session == null) {
                return Future.failedFuture("SESSION_NOT_FOUND");
            }
            if (session.getParticipants() == null || !session.getParticipants().contains(requesterId)) {
                return Future.failedFuture("UNAUTHORIZED: Only participants can dispute the session");
            }
            if (session.getStatus() != SessionStatus.SCHEDULED && session.getStatus() != SessionStatus.COMPLETED) {
                return Future.failedFuture("Only SCHEDULED or COMPLETED sessions can be disputed");
            }
            JsonObject updates = new JsonObject()
                    .put("status", SessionStatus.DISPUTED.name());
            return repository.updateSessionFields(sessionId, updates).compose(updated -> {
                if (updated) {
                    session.setStatus(SessionStatus.DISPUTED);
                    if (session.getChatId() != null) {
                        publishSystemMessage(session.getChatId(), MessageType.SYSTEM, sessionId, "Session has been DISPUTED. An admin will review.");
                    }
                    System.out.println(String.format("[LIFECYCLE] Session -> DISPUTED | sessionId=%s chatId=%s authenticatedUserId=%s", sessionId, session.getChatId(), requesterId));
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent("SESSION_UPDATE", session);
                    return Future.succeededFuture();
                } else {
                    return Future.failedFuture("SESSION_NOT_FOUND");
                }
            });
        });
    }
}
