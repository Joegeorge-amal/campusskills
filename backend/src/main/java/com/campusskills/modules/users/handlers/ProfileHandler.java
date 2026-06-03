package com.campusskills.modules.users.handlers;

import com.campusskills.modules.users.repositories.UserProfileRepository;
import com.campusskills.web.response.ApiResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class ProfileHandler {

    private final UserProfileRepository userProfileRepository;

    public ProfileHandler(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    public void getPublicProfile(RoutingContext ctx) {
        String userId = ctx.pathParam("userId");
        if (userId == null || userId.trim().isEmpty()) {
            ApiResponse.badRequest(ctx, "userId is required");
            return;
        }

        userProfileRepository.findByUserId(userId)
            .onSuccess(profile -> {
                if (profile == null) {
                    ApiResponse.notFound(ctx, "Profile not found");
                    return;
                }

                JsonObject json = JsonObject.mapFrom(profile);
                // Clean internal database ID
                json.remove("_id");

                // Note: The user requested to KEEP profileCompleted, so we are not stripping it.
                // We are also keeping averageRating and reviewCount, as they are naturally on the profile.
                // No sensitive data (email, password, role) exists on UserProfile, so this is safe.

                ApiResponse.ok(ctx, json);
            })
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }
}
