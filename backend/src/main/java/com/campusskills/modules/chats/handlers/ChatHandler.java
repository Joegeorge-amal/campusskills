package com.campusskills.modules.chats.handlers;

import com.campusskills.modules.chats.models.Chat;
import com.campusskills.modules.chats.services.ChatService;
import com.campusskills.web.response.ApiResponse;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class ChatHandler {
    private final ChatService chatService;

    public ChatHandler(ChatService chatService) {
        this.chatService = chatService;
    }

    public void createChat(RoutingContext ctx) {
        try {
            Chat chat = ctx.body().asJsonObject().mapTo(Chat.class);
            String authId = ctx.get("authenticatedUserId");
            if (authId == null) {
                ApiResponse.forbidden(ctx, "Unauthorized");
                return;
            }
            if (chat.getParticipants() == null) {
                chat.setParticipants(new java.util.ArrayList<>());
            }
            chat.getParticipants().add(authId);
            
            chatService.createChat(chat, authId)
                .onSuccess(data -> ApiResponse.created(ctx, data))
                .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid JSON format");
        }
    }

    public void getUserChats(RoutingContext ctx) {
        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
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
        
        String statusFilter = null;
        if (ctx.queryParam("status") != null && !ctx.queryParam("status").isEmpty()) {
            statusFilter = ctx.queryParam("status").get(0);
        }

        chatService.getUserChats(authId, statusFilter, page, limit)
            .onSuccess(result -> ApiResponse.paginatedOk(ctx, result.getJsonArray("items"), result.getInteger("page"), result.getInteger("limit"), result.getLong("total")))
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }
}
