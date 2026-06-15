package com.campusskills.modules.exchanges.routes;

import com.campusskills.modules.exchanges.handlers.ExchangeHandler;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;

public class ExchangeRouter {

    public static Router create(Vertx vertx) {
        ExchangeHandler handler = new ExchangeHandler(vertx.eventBus());
        Router router = Router.router(vertx);

        router.post("/").handler(handler::createExchange);
        router.post("/:id/accept").handler(handler::acceptExchange);
        router.post("/:id/reject").handler(handler::rejectExchange);
        router.post("/:id/cancel").handler(handler::cancelExchange);
        router.get("/me").handler(handler::getMyExchanges);

        return router;
    }
}
