package com.campusskills.modules.users.routes;

import com.campusskills.modules.users.handlers.VerificationHandler;
import com.campusskills.modules.users.repositories.SkillVerificationRepository;
import com.campusskills.modules.users.services.VerificationService;
import com.campusskills.web.middleware.JwtAuthMiddleware;
import io.vertx.core.Vertx;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;

public class VerificationRouter {
    public static Router create(Vertx vertx, JWTAuth jwtAuth) {
        Router router = Router.router(vertx);
        
        SkillVerificationRepository repository = new SkillVerificationRepository();
        VerificationService service = new VerificationService(repository);
        VerificationHandler handler = new VerificationHandler(service);

        router.route().handler(JwtAuthMiddleware.create(jwtAuth));
        
        router.get("/questions/:skill").handler(handler::getQuestions);
        router.post("/submit").handler(handler::submitVerification);
        router.get("/me").handler(handler::getMyRequests);

        return router;
    }
}
