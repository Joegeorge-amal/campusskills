package com.campusskills.modules.chats.routes;

import com.campusskills.modules.chats.handlers.ChatHandler;
import com.campusskills.modules.chats.repositories.ChatRepository;
import com.campusskills.modules.chats.services.ChatService;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;

public class ChatRouter {
    public static Router create(Vertx vertx) {
        Router router = Router.router(vertx);
        
        ChatRepository repository = new ChatRepository();
        com.campusskills.modules.messages.repositories.MessageRepository messageRepository = new com.campusskills.modules.messages.repositories.MessageRepository();
        com.campusskills.modules.users.repositories.UserRepository userRepository = new com.campusskills.modules.users.repositories.UserRepository();
        ChatService service = new ChatService(repository, messageRepository, userRepository);
        ChatHandler handler = new ChatHandler(service);

        router.post("/").handler(handler::createChat);
        router.get("/").handler(handler::getUserChats);
        router.delete("/:id").handler(handler::deleteChat);

        return router;
    }
}
