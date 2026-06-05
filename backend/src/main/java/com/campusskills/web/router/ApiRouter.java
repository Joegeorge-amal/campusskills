package com.campusskills.web.router;

import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;

import com.campusskills.modules.chats.routes.ChatRouter;
import com.campusskills.modules.messages.routes.MessageRouter;
import com.campusskills.modules.sessions.routes.SessionRouter;
import com.campusskills.modules.users.routes.AuthRouter;
import com.campusskills.modules.users.routes.UserRouter;
import com.campusskills.modules.listings.routes.ListingRouter;

import com.campusskills.web.middleware.RequestIdMiddleware;
import com.campusskills.web.middleware.GlobalErrorHandler;
import com.campusskills.web.middleware.JwtAuthMiddleware;

import io.vertx.core.http.HttpMethod;
import io.vertx.ext.web.handler.CorsHandler;
import io.vertx.ext.auth.jwt.JWTAuth;

public class ApiRouter {
    
    public static Router create(Vertx vertx, JWTAuth jwtAuth, String frontendOrigin) {
        Router router = Router.router(vertx);
        
        // 1. CORS Middleware MUST be absolute first to intercept preflights properly
        router.route().handler(CorsHandler.create()
            .addRelativeOrigin(frontendOrigin)
            .allowedMethod(HttpMethod.GET)
            .allowedMethod(HttpMethod.POST)
            .allowedMethod(HttpMethod.PATCH)
            .allowedMethod(HttpMethod.DELETE)
            .allowedMethod(HttpMethod.OPTIONS)
            .allowedHeader("Content-Type")
            .allowedHeader("Authorization"));

        // 2. Add global middleware
        router.route().handler(RequestIdMiddleware.create());
        
        // 3. Body parsing
        router.route().handler(BodyHandler.create());
        
        // 4. Public Routes
        router.mountSubRouter("/auth", AuthRouter.create(vertx, jwtAuth));

        // 5. Protected Routes Middleware
        router.route("/users/*").handler(JwtAuthMiddleware.create(jwtAuth));
        router.route("/chats/*").handler(JwtAuthMiddleware.create(jwtAuth));
        router.route("/messages/*").handler(JwtAuthMiddleware.create(jwtAuth));
        router.route("/sessions/*").handler(JwtAuthMiddleware.create(jwtAuth));
        router.route("/chat-requests/*").handler(JwtAuthMiddleware.create(jwtAuth));
        router.route("/exchanges/*").handler(JwtAuthMiddleware.create(jwtAuth));
        router.route("/notifications/*").handler(JwtAuthMiddleware.create(jwtAuth));
        router.route("/reviews/*").handler(JwtAuthMiddleware.create(jwtAuth));
        router.route("/profiles/*").handler(JwtAuthMiddleware.create(jwtAuth));
        router.route("/availability/*").handler(JwtAuthMiddleware.create(jwtAuth));

        // 6. Modules Routing
        router.mountSubRouter("/users", UserRouter.create(vertx, jwtAuth));
        router.mountSubRouter("/profiles", com.campusskills.modules.users.routes.ProfileRouter.create(vertx));
        router.mountSubRouter("/chats", ChatRouter.create(vertx));
        router.mountSubRouter("/messages", MessageRouter.create(vertx));
        router.mountSubRouter("/sessions", SessionRouter.create(vertx));
        router.mountSubRouter("/listings", ListingRouter.create(vertx, jwtAuth));
        router.mountSubRouter("/chat-requests", com.campusskills.modules.chatrequests.routes.ChatRequestRouter.create(vertx));
        router.mountSubRouter("/exchanges", com.campusskills.modules.exchanges.routes.ExchangeRouter.create(vertx));
        router.mountSubRouter("/notifications", com.campusskills.modules.notifications.routes.NotificationRouter.create(vertx));
        router.mountSubRouter("/reviews", com.campusskills.modules.reviews.routes.ReviewRouter.create(vertx));
        router.mountSubRouter("/topics", com.campusskills.modules.topics.routes.TopicRouter.create(vertx, jwtAuth));
        router.mountSubRouter("/availability", com.campusskills.modules.availability.routes.AvailabilityRouter.create(vertx));
        router.mountSubRouter("/admin", com.campusskills.modules.admin.routes.AdminRouter.create(vertx, jwtAuth));
        
        // Global Error Handling
        router.route().failureHandler(GlobalErrorHandler.create());

        return router;
    }
}
