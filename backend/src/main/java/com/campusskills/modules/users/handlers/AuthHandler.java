package com.campusskills.modules.users.handlers;

import com.campusskills.modules.users.services.UserService;
import com.campusskills.web.response.ApiResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class AuthHandler {
    
    private final UserService userService;

    public AuthHandler(UserService userService) {
        this.userService = userService;
    }

    public void signup(RoutingContext ctx) {
        try {
            JsonObject body = ctx.body().asJsonObject();
            String email = body.getString("email");
            String password = body.getString("password");
            String displayName = body.getString("displayName");
            String erpid = body.getString("erpid");

            userService.signup(email, password, erpid, displayName)
                .onSuccess(data -> ApiResponse.created(ctx, data))
                .onFailure(err -> {
                    if ("EMAIL_EXISTS".equals(err.getMessage())) {
                        ApiResponse.conflict(ctx, "Email already exists");
                    } else {
                        ApiResponse.badRequest(ctx, err.getMessage());
                    }
                });
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid JSON format");
        }
    }

    public void login(RoutingContext ctx) {
        try {
            JsonObject body = ctx.body().asJsonObject();
            String email = body.getString("email");
            String password = body.getString("password");

            userService.login(email, password)
                .onSuccess(data -> ApiResponse.ok(ctx, data))
                .onFailure(err -> {
                    if ("INVALID_CREDENTIALS".equals(err.getMessage())) {
                        ApiResponse.sendError(ctx, 401, "Invalid email or password");
                    } else {
                        ApiResponse.badRequest(ctx, err.getMessage());
                    }
                });
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid JSON format");
        }
    }
}
