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
import com.campusskills.core.config.Env;

public class UserRouter {

    public static Router create(Vertx vertx, JWTAuth jwtAuth, com.campusskills.shared.services.EmailService emailService) {
        Router router = Router.router(vertx);
        
        UserRepository userRepository = new UserRepository();
        UserProfileRepository profileRepository = new UserProfileRepository();
        UserStatsRepository statsRepository = new UserStatsRepository();
        UserWalletRepository walletRepository = new UserWalletRepository();
        com.campusskills.modules.users.repositories.RefreshTokenRepository refreshTokenRepository = new com.campusskills.modules.users.repositories.RefreshTokenRepository();
        com.campusskills.modules.users.repositories.OtpVerificationRepository otpRepository = new com.campusskills.modules.users.repositories.OtpVerificationRepository();
        
        String domainsEnv = Env.getOrDefault("ALLOWED_DOMAINS", "kristujayanti.com");
        java.util.List<String> allowedDomains = java.util.Arrays.asList(domainsEnv.split(","));
        
        UserService service = new UserService(
            userRepository, 
            profileRepository, 
            statsRepository, 
            walletRepository, 
            refreshTokenRepository,
            otpRepository,
            emailService,
            jwtAuth,
            allowedDomains,
            vertx.eventBus()
        );
        
        UserHandler handler = new UserHandler(service);

        router.get("/me").handler(handler::getMyProfile);
        router.get("/public/:identifier").handler(handler::getPublicProfile);
        router.post("/me/verify-email").handler(handler::verifyEmail);
        router.post("/me/resend-otp").handler(handler::resendOtp);
        router.post("/me/verify-2fa").handler(handler::verifyTwoFactorOtp);
        router.post("/me/resend-2fa-otp").handler(handler::resendTwoFactorOtp);
        router.post("/me/block").handler(handler::blockUser);
        router.post("/me/unblock").handler(handler::unblockUser);

        return router;
    }
}
