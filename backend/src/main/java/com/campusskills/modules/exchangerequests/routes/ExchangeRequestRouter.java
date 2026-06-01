package com.campusskills.modules.exchangerequests.routes;

import com.campusskills.modules.exchangerequests.handlers.ExchangeRequestHandler;
import com.campusskills.modules.exchangerequests.repositories.ExchangeRequestRepository;
import com.campusskills.modules.exchangerequests.services.ExchangeRequestService;
import com.campusskills.modules.chats.repositories.ChatRepository;
import com.campusskills.modules.chats.services.ChatService;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;

public class ExchangeRequestRouter {

    public static Router create(Vertx vertx) {
        Router router = Router.router(vertx);
        
        ChatRepository chatRepository = new ChatRepository();
        com.campusskills.modules.messages.repositories.MessageRepository messageRepository = new com.campusskills.modules.messages.repositories.MessageRepository();
        ChatService chatService = new ChatService(chatRepository, messageRepository);
        
        ExchangeRequestRepository repository = new ExchangeRequestRepository();
        ExchangeRequestService service = new ExchangeRequestService(repository, chatService, chatRepository, vertx.eventBus());
        ExchangeRequestHandler handler = new ExchangeRequestHandler(service);

        router.post("/").handler(handler::createRequest);
        router.get("/").handler(handler::getUserRequests);
        router.patch("/:id/accept").handler(handler::acceptRequest);
        router.patch("/:id/reject").handler(handler::rejectRequest);

        return router;
    }
}
