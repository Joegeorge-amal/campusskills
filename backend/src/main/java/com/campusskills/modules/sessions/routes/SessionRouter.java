package com.campusskills.modules.sessions.routes;

import com.campusskills.modules.sessions.handlers.SessionHandler;
import com.campusskills.modules.sessions.repositories.SessionRepository;
import com.campusskills.modules.sessions.services.SessionService;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;

public class SessionRouter {
    public static Router create(Vertx vertx) {
        Router router = Router.router(vertx);
        
        SessionRepository repository = new SessionRepository();
        com.campusskills.modules.exchangerequests.repositories.ExchangeRequestRepository exchangeRepository = new com.campusskills.modules.exchangerequests.repositories.ExchangeRequestRepository();
        com.campusskills.modules.chats.repositories.ChatRepository chatRepository = new com.campusskills.modules.chats.repositories.ChatRepository();
        SessionService service = new SessionService(vertx.eventBus(), repository, exchangeRepository, chatRepository);
        SessionHandler handler = new SessionHandler(service);

        router.post("/").handler(handler::createSession);
        router.get("/").handler(handler::getSessionsForAuthUser);
        router.get("/:sessionId").handler(handler::getSessionById);
        router.patch("/:sessionId/accept").handler(handler::acceptSession);
        router.patch("/:sessionId/reject").handler(handler::rejectSession);
        router.patch("/:sessionId/cancel").handler(handler::cancelSession);
        router.patch("/:sessionId/complete").handler(handler::completeSession);
        router.patch("/:sessionId/confirm").handler(handler::confirmSession);
        router.patch("/:sessionId/dispute").handler(handler::disputeSession);

        return router;
    }
}
