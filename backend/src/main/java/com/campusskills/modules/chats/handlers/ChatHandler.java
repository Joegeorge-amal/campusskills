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
            chatService.createChat(chat)
                .onSuccess(id -> ApiResponse.created(ctx, new JsonObject().put("id", id).put("message", "Chat created successfully")))
                .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid JSON format");
        }
    }

    public void getUserChats(RoutingContext ctx) {
        String userId = ctx.pathParam("userId");
        chatService.getUserChats(userId)
            .onSuccess(chats -> {
                JsonArray responseArray = new JsonArray();
                chats.forEach(chat -> responseArray.add(JsonObject.mapFrom(chat)));
                ApiResponse.ok(ctx, responseArray);
            })
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }
}
