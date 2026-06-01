package com.campusskills.modules.chatrequests.handlers;

import com.campusskills.modules.chatrequests.models.ChatRequest;
import com.campusskills.modules.chatrequests.services.ChatRequestService;
import com.campusskills.web.response.ApiResponse;
import io.vertx.ext.web.RoutingContext;

public class ChatRequestHandler {

    private final ChatRequestService service;

    public ChatRequestHandler(ChatRequestService service) {
        this.service = service;
    }

    public void createRequest(RoutingContext ctx) {
        try {
            ChatRequest request = ctx.body().asJsonObject().mapTo(ChatRequest.class);
            String authId = ctx.get("authenticatedUserId");
            
            service.createRequest(request, authId)
                .onSuccess(data -> ApiResponse.created(ctx, data))
                .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid JSON format");
        }
    }

    public void acceptRequest(RoutingContext ctx) {
        String id = ctx.pathParam("id");
        String authId = ctx.get("authenticatedUserId");

        service.acceptRequest(id, authId)
            .onSuccess(v -> ApiResponse.ok(ctx, new io.vertx.core.json.JsonObject().put("message", "Request accepted")))
            .onFailure(err -> {
                if ("NOT_FOUND".equals(err.getMessage())) ApiResponse.notFound(ctx, "Request not found");
                else if ("FORBIDDEN".equals(err.getMessage())) ApiResponse.forbidden(ctx, "Not authorized");
                else ApiResponse.badRequest(ctx, err.getMessage());
            });
    }

    public void rejectRequest(RoutingContext ctx) {
        String id = ctx.pathParam("id");
        String authId = ctx.get("authenticatedUserId");

        service.rejectRequest(id, authId)
            .onSuccess(v -> ApiResponse.ok(ctx, new io.vertx.core.json.JsonObject().put("message", "Request rejected")))
            .onFailure(err -> {
                if ("NOT_FOUND".equals(err.getMessage())) ApiResponse.notFound(ctx, "Request not found");
                else if ("FORBIDDEN".equals(err.getMessage())) ApiResponse.forbidden(ctx, "Not authorized");
                else ApiResponse.badRequest(ctx, err.getMessage());
            });
    }

    public void getUserRequests(RoutingContext ctx) {
        String authId = ctx.get("authenticatedUserId");
        int page = 1;
        int limit = 20;
        try {
            if (ctx.queryParam("page") != null && !ctx.queryParam("page").isEmpty()) page = Integer.parseInt(ctx.queryParam("page").get(0));
            if (ctx.queryParam("limit") != null && !ctx.queryParam("limit").isEmpty()) limit = Integer.parseInt(ctx.queryParam("limit").get(0));
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid pagination");
            return;
        }

        service.getUserRequests(authId, page, limit)
            .onSuccess(res -> ApiResponse.paginatedOk(ctx, res.getJsonArray("items"), res.getInteger("page"), res.getInteger("limit"), res.getLong("total")))
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }
}
