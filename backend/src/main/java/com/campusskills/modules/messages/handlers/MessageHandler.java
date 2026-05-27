package com.campusskills.modules.messages.handlers;

import com.campusskills.modules.messages.models.Message;
import com.campusskills.modules.messages.services.MessageService;
import com.campusskills.web.response.ApiResponse;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class MessageHandler {
    private final MessageService messageService;

    public MessageHandler(MessageService messageService) {
        this.messageService = messageService;
    }

    public void createMessage(RoutingContext ctx) {
        try {
            Message msg = ctx.body().asJsonObject().mapTo(Message.class);
            String authId = ctx.get("authenticatedUserId");
            if (authId == null) {
                ApiResponse.forbidden(ctx, "Unauthorized");
                return;
            }
            msg.setSenderId(authId);
            messageService.createMessage(msg)
                .onSuccess(id -> ApiResponse.created(ctx, new JsonObject().put("id", id).put("message", "Message created successfully")))
                .onFailure(err -> {
                    String errorMsg = err.getMessage();
                    if ("CHAT_NOT_FOUND".equals(errorMsg)) {
                        ApiResponse.notFound(ctx, "Chat not found");
                    } else if ("UNAUTHORIZED_SENDER".equals(errorMsg)) {
                        ApiResponse.forbidden(ctx, "Sender not authorized for this chat");
                    } else if ("CHAT_NOT_ACTIVE".equals(errorMsg)) {
                        ApiResponse.forbidden(ctx, "Messaging is locked until the exchange request is accepted");
                    } else {
                        ApiResponse.badRequest(ctx, errorMsg);
                    }
                });
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid JSON format");
        }
    }

    public void getChatMessages(RoutingContext ctx) {
        String chatId = ctx.pathParam("chatId");
        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }

        int page = 1;
        int limit = 50;
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

        messageService.getChatMessages(chatId, authId, page, limit)
            .onSuccess(result -> ApiResponse.paginatedOk(ctx, result.getJsonArray("items"), result.getInteger("page"), result.getInteger("limit"), result.getLong("total")))
            .onFailure(err -> {
                String errorMsg = err.getMessage();
                if (errorMsg != null && errorMsg.startsWith("UNAUTHORIZED")) {
                    ApiResponse.forbidden(ctx, errorMsg);
                } else if ("CHAT_NOT_FOUND".equals(errorMsg)) {
                    ApiResponse.notFound(ctx, "Chat not found");
                } else {
                    ApiResponse.internalError(ctx, errorMsg);
                }
            });
    }
}
