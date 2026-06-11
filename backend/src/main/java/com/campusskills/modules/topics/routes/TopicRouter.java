package com.campusskills.modules.topics.routes;

import com.campusskills.modules.topics.handlers.TopicHandler;
import com.campusskills.modules.topics.repositories.TopicRepository;
import com.campusskills.modules.topics.services.TopicService;
import com.campusskills.web.middleware.JwtAuthMiddleware;
import io.vertx.core.Vertx;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;

public class TopicRouter {

    public static Router create(Vertx vertx, JWTAuth jwtAuth) {
        Router router = Router.router(vertx);

        TopicRepository repository = new TopicRepository();
        TopicService service = new TopicService(repository);
        TopicHandler handler = new TopicHandler(service);

        // Topic reads are public to allow onboarding to fetch them
        router.get("/").handler(handler::getAllTopics);
        router.get("/:id").handler(handler::getTopicById);

        return router;
    }
}
