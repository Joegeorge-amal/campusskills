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
                .onSuccess(id -> {
                    msg.setId(id);
                    ApiResponse.created(ctx, JsonObject.mapFrom(msg));
                })
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

    public void markAsRead(RoutingContext ctx) {
        String messageId = ctx.pathParam("messageId");
        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }

        messageService.markAsRead(messageId, authId)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("success", true).put("message", "Message marked as read")))
            .onFailure(err -> {
                String errorMsg = err.getMessage();
                if (errorMsg != null && errorMsg.startsWith("UNAUTHORIZED")) {
                    ApiResponse.forbidden(ctx, errorMsg);
                } else if ("MESSAGE_NOT_FOUND".equals(errorMsg)) {
                    ApiResponse.notFound(ctx, "Message not found");
                } else if ("CHAT_NOT_FOUND".equals(errorMsg)) {
                    ApiResponse.notFound(ctx, "Chat not found");
                } else {
                    ApiResponse.badRequest(ctx, errorMsg);
                }
            });
    }

    public void editMessage(RoutingContext ctx) {
        String messageId = ctx.pathParam("messageId");
        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }

        String newText;
        try {
            newText = ctx.body().asJsonObject().getString("message");
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid JSON format");
            return;
        }

        messageService.editMessage(messageId, authId, newText)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("success", true).put("message", "Message edited")))
            .onFailure(err -> {
                String errorMsg = err.getMessage();
                if (errorMsg != null && errorMsg.startsWith("UNAUTHORIZED")) {
                    ApiResponse.forbidden(ctx, errorMsg);
                } else if ("MESSAGE_NOT_FOUND".equals(errorMsg)) {
                    ApiResponse.notFound(ctx, "Message not found");
                } else if ("EDIT_WINDOW_EXPIRED".equals(errorMsg)) {
                    ApiResponse.forbidden(ctx, "Cannot edit message after 10 minutes");
                } else {
                    ApiResponse.badRequest(ctx, errorMsg);
                }
            });
    }

    public void deleteMessage(RoutingContext ctx) {
        String messageId = ctx.pathParam("messageId");
        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }

        messageService.deleteMessage(messageId, authId)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("success", true).put("message", "Message deleted")))
            .onFailure(err -> {
                String errorMsg = err.getMessage();
                if (errorMsg != null && errorMsg.startsWith("UNAUTHORIZED")) {
                    ApiResponse.forbidden(ctx, errorMsg);
                } else if ("MESSAGE_NOT_FOUND".equals(errorMsg)) {
                    ApiResponse.notFound(ctx, "Message not found");
                } else if ("DELETE_WINDOW_EXPIRED".equals(errorMsg)) {
                    ApiResponse.forbidden(ctx, "Cannot delete message after 15 minutes");
                } else {
                    ApiResponse.badRequest(ctx, errorMsg);
                }
            });
    }
    public void markChatAsRead(RoutingContext ctx) {
        String chatId = ctx.pathParam("chatId");
        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }

        messageService.markChatAsRead(chatId, authId)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("success", true).put("message", "Chat marked as read")))
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
