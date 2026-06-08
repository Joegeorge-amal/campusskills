package com.campusskills.modules.users.routes;

import com.campusskills.modules.users.handlers.AuthHandler;
import com.campusskills.modules.users.repositories.UserRepository;
import com.campusskills.modules.users.repositories.UserProfileRepository;
import com.campusskills.modules.users.repositories.UserStatsRepository;
import com.campusskills.modules.users.repositories.UserWalletRepository;
import com.campusskills.modules.users.repositories.RefreshTokenRepository;
import com.campusskills.modules.users.services.UserService;
import io.vertx.core.Vertx;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;

import java.util.Arrays;
import java.util.List;

public class AuthRouter {

    public static Router create(Vertx vertx, JWTAuth jwtAuth) {
        Router router = Router.router(vertx);
        
        UserRepository userRepository = new UserRepository();
        UserProfileRepository profileRepository = new UserProfileRepository();
        UserStatsRepository statsRepository = new UserStatsRepository();
        UserWalletRepository walletRepository = new UserWalletRepository();
        RefreshTokenRepository refreshTokenRepository = new RefreshTokenRepository();
        com.campusskills.modules.users.repositories.OtpVerificationRepository otpRepository = new com.campusskills.modules.users.repositories.OtpVerificationRepository();
        com.campusskills.shared.services.EmailService emailService = new com.campusskills.shared.services.EmailService();
        
        // Load allowed domains (configurable, hardcoded here for testing setup as requested)
        List<String> allowedDomains = Arrays.asList("kristujayanti.com");
        
        UserService service = new UserService(
            userRepository, 
            profileRepository, 
            statsRepository, 
            walletRepository, 
            refreshTokenRepository,
            otpRepository,
            emailService,
            jwtAuth,
            allowedDomains
        );
        AuthHandler handler = new AuthHandler(service);

        router.post("/signup").handler(handler::signup);
        router.post("/login").handler(handler::login);
        router.post("/refresh").handler(handler::refresh);
        router.post("/logout").handler(handler::logout);

        return router;
    }
}
