package com.campusskills.modules.exchanges.routes;

import com.campusskills.modules.exchanges.handlers.ExchangeHandler;
import com.campusskills.modules.exchanges.repositories.ExchangeRepository;
import com.campusskills.modules.exchanges.services.ExchangeService;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;

public class ExchangeRouter {
    public static Router create(Vertx vertx) {
        Router router = Router.router(vertx);
        
        ExchangeRepository repository = new ExchangeRepository();
        com.campusskills.modules.chats.repositories.ChatRepository chatRepository = new com.campusskills.modules.chats.repositories.ChatRepository();
        ExchangeService service = new ExchangeService(repository, chatRepository);
        ExchangeHandler handler = new ExchangeHandler(service);

        router.post("/").handler(handler::createRequest);
        router.get("/").handler(handler::getUserRequests);
        router.patch("/:exchangeId/accept").handler(handler::acceptRequest);
        router.patch("/:exchangeId/reject").handler(handler::rejectRequest);

        return router;
    }
}
