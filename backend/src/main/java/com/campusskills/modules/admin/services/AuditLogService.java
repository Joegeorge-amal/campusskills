package com.campusskills.modules.admin.services;

import com.campusskills.modules.admin.models.AuditLog;
import com.campusskills.modules.admin.repositories.AuditLogRepository;
import io.vertx.core.Future;

import java.util.List;

public class AuditLogService {
    private final AuditLogRepository repository;

    public AuditLogService() {
        this.repository = new AuditLogRepository();
    }

    public Future<String> logAction(
            String action, 
            String actorId, String actorName, String actorEmail,
            String targetId, String targetName, String targetEmail,
            String previousState, String newState, 
            String reason, String ipAddress) {
            
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setActorId(actorId);
        log.setActorName(actorName);
        log.setActorEmail(actorEmail);
        log.setTargetId(targetId);
        log.setTargetName(targetName);
        log.setTargetEmail(targetEmail);
        log.setPreviousState(previousState);
        log.setNewState(newState);
        log.setReason(reason);
        log.setIpAddress(ipAddress);
        
        return repository.createLog(log);
    }
    
    public Future<List<AuditLog>> fetchLogs(int page, int limit) {
        return repository.fetchLogs(page, limit);
    }
}
