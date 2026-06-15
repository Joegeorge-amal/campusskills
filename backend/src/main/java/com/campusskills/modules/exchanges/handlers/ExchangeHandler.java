package com.campusskills.modules.exchanges.handlers;

import com.campusskills.modules.exchanges.models.Exchange;
import com.campusskills.modules.exchanges.services.ExchangeService;
import com.campusskills.web.response.ApiResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ExchangeHandler {

    private static final Logger log = LoggerFactory.getLogger(ExchangeHandler.class);
    private final ExchangeService service;

    public ExchangeHandler(io.vertx.core.eventbus.EventBus eventBus) {
        this.service = new ExchangeService(eventBus);
    }

    public void createExchange(RoutingContext ctx) {
        String authId = ctx.get("authenticatedUserId");
        try {
            Exchange request = ctx.body().asJsonObject().mapTo(Exchange.class);
            request.setInitiatorId(authId);
            
            service.createExchange(request)
                .onSuccess(id -> ApiResponse.created(ctx, new JsonObject().put("exchangeId", id)))
                .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
        } catch (Exception e) {
            log.error("Invalid JSON format during exchange creation", e);
            ApiResponse.badRequest(ctx, "Invalid JSON format: " + e.getMessage());
        }
    }

    public void acceptExchange(RoutingContext ctx) {
        String id = ctx.pathParam("id");
        // String authId = ctx.user().principal().getString("sub");

        service.acceptExchange(id)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Exchange accepted")))
            .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
    }

    public void rejectExchange(RoutingContext ctx) {
        String id = ctx.pathParam("id");
        
        service.rejectExchange(id)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Exchange rejected")))
            .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
    }

    public void cancelExchange(RoutingContext ctx) {
        String id = ctx.pathParam("id");
        String authId = ctx.get("authenticatedUserId");

        service.cancelExchange(id, authId)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Exchange cancelled")))
            .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
    }

    public void getMyExchanges(RoutingContext ctx) {
        String authId = ctx.get("authenticatedUserId");

        service.getMyExchanges(authId)
            .onSuccess(res -> ApiResponse.ok(ctx, res))
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }
}
