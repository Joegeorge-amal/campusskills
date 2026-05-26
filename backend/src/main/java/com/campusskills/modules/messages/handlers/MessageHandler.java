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
        
        int limit = 50;
        int skip = 0;
        try {
            if (ctx.queryParam("limit").size() > 0) limit = Integer.parseInt(ctx.queryParam("limit").get(0));
            if (ctx.queryParam("skip").size() > 0) skip = Integer.parseInt(ctx.queryParam("skip").get(0));
        } catch (NumberFormatException ignored) {}

        messageService.getChatMessages(chatId, limit, skip)
            .onSuccess(messages -> {
                JsonArray responseArray = new JsonArray();
                messages.forEach(msg -> responseArray.add(JsonObject.mapFrom(msg)));
                ApiResponse.ok(ctx, responseArray);
            })
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }
}
