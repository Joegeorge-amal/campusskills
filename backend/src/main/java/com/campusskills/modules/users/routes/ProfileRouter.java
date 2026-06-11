package com.campusskills.modules.users.routes;

import com.campusskills.modules.users.handlers.ProfileHandler;
import com.campusskills.modules.users.repositories.UserProfileRepository;
import com.campusskills.modules.users.repositories.UserStatsRepository;
import com.campusskills.modules.listings.repositories.ListingRepository;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;

public class ProfileRouter {

    public static Router create(Vertx vertx) {
        Router router = Router.router(vertx);
        
        UserProfileRepository userProfileRepository = new UserProfileRepository();
        UserStatsRepository userStatsRepository = new UserStatsRepository();
        ListingRepository listingRepository = new ListingRepository();
        ProfileHandler profileHandler = new ProfileHandler(userProfileRepository, userStatsRepository, listingRepository);

        router.get("/me").handler(profileHandler::getMe);
        router.patch("/me").handler(profileHandler::updateMe);
        router.get("/:userId").handler(profileHandler::getPublicProfile);
        
        return router;
    }
}
