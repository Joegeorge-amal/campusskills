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
    
    public Future<List<AuditLog>> searchLogs(String q, String action, String actorId, String targetId, Long startDate, Long endDate, int page, int limit) {
        return repository.searchLogs(q, action, actorId, targetId, startDate, endDate, page, limit);
    }

    public Future<Long> countLogs(String q, String action, String actorId, String targetId, Long startDate, Long endDate) {
        return repository.countLogs(q, action, actorId, targetId, startDate, endDate);
    }
}
