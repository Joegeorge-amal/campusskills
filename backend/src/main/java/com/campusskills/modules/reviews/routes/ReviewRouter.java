package com.campusskills.modules.reviews.routes;

import com.campusskills.modules.reviews.handlers.ReviewHandler;
import com.campusskills.modules.reviews.repositories.ReviewRepository;
import com.campusskills.modules.reviews.services.ReviewService;
import com.campusskills.modules.sessions.repositories.SessionRepository;
import com.campusskills.modules.users.repositories.UserProfileRepository;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;

public class ReviewRouter {

    public static Router create(Vertx vertx) {
        Router router = Router.router(vertx);
        ReviewRepository reviewRepository = new ReviewRepository();
        SessionRepository sessionRepository = new SessionRepository();
        UserProfileRepository userProfileRepository = new UserProfileRepository();
        
        ReviewService reviewService = new ReviewService(reviewRepository, sessionRepository, userProfileRepository);
        ReviewHandler reviewHandler = new ReviewHandler(reviewService);

        router.post("/").handler(reviewHandler::createReview);
        router.get("/user/:userId").handler(reviewHandler::getUserReviews);
        return router;
    }
}
