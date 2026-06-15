package com.campusskills.modules.reports.routes;

import com.campusskills.modules.reports.handlers.ReportHandler;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;

public class ReportRouter {

    public static Router create(Vertx vertx) {
        ReportHandler handler = new ReportHandler();
        Router router = Router.router(vertx);

        router.route().handler(BodyHandler.create());

        router.post("/").handler(handler::createReport);

        return router;
    }
}
