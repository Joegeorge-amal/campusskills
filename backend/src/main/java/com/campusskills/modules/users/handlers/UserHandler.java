package com.campusskills.modules.users.handlers;

import com.campusskills.modules.users.services.UserService;
import com.campusskills.web.response.ApiResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class UserHandler {
    
    private final UserService userService;

    public UserHandler(UserService userService) {
        this.userService = userService;
    }

    public void getMyProfile(RoutingContext ctx) {
        try {
            String userId = ctx.get("authenticatedUserId");
            if (userId == null) {
                ApiResponse.sendError(ctx, 401, "Unauthorized");
                return;
            }

            userService.getFullProfile(userId)
                .onSuccess(data -> ApiResponse.ok(ctx, data))
                .onFailure(err -> {
                    if ("User not found".equals(err.getMessage())) {
                        ApiResponse.sendError(ctx, 404, "User not found");
                    } else {
                        ApiResponse.sendError(ctx, 500, err.getMessage());
                    }
                });
        } catch (Exception e) {
            ApiResponse.sendError(ctx, 500, "Internal Server Error");
        }
    }

    public void verifyEmail(RoutingContext ctx) {
        String userId = ctx.get("authenticatedUserId");
        if (userId == null) {
            ApiResponse.sendError(ctx, 401, "Unauthorized");
            return;
        }

        JsonObject body = ctx.body().asJsonObject();
        if (body == null || !body.containsKey("otp")) {
            ApiResponse.badRequest(ctx, "Missing OTP");
            return;
        }

        userService.verifyEmail(userId, body.getString("otp"))
            .onSuccess(data -> ApiResponse.ok(ctx, data))
            .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
    }

    public void resendOtp(RoutingContext ctx) {
        String userId = ctx.get("authenticatedUserId");
        if (userId == null) {
            ApiResponse.sendError(ctx, 401, "Unauthorized");
            return;
        }

        userService.resendOtp(userId)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("success", true).put("message", "OTP sent successfully")))
            .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
    }
}
