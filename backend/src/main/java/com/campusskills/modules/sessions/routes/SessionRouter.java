package com.campusskills.modules.sessions.routes;

import com.campusskills.modules.sessions.handlers.SessionHandler;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;

public class SessionRouter {

    public static Router create(Vertx vertx) {
        SessionHandler handler = new SessionHandler();
        Router router = Router.router(vertx);

        router.route().handler(BodyHandler.create());

        router.get("/me").handler(handler::getSessionsForAuthUser);
        router.get("/:sessionId").handler(handler::getSessionById);
        router.post("/:sessionId/confirm").handler(handler::confirmSession);
        router.post("/:sessionId/dispute").handler(handler::disputeSession);

        return router;
    }
}
