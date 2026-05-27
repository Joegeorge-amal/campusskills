package com.campusskills.modules.sessions.services;

import com.campusskills.modules.sessions.models.Session;
import com.campusskills.modules.sessions.repositories.SessionRepository;
import com.campusskills.modules.exchanges.repositories.ExchangeRepository;
import com.campusskills.modules.chats.repositories.ChatRepository;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import com.campusskills.shared.constants.SessionStatus;
import com.campusskills.shared.constants.MessageType;
import com.campusskills.shared.constants.ExchangeStatus;

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
    private final ExchangeRepository exchangeRepository;
    private final ChatRepository chatRepository;

    public SessionService(EventBus eventBus, SessionRepository repository, ExchangeRepository exchangeRepository, ChatRepository chatRepository) {
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

        return exchangeRepository.getExchangeById(session.getExchangeId()).compose(exchange -> {
            if (exchange == null) {
                return Future.failedFuture("EXCHANGE_NOT_FOUND");
            }
            if (!requesterId.equals(exchange.getRequesterId()) && !requesterId.equals(exchange.getReceiverId())) {
                return Future.failedFuture("UNAUTHORIZED: User is not part of this exchange");
            }
            if (exchange.getStatus() != ExchangeStatus.ACCEPTED) {
                return Future.failedFuture("FORBIDDEN: Exchange must be ACCEPTED before proposing a session");
            }

            return chatRepository.getChatByExchangeId(session.getExchangeId()).compose(chat -> {
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
                List<String> participants = Arrays.asList(exchange.getRequesterId(), exchange.getReceiverId());
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
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent("SESSION_PROPOSED", session);
                });
            });
        });
    }

    public Future<List<Session>> getUserSessions(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return Future.failedFuture("userId is required");
        }
        return repository.fetchUserSessions(userId);
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
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent("SESSION_ACCEPTED", session);
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
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent("SESSION_REJECTED", session);
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
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent("SESSION_CANCELLED", session);
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
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent("SESSION_UPDATED", session);
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
                    } else {
                         if (session.getChatId() != null) {
                            publishSystemMessage(session.getChatId(), MessageType.SYSTEM, sessionId, "A participant has confirmed the session.");
                        }
                    }
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent("SESSION_CONFIRMED", session);
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
                    com.campusskills.web.websockets.MessageBroadcaster.broadcastSessionEvent("SESSION_DISPUTED", session);
                    return Future.succeededFuture();
                } else {
                    return Future.failedFuture("SESSION_NOT_FOUND");
                }
            });
        });
    }
}
