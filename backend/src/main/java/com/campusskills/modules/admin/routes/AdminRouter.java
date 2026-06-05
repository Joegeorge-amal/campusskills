package com.campusskills.modules.admin.routes;

import com.campusskills.modules.admin.handlers.AdminHandler;
import com.campusskills.modules.admin.repositories.AdminRepository;
import com.campusskills.modules.admin.services.AdminService;
import com.campusskills.web.middleware.JwtAuthMiddleware;
import io.vertx.core.Vertx;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;

public class AdminRouter {

    public static Router create(Vertx vertx, JWTAuth jwtAuth) {
        Router router = Router.router(vertx);
        
        AdminRepository repository = new AdminRepository();
        AdminService service = new AdminService(repository);
        AdminHandler handler = new AdminHandler(service);

        router.route().handler(JwtAuthMiddleware.create(jwtAuth));
        router.route().handler(com.campusskills.web.middleware.RequireAdminMiddleware.create());
        
        router.get("/users").handler(handler::getUsers);
        router.patch("/users/:id/status").handler(handler::updateUserStatus);
        
        router.get("/disputes").handler(handler::getDisputes);
        router.patch("/disputes/:id").handler(handler::updateDisputeStatus);
        
        router.get("/sessions").handler(handler::getSessions);
        router.patch("/sessions/:id/cancel").handler(handler::cancelSession);

        router.get("/listings").handler(handler::getListings);
        router.patch("/listings/:id/status").handler(handler::updateListingStatus);

        return router;
    }
}
