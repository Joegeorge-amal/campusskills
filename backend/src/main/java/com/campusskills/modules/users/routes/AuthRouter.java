package com.campusskills.modules.users.routes;

import com.campusskills.modules.users.handlers.AuthHandler;
import com.campusskills.modules.users.repositories.UserRepository;
import com.campusskills.modules.users.services.UserService;
import io.vertx.core.Vertx;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;

public class AuthRouter {

    public static Router create(Vertx vertx, JWTAuth jwtAuth) {
        Router router = Router.router(vertx);
        
        UserRepository repository = new UserRepository();
        UserService service = new UserService(repository, jwtAuth);
        AuthHandler handler = new AuthHandler(service);

        router.post("/signup").handler(handler::signup);
        router.post("/login").handler(handler::login);

        return router;
    }
}
