package com.campusskills.modules.listings.routes;

import com.campusskills.modules.listings.handlers.ListingHandler;
import com.campusskills.modules.listings.repositories.ListingRepository;
import com.campusskills.modules.listings.services.ListingService;
import com.campusskills.web.middleware.JwtAuthMiddleware;
import io.vertx.core.Vertx;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;

public class ListingRouter {

    public static Router create(Vertx vertx, JWTAuth jwtAuth) {
        Router router = Router.router(vertx);
        
        ListingRepository repository = new ListingRepository();
        ListingService service = new ListingService(repository);
        ListingHandler handler = new ListingHandler(service);

        // POST /listings is protected
        router.post("/").handler(JwtAuthMiddleware.create(jwtAuth)).handler(handler::createListing);

        // GET /listings is public
        router.get("/").handler(handler::getAllListings);
        
        // GET /listings/:id is public
        router.get("/:id").handler(handler::getListingById);

        return router;
    }
}
