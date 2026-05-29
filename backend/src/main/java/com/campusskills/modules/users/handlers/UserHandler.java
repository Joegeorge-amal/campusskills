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
            JsonObject authUser = ctx.get("user");
            if (authUser == null || authUser.getString("userId") == null) {
                ApiResponse.sendError(ctx, 401, "Unauthorized");
                return;
            }
            
            String userId = authUser.getString("userId");

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
}
