package com.campusskills.modules.users.routes;

import com.campusskills.modules.users.handlers.UserHandler;
import com.campusskills.modules.users.repositories.UserRepository;
import com.campusskills.modules.users.repositories.UserProfileRepository;
import com.campusskills.modules.users.repositories.UserStatsRepository;
import com.campusskills.modules.users.repositories.UserWalletRepository;
import com.campusskills.modules.users.services.UserService;
import com.campusskills.web.middleware.JwtAuthMiddleware;
import io.vertx.core.Vertx;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;

public class UserRouter {

    public static Router create(Vertx vertx, JWTAuth jwtAuth) {
        Router router = Router.router(vertx);
        
        UserRepository userRepository = new UserRepository();
        UserProfileRepository profileRepository = new UserProfileRepository();
        UserStatsRepository statsRepository = new UserStatsRepository();
        UserWalletRepository walletRepository = new UserWalletRepository();
        com.campusskills.modules.users.repositories.RefreshTokenRepository refreshTokenRepository = new com.campusskills.modules.users.repositories.RefreshTokenRepository();
        
        java.util.List<String> allowedDomains = java.util.Arrays.asList("kristujayanti.com");
        
        UserService service = new UserService(
            userRepository, 
            profileRepository, 
            statsRepository, 
            walletRepository, 
            refreshTokenRepository,
            jwtAuth,
            allowedDomains
        );
        
        UserHandler handler = new UserHandler(service);

        router.get("/me").handler(handler::getMyProfile);

        return router;
    }
}
