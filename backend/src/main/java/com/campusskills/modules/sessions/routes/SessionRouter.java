package com.campusskills.modules.sessions.routes;

import com.campusskills.modules.sessions.handlers.SessionHandler;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;

public class SessionRouter {

    public static Router create(Vertx vertx) {
        SessionHandler handler = new SessionHandler(vertx.eventBus());
        Router router = Router.router(vertx);

        router.route().handler(BodyHandler.create());

        router.get("/me").handler(handler::getSessionsForAuthUser);
        router.get("/:sessionId").handler(handler::getSessionById);
        router.post("/:sessionId/complete").handler(handler::markCompletion);
        router.post("/:sessionId/reschedule/propose").handler(handler::proposeReschedule);
        router.post("/:sessionId/reschedule/respond").handler(handler::respondToReschedule);
        router.post("/:sessionId/pay").handler(handler::markPaid);
        router.post("/:sessionId/pay/confirm").handler(handler::confirmPayment);
        router.get("/:sessionId/payment-info").handler(handler::getPaymentInfo);
        router.post("/:sessionId/payment-reminder").handler(handler::sendPaymentReminder);
        router.post("/:sessionId/cancel").handler(handler::cancelSession);

        return router;
    }
}
