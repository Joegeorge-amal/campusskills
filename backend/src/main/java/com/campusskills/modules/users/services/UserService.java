package com.campusskills.modules.users.services;

import com.campusskills.modules.users.models.User;
import com.campusskills.modules.users.models.UserProfile;
import com.campusskills.modules.users.models.UserStats;
import com.campusskills.modules.users.models.UserWallet;
import com.campusskills.modules.users.models.UserRole;
import com.campusskills.modules.users.repositories.UserRepository;
import com.campusskills.modules.users.repositories.UserProfileRepository;
import com.campusskills.modules.users.repositories.UserStatsRepository;
import com.campusskills.modules.users.repositories.UserWalletRepository;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.JWTOptions;
import io.vertx.ext.auth.jwt.JWTAuth;
import org.mindrot.jbcrypt.BCrypt;

import java.util.ArrayList;

public class UserService {
    
    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final UserStatsRepository statsRepository;
    private final UserWalletRepository walletRepository;
    private final JWTAuth jwtAuth;

    public UserService(UserRepository userRepository, 
                       UserProfileRepository profileRepository,
                       UserStatsRepository statsRepository,
                       UserWalletRepository walletRepository,
                       JWTAuth jwtAuth) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.statsRepository = statsRepository;
        this.walletRepository = walletRepository;
        this.jwtAuth = jwtAuth;
    }

    public Future<JsonObject> signup(String email, String password, String erpid, String displayName) {
        if (email == null || password == null) {
            return Future.failedFuture("email and password are required");
        }
        if (password.length() < 6) {
            return Future.failedFuture("Password must be at least 6 characters long");
        }

        return userRepository.findByEmail(email).compose(existing -> {
            if (existing != null) {
                return Future.failedFuture("EMAIL_EXISTS");
            }
            
            User user = new User();
            user.setEmail(email);
            user.setErpid(erpid);
            user.setRole(UserRole.USER); // Default to USER
            user.setIsActive(true);
            user.setPasswordHash(BCrypt.hashpw(password, BCrypt.gensalt()));

            return userRepository.createUser(user).compose(userId -> {
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

                return CompositeFuture.all(profileFut, statsFut, walletFut).map(cf -> generateAuthResponse(user));
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

            return Future.succeededFuture(generateAuthResponse(user));
        });
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
                throw new RuntimeException("User not found");
            }

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

    private JsonObject generateAuthResponse(User user) {
        String token = jwtAuth.generateToken(
            new JsonObject()
                .put("userId", user.getId())
                .put("role", user.getRole().name()),
            new JWTOptions().setExpiresInMinutes(24 * 60) // 24 hours
        );

        JsonObject userJson = JsonObject.mapFrom(user);
        userJson.remove("passwordHash"); // Prevent passwordHash from leaking in API response
        
        return new JsonObject()
            .put("token", token)
            .put("user", userJson);
    }
}
