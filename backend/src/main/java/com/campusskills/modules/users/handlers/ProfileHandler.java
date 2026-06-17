package com.campusskills.modules.users.handlers;

import java.util.List;
import com.campusskills.modules.users.repositories.UserProfileRepository;
import com.campusskills.modules.sessions.models.Session;
import com.campusskills.web.response.ApiResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import com.campusskills.modules.users.repositories.UserStatsRepository;
import com.campusskills.modules.sessions.repositories.SessionRepository;
import com.campusskills.modules.listings.repositories.ListingRepository;
import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.CompositeFuture;

public class ProfileHandler {

    private final UserProfileRepository userProfileRepository;
    private final UserStatsRepository userStatsRepository;
    private final ListingRepository listingRepository;
    private final SessionRepository sessionRepository;

    public ProfileHandler(UserProfileRepository userProfileRepository, UserStatsRepository userStatsRepository, ListingRepository listingRepository, SessionRepository sessionRepository) {
        this.userProfileRepository = userProfileRepository;
        this.userStatsRepository = userStatsRepository;
        this.listingRepository = listingRepository;
        this.sessionRepository = sessionRepository;
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

        Future<UserProfile> profileFut = userProfileRepository.findByUserId(userId);
        Future<JsonObject> statsFut = userStatsRepository.findByUserId(userId)
            .map(stats -> stats != null ? JsonObject.mapFrom(stats) : new JsonObject());
        Future<List<Session>> sessionsFut = sessionRepository.findCompletedSessionsByUser(userId);

        com.campusskills.modules.users.repositories.SkillVerificationRepository verifRepo =
            new com.campusskills.modules.users.repositories.SkillVerificationRepository();
        Future<JsonObject> verifFut = verifRepo.findByUserId(userId).map(verifications -> {
            JsonObject scores = new JsonObject();
            for (com.campusskills.modules.users.models.SkillVerification v : verifications) {
                if (v.getPassed() != null && v.getPassed() && v.getConfidenceScore() != null) {
                    String skill = v.getSkill();
                    Double existing = scores.getDouble(skill);
                    if (existing == null || v.getConfidenceScore() > existing) {
                        scores.put(skill, v.getConfidenceScore());
                    }
                }
            }
            return scores;
        });

        Future.all(profileFut, statsFut, verifFut, sessionsFut).map(composite -> {
            UserProfile profile = profileFut.result();
            if (profile == null) {
                throw new RuntimeException("PROFILE_NOT_FOUND");
            }

            List<Session> completedSessions = sessionsFut.result();
            int actualCount = completedSessions != null ? completedSessions.size() : 0;
            long actualMinutes = 0;
            if (completedSessions != null) {
                for (Session s : completedSessions) {
                    if (s.getScheduledEnd() != null && s.getScheduledStart() != null) {
                        actualMinutes += (s.getScheduledEnd() - s.getScheduledStart()) / 60000;
                    }
                }
            }

            JsonObject statsJson = statsFut.result();
            statsJson.put("sessionsCompleted", actualCount);
            statsJson.put("totalMinutes", (int) actualMinutes);

            JsonObject profileJson = JsonObject.mapFrom(profile);
            profileJson.remove("_id");
            profileJson.put("verificationScores", verifFut.result());

            return new JsonObject()
                .put("user", new JsonObject().put("userId", userId))
                .put("profile", profileJson)
                .put("stats", statsJson);
        })
            .onSuccess(json -> ApiResponse.ok(ctx, json))
            .onFailure(err -> {
                if ("PROFILE_NOT_FOUND".equals(err.getMessage()) || "PROFILE_NOT_FOUND".equals(err.getCause() != null ? err.getCause().getMessage() : null)) {
                    ApiResponse.notFound(ctx, "Profile not found");
                } else {
                    ApiResponse.internalError(ctx, err.getMessage());
                }
            });
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
