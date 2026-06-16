package com.campusskills.web.middleware;

import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;

import java.util.concurrent.ConcurrentHashMap;

public class RateLimitMiddleware {

    private static final ConcurrentHashMap<String, RateLimitData> rateLimits = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS = 15; // Allow a bit more for 1 min
    private static final long TIME_WINDOW_MS = 60000; // 1 minute

    private static class RateLimitData {
        int count;
        long timestamp;

        RateLimitData(int count, long timestamp) {
            this.count = count;
            this.timestamp = timestamp;
        }
    }

    public static Handler<RoutingContext> create() {
        return ctx -> {
            String ip = ctx.request().remoteAddress().hostAddress();
            if (ip == null) {
                ip = "unknown";
            }
            
            // Allow forwarded IP
            String forwardedFor = ctx.request().getHeader("X-Forwarded-For");
            if (forwardedFor != null && !forwardedFor.isEmpty()) {
                ip = forwardedFor.split(",")[0].trim();
            }
            
            long now = System.currentTimeMillis();
            
            rateLimits.compute(ip, (key, data) -> {
                if (data == null || now - data.timestamp > TIME_WINDOW_MS) {
                    return new RateLimitData(1, now);
                }
                data.count++;
                return data;
            });
            
            RateLimitData currentData = rateLimits.get(ip);
            if (currentData.count > MAX_REQUESTS) {
                ctx.response()
                    .setStatusCode(429)
                    .putHeader("content-type", "application/json")
                    .end("{\"error\":\"Too many requests. Please try again later.\"}");
                return;
            }
            
            ctx.next();
        };
    }
}
