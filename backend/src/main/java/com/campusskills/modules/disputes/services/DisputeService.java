package com.campusskills.modules.disputes.services;

import com.campusskills.modules.disputes.models.CreateDisputeRequest;
import com.campusskills.modules.disputes.models.Dispute;
import com.campusskills.modules.disputes.repositories.DisputeRepository;
import com.campusskills.modules.sessions.repositories.SessionRepository;
import com.campusskills.shared.constants.DisputeStatus;
import com.campusskills.shared.constants.SessionStatus;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import java.util.List;

public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final SessionRepository sessionRepository;

    public DisputeService(DisputeRepository disputeRepository, SessionRepository sessionRepository) {
        this.disputeRepository = disputeRepository;
        this.sessionRepository = sessionRepository;
    }

    public Future<String> createDispute(String reporterId, CreateDisputeRequest req) {
        if (req.getSessionId() != null) {
            return sessionRepository.getSessionById(req.getSessionId())
                .compose(session -> {
                    if (session == null) {
                        return Future.failedFuture("Session not found");
                    }
                    if (!reporterId.equals(session.getStudentId()) && !reporterId.equals(session.getTeacherId())) {
                        return Future.failedFuture("Unauthorized to dispute this session");
                    }
                    
                    Dispute dispute = new Dispute();
                    dispute.setReporterId(reporterId);
                    dispute.setReportedId(req.getReportedId());
                    dispute.setSessionId(req.getSessionId());
                    dispute.setExchangeId(req.getExchangeId());
                    dispute.setReasonType(req.getReasonType());
                    dispute.setDescription(req.getDescription());
                    dispute.setStatus(DisputeStatus.OPEN);
                    
                    return disputeRepository.createDispute(dispute)
                        .compose(disputeId -> {
                            JsonObject update = new JsonObject().put("status", SessionStatus.DISPUTED.name());
                            return sessionRepository.updateSessionFields(req.getSessionId(), update)
                                .map(v -> disputeId);
                        });
                });
        } else {
            // For general disputes not tied to a specific session (e.g. Chat Harassment, Profile Misrepresentation)
            Dispute dispute = new Dispute();
            dispute.setReporterId(reporterId);
            dispute.setReportedId(req.getReportedId());
            dispute.setReasonType(req.getReasonType());
            dispute.setDescription(req.getDescription());
            dispute.setStatus(DisputeStatus.OPEN);
            return disputeRepository.createDispute(dispute);
        }
    }

    public Future<List<Dispute>> getMyDisputes(String userId) {
        return disputeRepository.getDisputesByUser(userId);
    }
}
