package com.campusskills.modules.notifications.routes;

import com.campusskills.modules.notifications.handlers.NotificationHandler;
import com.campusskills.modules.notifications.repositories.NotificationRepository;
import com.campusskills.modules.notifications.services.NotificationService;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;

public class NotificationRouter {

    public static Router create(Vertx vertx) {
        Router router = Router.router(vertx);

        NotificationRepository repository = new NotificationRepository();
        NotificationService service = new NotificationService(repository, vertx.eventBus());
        NotificationHandler handler = new NotificationHandler(service);

        router.get("/").handler(handler::getNotifications);
        router.get("/unread").handler(handler::getUnreadNotifications);
        router.patch("/read-all").handler(handler::markAllAsRead);
        router.patch("/:id/read").handler(handler::markAsRead);
        router.delete("/:id").handler(handler::deleteNotification);

        return router;
    }
}
