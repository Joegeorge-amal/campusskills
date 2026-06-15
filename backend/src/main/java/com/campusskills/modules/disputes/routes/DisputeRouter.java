package com.campusskills.modules.disputes.routes;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.disputes.handlers.DisputeHandler;
import com.campusskills.modules.disputes.repositories.DisputeRepository;
import com.campusskills.modules.disputes.services.DisputeService;
import com.campusskills.modules.sessions.repositories.SessionRepository;
import io.vertx.core.Vertx;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;

public class DisputeRouter {
    public static Router create(Vertx vertx, JWTAuth jwtAuth) {
        Router router = Router.router(vertx);
        
        DisputeRepository disputeRepository = new DisputeRepository(MongoManager.getClient());
        SessionRepository sessionRepository = new SessionRepository();
        DisputeService disputeService = new DisputeService(disputeRepository, sessionRepository);
        DisputeHandler handler = new DisputeHandler(disputeService);

        router.route().handler(com.campusskills.web.middleware.JwtAuthMiddleware.create(jwtAuth));

        router.post("/").handler(handler::createDispute);
        router.get("/my-disputes").handler(handler::getMyDisputes);

        return router;
    }
}
