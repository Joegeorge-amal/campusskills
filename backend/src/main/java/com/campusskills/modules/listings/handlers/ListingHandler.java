package com.campusskills.modules.listings.handlers;

import com.campusskills.modules.listings.models.Listing;
import com.campusskills.modules.listings.services.ListingService;
import com.campusskills.shared.models.SkillProfile;
import com.campusskills.web.response.ApiResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.util.Arrays;
import java.util.List;

public class ListingHandler {

    private final ListingService listingService;
    private static final List<String> VALID_DAYS = Arrays.asList("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY");

    public ListingHandler(ListingService listingService) {
        this.listingService = listingService;
    }

    public void createListing(RoutingContext ctx) {
        try {
            String authenticatedUserId = ctx.get("authenticatedUserId");
            if (authenticatedUserId == null) {
                ApiResponse.sendError(ctx, 401, "Unauthorized");
                return;
            }

            JsonObject body = ctx.body().asJsonObject();
            if (body == null) {
                ApiResponse.sendError(ctx, 400, "Missing request body");
                return;
            }

            Listing listing;
            try {
                listing = body.mapTo(Listing.class);
            } catch (IllegalArgumentException e) {
                ApiResponse.badRequest(ctx, "Invalid payload or enum value");
                return;
            }

            // 1. Required Text Fields
            if (listing.getTitle() == null || listing.getTitle().trim().isEmpty()) {
                ApiResponse.badRequest(ctx, "Title is required");
                return;
            }
            if (listing.getDescription() == null || listing.getDescription().trim().isEmpty()) {
                ApiResponse.badRequest(ctx, "Description is required");
                return;
            }
            if (listing.getCategory() == null || listing.getCategory().trim().isEmpty()) {
                ApiResponse.badRequest(ctx, "Category is required");
                return;
            }
            if (listing.getAvailableHours() == null || listing.getAvailableHours().trim().isEmpty()) {
                ApiResponse.badRequest(ctx, "Available hours are required");
                return;
            }

            // 2. Skills Validation
            if (listing.getSkills() == null || listing.getSkills().isEmpty()) {
                ApiResponse.badRequest(ctx, "At least one skill is required");
                return;
            }
            for (SkillProfile skill : listing.getSkills()) {
                if (skill.getName() == null || skill.getName().trim().isEmpty()) {
                    ApiResponse.badRequest(ctx, "Skill name is required and cannot be blank");
                    return;
                }
                if (skill.getLevel() == null) {
                    ApiResponse.badRequest(ctx, "Skill level is required");
                    return;
                }
            }

            // 3. Available Days Validation
            if (listing.getAvailableDays() == null || listing.getAvailableDays().isEmpty()) {
                ApiResponse.badRequest(ctx, "At least one available day is required");
                return;
            }
            for (String day : listing.getAvailableDays()) {
                if (day == null || day.trim().isEmpty()) {
                    ApiResponse.badRequest(ctx, "Available day cannot be blank");
                    return;
                }
                if (!VALID_DAYS.contains(day.trim().toUpperCase())) {
                    ApiResponse.badRequest(ctx, "Invalid available day: " + day);
                    return;
                }
            }

            // 4. Enums Null Checks (Since they could be missing from payload)
            if (listing.getSessionType() == null) {
                ApiResponse.badRequest(ctx, "SessionType is required");
                return;
            }
            if (listing.getAvailability() == null) {
                ApiResponse.badRequest(ctx, "Availability is required");
                return;
            }

            // ENFORCE authenticated user identity! Ignore any teacherId passed from frontend
            listing.setTeacherId(authenticatedUserId);

            listingService.createListing(listing)
                .onSuccess(listingId -> {
                    JsonObject response = new JsonObject().put("id", listingId);
                    ApiResponse.created(ctx, response);
                })
                .onFailure(err -> ApiResponse.sendError(ctx, 500, "Failed to create listing"));

        } catch (Exception e) {
            e.printStackTrace();
            ApiResponse.sendError(ctx, 400, "Invalid request payload");
        }
    }

    public void getAllListings(RoutingContext ctx) {
        listingService.findAllActive()
            .onSuccess(listings -> {
                io.vertx.core.json.JsonArray jsonArray = new io.vertx.core.json.JsonArray();
                for (Listing l : listings) {
                    jsonArray.add(JsonObject.mapFrom(l));
                }
                ApiResponse.ok(ctx, jsonArray);
            })
            .onFailure(err -> {
                err.printStackTrace();
                ApiResponse.internalError(ctx, "Failed to retrieve listings");
            });
    }

    public void getListingById(RoutingContext ctx) {
        String id = ctx.pathParam("id");
        if (id == null || id.trim().isEmpty()) {
            ApiResponse.badRequest(ctx, "Listing ID is required");
            return;
        }

        listingService.getListingById(id)
            .onSuccess(listing -> ApiResponse.ok(ctx, JsonObject.mapFrom(listing)))
            .onFailure(err -> {
                if ("NOT_FOUND".equals(err.getMessage())) {
                    ApiResponse.notFound(ctx, "Listing not found");
                } else {
                    err.printStackTrace();
                    ApiResponse.internalError(ctx, "Failed to retrieve listing");
                }
            });
    }
}
