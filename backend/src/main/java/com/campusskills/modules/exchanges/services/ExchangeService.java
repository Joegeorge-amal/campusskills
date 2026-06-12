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

public class ExchangeService {

    private final ExchangeRepository repository;
    private final SessionRepository sessionRepository;
    private final com.campusskills.modules.listings.repositories.ListingRepository listingRepository;

    private final io.vertx.core.eventbus.EventBus eventBus;

    public ExchangeService(io.vertx.core.eventbus.EventBus eventBus) {
        this.repository = new ExchangeRepository();
        this.sessionRepository = new SessionRepository();
        this.listingRepository = new com.campusskills.modules.listings.repositories.ListingRepository();
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

    public Future<String> createExchange(Exchange request) {
        request.setStatus(ExchangeStatus.REQUESTED);
        return repository.createRequest(request).onSuccess(id -> {
            sendNotification(
                request.getReceiverId(),
                "NEW_EXCHANGE_REQUEST",
                "New Exchange Request",
                "You have received a new exchange request.",
                "EXCHANGE",
                id
            );
        });
    }

    public Future<Void> acceptExchange(String exchangeId) {
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
                    "EXCHANGE_ACCEPTED",
                    "Exchange Accepted",
                    "Your exchange request was accepted.",
                    "EXCHANGE",
                    exchangeId
                );

                if (exchange.getProposedSessions() != null) {
                    return listingRepository.findById(exchange.getListingId()).compose(listing -> {
                        List<Future<String>> sessionFutures = new ArrayList<>();
                        for (JsonObject proposed : exchange.getProposedSessions()) {
                            Session session = new Session();
                            session.setExchangeId(exchangeId);
                            
                            // Determine roles based on listing type
                            String defaultTeacherId = exchange.getReceiverId();
                            String defaultStudentId = exchange.getInitiatorId();
                            
                            if (listing != null && listing.getListingType() == com.campusskills.modules.listings.models.ListingType.LEARN) {
                                // Invert roles for LEARN listings: Initiator is the Teacher, Receiver (Owner) is the Student
                                defaultTeacherId = exchange.getInitiatorId();
                                defaultStudentId = exchange.getReceiverId();
                            }
                            
                            // Parse proposed roles (override if explicitly provided in proposal)
                            String tempTeacherId = proposed.getString("teacherId");
                            String tempStudentId = proposed.getString("studentId");
                            final String teacherId = tempTeacherId == null ? defaultTeacherId : tempTeacherId;
                            final String studentId = tempStudentId == null ? defaultStudentId : tempStudentId;
                            
                            session.setTeacherId(teacherId);
                            session.setStudentId(studentId);
                            session.setStatus(SessionStatus.SCHEDULED);
                            session.setScheduledStart(proposed.getLong("scheduledStart"));
                            session.setScheduledEnd(proposed.getLong("scheduledEnd"));
                            session.setTopic(proposed.getString("topic"));
                            
                            sessionFutures.add(sessionRepository.createSession(session).onSuccess(sessId -> {
                                // Notify both student and teacher
                                sendNotification(teacherId, "SESSION_ACCEPTED", "Session Accepted", "A new session has been accepted and scheduled.", "SESSION", sessId);
                                if (!teacherId.equals(studentId)) {
                                    sendNotification(studentId, "SESSION_ACCEPTED", "Session Accepted", "A new session has been accepted and scheduled.", "SESSION", sessId);
                                }
                                
                                // Notify Admin
                                if (eventBus != null) {
                                    JsonObject adminNotif = new JsonObject()
                                        .put("recipientType", "ADMIN")
                                        .put("type", "ADMIN_SESSION_BOOKED")
                                        .put("title", "Session booked")
                                        .put("message", "A new session has been booked.")
                                        .put("sourceType", "SESSION")
                                        .put("sourceId", sessId);
                                    eventBus.send("internal.notification.create", adminNotif);
                                }
                            }));
                        }
                        return Future.all(sessionFutures).mapEmpty();
                    });
                }
                return Future.succeededFuture();
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

            return repository.updateStatus(exchangeId, ExchangeStatus.CANCELLED).mapEmpty();
        });
    }

    public Future<List<Exchange>> getMyExchanges(String userId) {
        return repository.findRequestsForUser(userId);
    }
}
