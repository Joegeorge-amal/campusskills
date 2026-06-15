package com.campusskills.modules.users.handlers;

import com.campusskills.modules.users.repositories.UserProfileRepository;
import com.campusskills.web.response.ApiResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import com.campusskills.modules.users.repositories.UserStatsRepository;
import com.campusskills.modules.listings.repositories.ListingRepository;
import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;

public class ProfileHandler {

    private final UserProfileRepository userProfileRepository;
    private final UserStatsRepository userStatsRepository;
    private final ListingRepository listingRepository;

    public ProfileHandler(UserProfileRepository userProfileRepository, UserStatsRepository userStatsRepository, ListingRepository listingRepository) {
        this.userProfileRepository = userProfileRepository;
        this.userStatsRepository = userStatsRepository;
        this.listingRepository = listingRepository;
    }

    public void getPublicProfile(RoutingContext ctx) {
        String userId = ctx.pathParam("userId");
        if (userId == null || userId.trim().isEmpty()) {
            ApiResponse.badRequest(ctx, "userId is required");
            return;
        }

        userProfileRepository.findByUserId(userId).compose(profile -> {
            if (profile == null) {
                return Future.failedFuture("PROFILE_NOT_FOUND");
            }

            JsonObject profileJson = JsonObject.mapFrom(profile);
            profileJson.remove("_id");
            profileJson.remove("upi"); // Protect UPI privacy

            Future<JsonObject> statsFuture = userStatsRepository.findByUserId(userId)
                .map(stats -> {
                    JsonObject statsJson = stats != null ? JsonObject.mapFrom(stats) : new JsonObject();
                    statsJson.remove("_id");
                    return statsJson;
                });

            JsonObject searchFilters = new JsonObject().put("ownerId", userId);
            Future<JsonArray> listingsFuture = listingRepository.search(searchFilters, 1, 100)
                .map(listings -> {
                    JsonArray listingsArray = new JsonArray();
                    if (listings != null) {
                        for (var l : listings) {
                            listingsArray.add(JsonObject.mapFrom(l));
                        }
                    }
                    return listingsArray;
                });

            return Future.all(statsFuture, listingsFuture).map(composite -> {
                JsonObject statsJson = statsFuture.result();
                JsonArray listingsArray = listingsFuture.result();

                return new JsonObject()
                    .put("profile", profileJson)
                    .put("stats", statsJson)
                    .put("listings", listingsArray);
            });
        })
            .onSuccess(res -> ApiResponse.ok(ctx, res))
            .onFailure(err -> {
                if ("PROFILE_NOT_FOUND".equals(err.getMessage())) {
                    ApiResponse.notFound(ctx, "Profile not found");
                } else {
                    ApiResponse.internalError(ctx, err.getMessage());
                }
            });
    }
    public void getMe(RoutingContext ctx) {
        String userId = ctx.get("authenticatedUserId");

        if (userId == null) {
            ApiResponse.unauthorized(ctx, "Unauthorized");
            return;
        }

        userProfileRepository.findByUserId(userId)
            .onSuccess(profile -> {
                if (profile == null) {
                    ApiResponse.notFound(ctx, "Profile not found");
                    return;
                }

                JsonObject json = JsonObject.mapFrom(profile);
                json.remove("_id");

                ApiResponse.ok(ctx, json);
            })
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }

    public void updateMe(RoutingContext ctx) {
        String userId = ctx.get("authenticatedUserId");

        if (userId == null) {
            ApiResponse.unauthorized(ctx, "Unauthorized");
            return;
        }

        JsonObject body = ctx.body().asJsonObject();
        if (body == null || body.isEmpty()) {
            ApiResponse.badRequest(ctx, "No data provided");
            return;
        }

        // Explicitly whitelist fields to prevent pollution of user_profiles collection
        JsonObject safeUpdates = new JsonObject();
        
        if (body.containsKey("name")) safeUpdates.put("name", body.getString("name"));
        if (body.containsKey("programme")) safeUpdates.put("programme", body.getString("programme"));
        if (body.containsKey("phoneNumber")) safeUpdates.put("phoneNumber", body.getString("phoneNumber"));
        if (body.containsKey("year")) safeUpdates.put("year", body.getString("year"));
        if (body.containsKey("bio")) safeUpdates.put("bio", body.getString("bio"));
        if (body.containsKey("profilePicture")) safeUpdates.put("profilePicture", body.getString("profilePicture"));
        if (body.containsKey("avatarImg")) safeUpdates.put("avatarImg", body.getString("avatarImg"));
        if (body.containsKey("bannerImg")) safeUpdates.put("bannerImg", body.getString("bannerImg"));
        if (body.containsKey("avatarColor")) safeUpdates.put("avatarColor", body.getValue("avatarColor"));
        if (body.containsKey("upi")) safeUpdates.put("upi", body.getString("upi"));
        if (body.containsKey("skillsOffered")) safeUpdates.put("skillsOffered", body.getJsonArray("skillsOffered"));
        if (body.containsKey("skillsWanted")) safeUpdates.put("skillsWanted", body.getJsonArray("skillsWanted"));
        if (body.containsKey("verifiedSkills")) safeUpdates.put("verifiedSkills", body.getJsonArray("verifiedSkills"));
        if (body.containsKey("preferredTimes")) safeUpdates.put("preferredTimes", body.getJsonArray("preferredTimes"));
        if (body.containsKey("sessionPreference")) safeUpdates.put("sessionPreference", body.getString("sessionPreference"));
        if (body.containsKey("exchangePreference")) safeUpdates.put("exchangePreference", body.getString("exchangePreference"));
        if (body.containsKey("profileCompleted")) safeUpdates.put("profileCompleted", body.getBoolean("profileCompleted"));

        if (safeUpdates.isEmpty()) {
            ApiResponse.badRequest(ctx, "No valid profile fields provided for update");
            return;
        }

        userProfileRepository.updateProfile(userId, safeUpdates)
            .onSuccess(updated -> {
                if (!updated) {
                    ApiResponse.notFound(ctx, "Profile not found");
                    return;
                }
                ApiResponse.ok(ctx, new JsonObject().put("message", "Profile updated successfully"));
            })
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }
}
