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
    
    public AutoResolveJob() {
        this.repository = new SessionRepository();
    }
    
    public void start(Vertx vertx) {
        // Run every 10 minutes
        long intervalMs = 10 * 60 * 1000;
        
        vertx.setPeriodic(intervalMs, id -> {
            log.info("Running AutoResolveJob...");
            
            repository.autoResolveExpiredSessions().onComplete(ar -> {
                if (ar.succeeded()) {
                    Long count = ar.result();
                    if (count > 0) {
                        log.info("AutoResolveJob completed. Auto-resolved {} sessions.", count);
                    }
                } else {
                    log.error("AutoResolveJob failed", ar.cause());
                }
            });
        });
    }
}
