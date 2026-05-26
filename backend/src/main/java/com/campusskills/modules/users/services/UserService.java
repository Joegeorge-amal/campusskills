package com.campusskills.modules.users.services;

import com.campusskills.modules.users.models.User;
import com.campusskills.modules.users.repositories.UserRepository;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.JWTOptions;
import io.vertx.ext.auth.jwt.JWTAuth;
import org.mindrot.jbcrypt.BCrypt;

public class UserService {
    
    private final UserRepository repository;
    private final JWTAuth jwtAuth;

    public UserService(UserRepository repository, JWTAuth jwtAuth) {
        this.repository = repository;
        this.jwtAuth = jwtAuth;
    }

    public Future<JsonObject> signup(String email, String password, String displayName, String role) {
        if (email == null || password == null || displayName == null) {
            return Future.failedFuture("email, password, and displayName are required");
        }
        if (password.length() < 6) {
            return Future.failedFuture("Password must be at least 6 characters long");
        }

        return repository.findByEmail(email).compose(existing -> {
            if (existing != null) {
                return Future.failedFuture("EMAIL_EXISTS");
            }
            
            User user = new User();
            user.setEmail(email);
            user.setDisplayName(displayName);
            user.setRole(role != null ? role : "STUDENT"); // Default role
            user.setPasswordHash(BCrypt.hashpw(password, BCrypt.gensalt()));

            return repository.createUser(user).compose(id -> {
                user.setId(id);
                return Future.succeededFuture(generateAuthResponse(user));
            });
        });
    }

    public Future<JsonObject> login(String email, String password) {
        if (email == null || password == null) {
            return Future.failedFuture("email and password are required");
        }

        return repository.findByEmail(email).compose(user -> {
            if (user == null) {
                return Future.failedFuture("INVALID_CREDENTIALS");
            }

            if (!BCrypt.checkpw(password, user.getPasswordHash())) {
                return Future.failedFuture("INVALID_CREDENTIALS");
            }

            return Future.succeededFuture(generateAuthResponse(user));
        });
    }

    private JsonObject generateAuthResponse(User user) {
        String token = jwtAuth.generateToken(
            new JsonObject()
                .put("userId", user.getId())
                .put("role", user.getRole()),
            new JWTOptions().setExpiresInMinutes(24 * 60) // 24 hours
        );

        JsonObject userJson = JsonObject.mapFrom(user);
        userJson.remove("passwordHash"); // Prevent passwordHash from leaking in API response
        
        return new JsonObject()
            .put("token", token)
            .put("user", userJson);
    }
}
