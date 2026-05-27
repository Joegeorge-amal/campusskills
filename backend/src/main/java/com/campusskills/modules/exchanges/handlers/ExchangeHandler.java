package com.campusskills.modules.exchanges.handlers;

import com.campusskills.modules.exchanges.models.Exchange;
import com.campusskills.modules.exchanges.services.ExchangeService;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import com.campusskills.web.response.ApiResponse;

public class ExchangeHandler {

    private final ExchangeService exchangeService;

    public ExchangeHandler(ExchangeService exchangeService) {
        this.exchangeService = exchangeService;
    }

    public void createRequest(RoutingContext ctx) {
        try {
            Exchange exchange = ctx.body().asJsonObject().mapTo(Exchange.class);
            String authId = ctx.get("authenticatedUserId");
            if (authId == null) {
                ApiResponse.forbidden(ctx, "Unauthorized");
                return;
            }
            exchange.setRequesterId(authId);
            exchangeService.createRequest(exchange)
                .onSuccess(id -> ApiResponse.created(ctx, new JsonObject().put("id", id).put("message", "Exchange request created")))
                .onFailure(err -> {
                    String msg = err.getMessage();
                    if ("DUPLICATE_ACTIVE_REQUEST".equals(msg)) {
                        ApiResponse.conflict(ctx, "An active exchange request already exists");
                    } else if ("SELF_REQUEST".equals(msg)) {
                        ApiResponse.badRequest(ctx, "Users cannot create exchange requests with themselves");
                    } else {
                        ApiResponse.badRequest(ctx, msg);
                    }
                });
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid JSON format");
        }
    }

    public void getUserRequests(RoutingContext ctx) {
        String userId = ctx.get("authenticatedUserId");
        if (userId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }
        
        int page = 1;
        int limit = 20;
        try {
            if (ctx.queryParam("page") != null && !ctx.queryParam("page").isEmpty()) {
                page = Integer.parseInt(ctx.queryParam("page").get(0));
            }
            if (ctx.queryParam("limit") != null && !ctx.queryParam("limit").isEmpty()) {
                limit = Integer.parseInt(ctx.queryParam("limit").get(0));
            }
        } catch (NumberFormatException e) {
            ApiResponse.badRequest(ctx, "Invalid pagination parameters");
            return;
        }
        
        exchangeService.getUserRequests(userId, page, limit)
            .onSuccess(result -> ApiResponse.paginatedOk(ctx, result.getJsonArray("items"), result.getInteger("page"), result.getInteger("limit"), result.getLong("total")))
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }

    public void acceptRequest(RoutingContext ctx) {
        String exchangeId = ctx.pathParam("exchangeId");
        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }
        exchangeService.acceptRequest(exchangeId, authId)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Request ACCEPTED")))
            .onFailure(err -> {
                String msg = err.getMessage();
                if ("EXCHANGE_NOT_FOUND".equals(msg)) {
                    ApiResponse.notFound(ctx, "Exchange not found");
                } else if ("INVALID_STATUS_TRANSITION".equals(msg)) {
                    ApiResponse.conflict(ctx, "Invalid exchange status transition");
                } else if (msg != null && msg.startsWith("UNAUTHORIZED")) {
                    ApiResponse.forbidden(ctx, msg);
                } else {
                    ApiResponse.badRequest(ctx, msg);
                }
            });
    }

    public void rejectRequest(RoutingContext ctx) {
        String exchangeId = ctx.pathParam("exchangeId");
        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }
        exchangeService.rejectRequest(exchangeId, authId)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Request REJECTED")))
            .onFailure(err -> {
                String msg = err.getMessage();
                if ("EXCHANGE_NOT_FOUND".equals(msg)) {
                    ApiResponse.notFound(ctx, "Exchange not found");
                } else if ("INVALID_STATUS_TRANSITION".equals(msg)) {
                    ApiResponse.conflict(ctx, "Invalid exchange status transition");
                } else if (msg != null && msg.startsWith("UNAUTHORIZED")) {
                    ApiResponse.forbidden(ctx, msg);
                } else {
                    ApiResponse.badRequest(ctx, msg);
                }
            });
    }
}
