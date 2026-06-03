package com.campusskills.modules.chatrequests.routes;

import com.campusskills.modules.chatrequests.handlers.ChatRequestHandler;
import com.campusskills.modules.chatrequests.repositories.ChatRequestRepository;
import com.campusskills.modules.chatrequests.services.ChatRequestService;
import com.campusskills.modules.chats.repositories.ChatRepository;
import com.campusskills.modules.chats.services.ChatService;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;

public class ChatRequestRouter {

    public static Router create(Vertx vertx) {
        Router router = Router.router(vertx);
        
        ChatRepository chatRepository = new ChatRepository();
        com.campusskills.modules.messages.repositories.MessageRepository messageRepository = new com.campusskills.modules.messages.repositories.MessageRepository();
        ChatService chatService = new ChatService(chatRepository, messageRepository);
        
        ChatRequestRepository repository = new ChatRequestRepository();
        com.campusskills.modules.users.repositories.UserProfileRepository userProfileRepository = new com.campusskills.modules.users.repositories.UserProfileRepository();
        ChatRequestService service = new ChatRequestService(repository, chatService, chatRepository, userProfileRepository, vertx.eventBus());
        ChatRequestHandler handler = new ChatRequestHandler(service);

        router.post("/").handler(handler::createRequest);
        router.get("/").handler(handler::getUserRequests);
        router.patch("/:id/accept").handler(handler::acceptRequest);
        router.patch("/:id/reject").handler(handler::rejectRequest);

        return router;
    }
}
