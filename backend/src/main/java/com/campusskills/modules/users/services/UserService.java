package com.campusskills.modules.users.services;

import com.campusskills.modules.users.models.User;
import com.campusskills.modules.users.models.UserProfile;
import com.campusskills.modules.users.models.UserStats;
import com.campusskills.modules.users.models.UserWallet;
import com.campusskills.modules.users.models.UserRole;
import com.campusskills.modules.users.models.RefreshToken;
import com.campusskills.modules.users.repositories.UserRepository;
import com.campusskills.modules.users.repositories.UserProfileRepository;
import com.campusskills.modules.users.repositories.UserStatsRepository;
import com.campusskills.modules.users.repositories.UserWalletRepository;
import com.campusskills.modules.users.repositories.RefreshTokenRepository;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.JWTOptions;
import io.vertx.ext.auth.jwt.JWTAuth;
import org.mindrot.jbcrypt.BCrypt;

import java.util.ArrayList;
import java.util.List;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

public class UserService {
    
    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final UserStatsRepository statsRepository;
    private final UserWalletRepository walletRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JWTAuth jwtAuth;
    private final List<String> allowedDomains;

    public UserService(UserRepository userRepository, 
                       UserProfileRepository profileRepository,
                       UserStatsRepository statsRepository,
                       UserWalletRepository walletRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       JWTAuth jwtAuth,
                       List<String> allowedDomains) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.statsRepository = statsRepository;
        this.walletRepository = walletRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtAuth = jwtAuth;
        this.allowedDomains = allowedDomains != null ? allowedDomains : new ArrayList<>();
    }
    
    private String generateSecureToken() {
        byte[] randomBytes = new byte[32];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
    
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    public Future<JsonObject> signup(String email, String password, String displayName) {
        if (email == null || password == null) {
            return Future.failedFuture("email and password are required");
        }
        if (password.length() < 6) {
            return Future.failedFuture("Password must be at least 6 characters long");
        }
        
        if (!allowedDomains.isEmpty()) {
            String[] parts = email.split("@");
            if (parts.length != 2 || !allowedDomains.contains(parts[1].toLowerCase())) {
                return Future.failedFuture("DOMAIN_NOT_ALLOWED");
            }
        }

        return userRepository.findByEmail(email).compose(existing -> {
            if (existing != null) {
                return Future.failedFuture("EMAIL_EXISTS");
            }
            
            User user = new User();
            user.setEmail(email);
            user.setRole(UserRole.USER); // Default to USER
            user.setIsActive(true);
            user.setEmailVerified(false); // Default for all new signups
            user.setPasswordHash(BCrypt.hashpw(password, BCrypt.gensalt()));

            return userRepository.createUser(user).compose(userId -> {
                System.out.println("[AUTH] Created new user: " + userId + " with email: " + email);
                user.setId(userId);
                
                UserProfile profile = new UserProfile();
                profile.setUserId(userId);
                profile.setDisplayName(displayName != null ? displayName : email.split("@")[0]);
                profile.setSkillsOffered(new ArrayList<>());
                profile.setSkillsWanted(new ArrayList<>());
                profile.setProfileCompleted(false);

                UserStats stats = new UserStats();
                stats.setUserId(userId);
                stats.setRatingAvg(0.0);
                stats.setRatingCount(0);
                stats.setSessionsCompleted(0);
                stats.setSessionsAttended(0);

                UserWallet wallet = new UserWallet();
                wallet.setUserId(userId);
                wallet.setBalance(0.0);

                Future<String> profileFut = profileRepository.createProfile(profile);
                Future<String> statsFut = statsRepository.createStats(stats);
                Future<String> walletFut = walletRepository.createWallet(wallet);

                return CompositeFuture.all(profileFut, statsFut, walletFut)
                    .compose(cf -> generateAuthResponse(user));
            });
        });
    }

    public Future<JsonObject> login(String email, String password) {
        if (email == null || password == null) {
            return Future.failedFuture("email and password are required");
        }

        return userRepository.findByEmail(email).compose(user -> {
            if (user == null) {
                return Future.failedFuture("INVALID_CREDENTIALS");
            }

            if (!BCrypt.checkpw(password, user.getPasswordHash())) {
                return Future.failedFuture("INVALID_CREDENTIALS");
            }

            return generateAuthResponse(user);
        });
    }

    public Future<JsonObject> refresh(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.trim().isEmpty()) {
            return Future.failedFuture("MISSING_REFRESH_TOKEN");
        }
        
        String tokenHash = hashToken(rawRefreshToken);
        
        return refreshTokenRepository.findByTokenHash(tokenHash).compose(token -> {
            if (token == null) {
                return Future.failedFuture("INVALID_REFRESH_TOKEN");
            }
            if (token.getExpiresAt() < System.currentTimeMillis()) {
                return refreshTokenRepository.deleteByTokenHash(tokenHash)
                    .compose(v -> Future.failedFuture("EXPIRED_REFRESH_TOKEN"));
            }
            
            return userRepository.findById(token.getUserId()).compose(user -> {
                if (user == null || !user.getIsActive()) {
                    return Future.failedFuture("INVALID_USER");
                }
                
                String accessToken = jwtAuth.generateToken(
                    new JsonObject()
                        .put("userId", user.getId())
                        .put("role", user.getRole().name()),
                    new JWTOptions().setExpiresInMinutes(15) // 15 mins
                );
                
                return Future.succeededFuture(new JsonObject().put("token", accessToken));
            });
        });
    }

    public Future<Void> logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.trim().isEmpty()) {
            // Idempotent success if no token is provided to revoke
            return Future.succeededFuture();
        }
        
        String tokenHash = hashToken(rawRefreshToken);
        // We delete the token if it exists. If it doesn't, no error is thrown (idempotent).
        return refreshTokenRepository.deleteByTokenHash(tokenHash);
    }

    public Future<JsonObject> getFullProfile(String userId) {
        Future<User> userFut = userRepository.findById(userId);
        Future<UserProfile> profileFut = profileRepository.findByUserId(userId);
        Future<UserStats> statsFut = statsRepository.findByUserId(userId);
        Future<UserWallet> walletFut = walletRepository.findByUserId(userId);

        return CompositeFuture.all(userFut, profileFut, statsFut, walletFut).map(cf -> {
            User user = cf.resultAt(0);
            UserProfile profile = cf.resultAt(1);
            UserStats stats = cf.resultAt(2);
            UserWallet wallet = cf.resultAt(3);

            if (user == null) {
                System.out.println("[AUTH] Failed to fetch profile. User not found for ID: " + userId);
                throw new RuntimeException("User not found");
            }

            System.out.println("[AUTH] Successfully aggregated profile for user ID: " + userId);
            JsonObject response = new JsonObject();
            
            JsonObject userJson = JsonObject.mapFrom(user);
            userJson.remove("passwordHash");
            response.put("user", userJson);
            
            if (profile != null) response.put("profile", JsonObject.mapFrom(profile));
            if (stats != null) response.put("stats", JsonObject.mapFrom(stats));
            if (wallet != null) response.put("wallet", JsonObject.mapFrom(wallet));

            return response;
        });
    }

    private Future<JsonObject> generateAuthResponse(User user) {
        String accessToken = jwtAuth.generateToken(
            new JsonObject()
                .put("userId", user.getId())
                .put("role", user.getRole().name()),
            new JWTOptions().setExpiresInMinutes(15) // 15 minutes access token
        );
        
        String rawRefreshToken = generateSecureToken();
        String tokenHash = hashToken(rawRefreshToken);
        
        RefreshToken rToken = new RefreshToken();
        rToken.setUserId(user.getId());
        rToken.setTokenHash(tokenHash);
        rToken.setExpiresAt(System.currentTimeMillis() + (30L * 24 * 60 * 60 * 1000)); // 30 days

        return refreshTokenRepository.create(rToken).map(v -> {
            JsonObject userJson = JsonObject.mapFrom(user);
            userJson.remove("passwordHash"); 
            
            return new JsonObject()
                .put("token", accessToken)
                .put("refreshToken", rawRefreshToken)
                .put("user", userJson);
        });
    }
}
