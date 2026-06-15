package com.campusskills.modules.messages.routes;

import com.campusskills.modules.messages.handlers.MessageHandler;
import com.campusskills.modules.messages.repositories.MessageRepository;
import com.campusskills.modules.messages.services.MessageService;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;

public class MessageRouter {
    public static Router create(Vertx vertx) {
        Router router = Router.router(vertx);
        
        MessageRepository repository = new MessageRepository();
        com.campusskills.modules.messages.services.TypingIndicatorService typingService = 
            new com.campusskills.modules.messages.services.TypingIndicatorService(vertx, repository);
        MessageService service = new MessageService(repository, typingService, vertx.eventBus());
        MessageHandler handler = new MessageHandler(service);

        router.post("/").handler(handler::createMessage);
        router.get("/chat/:chatId").handler(handler::getChatMessages);
        router.patch("/chat/:chatId/read").handler(handler::markChatAsRead);
        router.patch("/:messageId/edit").handler(handler::editMessage);
        router.delete("/:messageId").handler(handler::deleteMessage);

        // Internal EventBus Consumer for system messages
        vertx.eventBus().<io.vertx.core.json.JsonObject>consumer("internal.message.create", msg -> {
            io.vertx.core.json.JsonObject body = msg.body();
            com.campusskills.modules.messages.models.Message systemMsg = body.mapTo(com.campusskills.modules.messages.models.Message.class);
            service.createMessage(systemMsg).onComplete(ar -> {
                if (ar.succeeded()) {
                    msg.reply(new io.vertx.core.json.JsonObject().put("success", true).put("id", ar.result()));
                } else {
                    msg.fail(500, ar.cause().getMessage());
                }
            });
        });

        vertx.eventBus().<io.vertx.core.json.JsonObject>consumer("internal.typing.event", msg -> {
            io.vertx.core.json.JsonObject data = msg.body();
            String typeStr = data.getString("type");
            io.vertx.core.json.JsonObject payload = data.getJsonObject("payload");
            typingService.handleTypingEvent(typeStr, payload);
        });

        vertx.eventBus().<io.vertx.core.json.JsonObject>consumer("internal.message.delivered", msg -> {
            io.vertx.core.json.JsonObject payload = msg.body().getJsonObject("payload");
            String messageId = payload.getString("messageId");
            String deliveredTo = payload.getString("deliveredTo");
            if (messageId != null && deliveredTo != null) {
                service.markAsDelivered(messageId, deliveredTo);
            }
        });

        return router;
    }
}
