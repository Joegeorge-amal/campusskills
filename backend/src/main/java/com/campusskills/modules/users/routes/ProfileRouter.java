package com.campusskills.modules.users.routes;

import com.campusskills.modules.users.handlers.ProfileHandler;
import com.campusskills.modules.users.repositories.UserProfileRepository;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;

public class ProfileRouter {

    public static Router create(Vertx vertx) {
        Router router = Router.router(vertx);
        
        UserProfileRepository userProfileRepository = new UserProfileRepository();
        ProfileHandler profileHandler = new ProfileHandler(userProfileRepository);

        router.get("/:userId").handler(profileHandler::getPublicProfile);
        
        return router;
    }
}
