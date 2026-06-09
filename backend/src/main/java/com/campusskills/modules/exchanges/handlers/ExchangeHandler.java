package com.campusskills.modules.exchanges.handlers;

import com.campusskills.modules.exchanges.models.Exchange;
import com.campusskills.modules.exchanges.services.ExchangeService;
import com.campusskills.web.response.ApiResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class ExchangeHandler {

    private final ExchangeService service;

    public ExchangeHandler(io.vertx.core.eventbus.EventBus eventBus) {
        this.service = new ExchangeService(eventBus);
    }

    public void createExchange(RoutingContext ctx) {
        String authId = ctx.user().principal().getString("sub");
        try {
            Exchange request = ctx.body().asJsonObject().mapTo(Exchange.class);
            request.setInitiatorId(authId);
            
            service.createExchange(request)
                .onSuccess(data -> ApiResponse.created(ctx, new JsonObject().put("id", data)))
                .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid JSON format");
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

    public void getMyExchanges(RoutingContext ctx) {
        String authId = ctx.user().principal().getString("sub");

        service.getMyExchanges(authId)
            .onSuccess(res -> ApiResponse.ok(ctx, res))
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }
}
