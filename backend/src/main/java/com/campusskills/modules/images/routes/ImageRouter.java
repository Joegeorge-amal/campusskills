package com.campusskills.modules.images.routes;

import com.campusskills.modules.images.handlers.ImageHandler;
import com.campusskills.modules.images.services.CloudinaryService;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;

public class ImageRouter {

    public static Router create(Vertx vertx) {
        Router router = Router.router(vertx);
        CloudinaryService cloudinaryService = new CloudinaryService();
        ImageHandler imageHandler = new ImageHandler(cloudinaryService);

        router.get("/signature").handler(imageHandler::getSignature);

        return router;
    }
}
