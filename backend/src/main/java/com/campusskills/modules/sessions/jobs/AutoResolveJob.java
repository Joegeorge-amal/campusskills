package com.campusskills.modules.sessions.jobs;

import com.campusskills.modules.sessions.models.Session;
import com.campusskills.modules.sessions.repositories.SessionRepository;
import com.campusskills.shared.constants.SessionStatus;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public class AutoResolveJob {
    
    private static final Logger log = LoggerFactory.getLogger(AutoResolveJob.class);
    private final SessionRepository repository;
    private final io.vertx.core.eventbus.EventBus eventBus;
    
    public AutoResolveJob(io.vertx.core.eventbus.EventBus eventBus) {
        this.repository = new SessionRepository();
        this.eventBus = eventBus;
    }
    
    public void start(Vertx vertx) {
        // Run every 10 minutes
        long intervalMs = 10 * 60 * 1000;
        
        vertx.setPeriodic(intervalMs, id -> {
            log.debug("Running AutoResolveJob...");
            
            repository.autoResolveExpiredSessions().onComplete(ar -> {
                if (ar.succeeded()) {
                    List<Session> resolvedSessions = ar.result();
                    if (!resolvedSessions.isEmpty()) {
                        log.debug("AutoResolveJob completed. Auto-resolved {} sessions.", resolvedSessions.size());
                        if (eventBus != null) {
                            for (Session s : resolvedSessions) {
                                JsonObject notifTeacher = new JsonObject()
                                    .put("userId", s.getTeacherId())
                                    .put("type", "SESSION_COMPLETED")
                                    .put("title", "Session Auto-Closed")
                                    .put("message", "Your session was automatically closed due to inactivity.")
                                    .put("sourceType", "SESSION")
                                    .put("sourceId", s.getId());
                                eventBus.send("internal.notification.create", notifTeacher);
                                
                                if (!s.getTeacherId().equals(s.getStudentId())) {
                                    JsonObject notifStudent = new JsonObject()
                                        .put("userId", s.getStudentId())
                                        .put("type", "SESSION_COMPLETED")
                                        .put("title", "Session Auto-Closed")
                                        .put("message", "Your session was automatically closed due to inactivity.")
                                        .put("sourceType", "SESSION")
                                        .put("sourceId", s.getId());
                                    eventBus.send("internal.notification.create", notifStudent);
                                }
                            }
                        }
                    }
                } else {
                    log.error("AutoResolveJob failed", ar.cause());
                }
            });
        });
    }
}
