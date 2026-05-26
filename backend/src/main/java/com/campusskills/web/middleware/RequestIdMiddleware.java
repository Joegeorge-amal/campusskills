package com.campusskills.web.middleware;

import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;

import java.util.UUID;

public class RequestIdMiddleware implements Handler<RoutingContext> {

    public static RequestIdMiddleware create() {
        return new RequestIdMiddleware();
    }

    @Override
    public void handle(RoutingContext ctx) {
        String requestId = UUID.randomUUID().toString();
        ctx.put("requestId", requestId);
        ctx.response().putHeader("X-Request-ID", requestId);
        ctx.next();
    }
}
