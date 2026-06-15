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

        String q = null;
        if (ctx.queryParam("q") != null && !ctx.queryParam("q").isEmpty()) {
            q = ctx.queryParam("q").get(0);
        }

        chatService.getUserChats(authId, statusFilter, q, page, limit)
            .onSuccess(result -> ApiResponse.paginatedOk(ctx, result.getJsonArray("items"), result.getInteger("page"), result.getInteger("limit"), result.getLong("total")))
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }

    public void deleteChat(RoutingContext ctx) {
        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }

        String chatId = ctx.pathParam("id");
        if (chatId == null || chatId.isEmpty()) {
            ApiResponse.badRequest(ctx, "Chat ID is required");
            return;
        }

        chatService.deleteChat(chatId, authId)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Chat deleted successfully")))
            .onFailure(err -> {
                if ("CHAT_NOT_FOUND".equals(err.getMessage())) {
                    ApiResponse.notFound(ctx, "Chat not found");
                } else if ("UNAUTHORIZED".equals(err.getMessage())) {
                    ApiResponse.forbidden(ctx, "Not a participant");
                } else {
                    ApiResponse.internalError(ctx, err.getMessage());
                }
            });
    }
}
