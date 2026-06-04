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

    public ExchangeService() {
        this.repository = new ExchangeRepository();
        this.sessionRepository = new SessionRepository();
    }

    public Future<String> createExchange(Exchange request) {
        request.setStatus(ExchangeStatus.REQUESTED);
        return repository.createRequest(request);
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
                if (exchange.getProposedSessions() != null) {
                    List<Future<String>> sessionFutures = new ArrayList<>();
                    for (JsonObject proposed : exchange.getProposedSessions()) {
                        Session session = new Session();
                        session.setExchangeId(exchangeId);
                        
                        // Parse proposed roles
                        String teacherId = proposed.getString("teacherId");
                        String studentId = proposed.getString("studentId");
                        if (teacherId == null) teacherId = exchange.getReceiverId();
                        if (studentId == null) studentId = exchange.getInitiatorId();
                        
                        session.setTeacherId(teacherId);
                        session.setStudentId(studentId);
                        session.setStatus(SessionStatus.SCHEDULED);
                        session.setScheduledStart(proposed.getLong("scheduledStart"));
                        session.setScheduledEnd(proposed.getLong("scheduledEnd"));
                        session.setTopic(proposed.getString("topic"));
                        
                        sessionFutures.add(sessionRepository.createSession(session));
                    }
                    return Future.all(sessionFutures).mapEmpty();
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
