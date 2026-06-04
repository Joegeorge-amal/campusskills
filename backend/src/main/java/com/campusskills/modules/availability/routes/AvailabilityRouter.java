package com.campusskills.modules.availability.routes;

import com.campusskills.modules.availability.handlers.AvailabilityHandler;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;

public class AvailabilityRouter {

    public static Router create(Vertx vertx) {
        AvailabilityHandler handler = new AvailabilityHandler();
        Router router = Router.router(vertx);

        // Public-ish endpoint to get availability for a user
        router.get("/:userId").handler(handler::getUserAvailability);

        // Protected endpoints
        router.put("/me").handler(handler::updateMySlots);
        router.post("/me/exceptions").handler(handler::addMyException);
        router.delete("/me/exceptions/:exceptionId").handler(handler::deleteMyException);

        return router;
    }
}
