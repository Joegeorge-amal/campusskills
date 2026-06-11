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

            // Trigger dual-write sync so legacy and new fields are populated
            listing.prepareForSave();

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

            // 2. Deep Skill Validation (Check any populated skill arrays)
            if (listing.getOfferedSkills() != null) {
                for (SkillProfile skill : listing.getOfferedSkills()) {
                    if (skill.getName() == null || skill.getName().trim().isEmpty()) {
                        ApiResponse.badRequest(ctx, "Skill name is required and cannot be blank");
                        return;
                    }
                    if (skill.getLevel() == null) {
                        ApiResponse.badRequest(ctx, "Skill level is required");
                        return;
                    }
                }
            }
            if (listing.getRequestedSkills() != null) {
                for (SkillProfile skill : listing.getRequestedSkills()) {
                    if (skill.getName() == null || skill.getName().trim().isEmpty()) {
                        ApiResponse.badRequest(ctx, "Requested Skill name is required and cannot be blank");
                        return;
                    }
                    if (skill.getLevel() == null) {
                        ApiResponse.badRequest(ctx, "Requested Skill level is required");
                        return;
                    }
                }
            }

            // 3. Available Slots Validation (Optional, but if present validate deeply)
            if (listing.getAvailableSlots() != null && !listing.getAvailableSlots().isEmpty()) {
                for (com.campusskills.modules.listings.models.ListingSlot slot : listing.getAvailableSlots()) {
                    if (slot.getDayOfWeek() == null) {
                        ApiResponse.badRequest(ctx, "Slot day of week is required");
                        return;
                    }
                    if (slot.getStartTime() == null || slot.getStartTime().trim().isEmpty()) {
                        ApiResponse.badRequest(ctx, "Slot start time is required");
                        return;
                    }
                    if (slot.getDurationMinutes() == null || slot.getDurationMinutes() <= 0) {
                        ApiResponse.badRequest(ctx, "Slot duration must be greater than 0");
                        return;
                    }
                    if (slot.getId() == null || slot.getId().trim().isEmpty()) {
                        slot.setId(java.util.UUID.randomUUID().toString());
                    }
                }
            }

            // 4. Enums Null Checks (Optional because older schemas might differ)
            if (listing.getListingType() == null && listing.getSessionType() == null) {
                ApiResponse.badRequest(ctx, "ListingType or SessionType is required");
                return;
            }

            // ENFORCE authenticated user identity! Ignore any teacherId/ownerId passed from frontend
            listing.setOwnerId(authenticatedUserId);
            listing.setTeacherId(authenticatedUserId); // legacy sync

            listingService.createListing(listing)
                .onSuccess(listingId -> {
                    JsonObject response = new JsonObject().put("id", listingId);
                    ApiResponse.created(ctx, response);
                })
                .onFailure(err -> ApiResponse.sendError(ctx, 400, err.getMessage())); // Service layer handles deep schema validation

        } catch (Exception e) {
            e.printStackTrace();
            ApiResponse.sendError(ctx, 400, "Invalid request payload");
        }
    }

    public void getAllListings(RoutingContext ctx) {
        String q = ctx.request().getParam("q");
        List<String> topics = ctx.queryParam("topics");
        List<String> paymentTypes = ctx.queryParam("payment_types");
        List<String> modes = ctx.queryParam("modes");
        String sort = ctx.request().getParam("sort");
        String ownerId = ctx.request().getParam("ownerId");
        
        int page = 1;
        int limit = 20;
        try {
            if (ctx.request().getParam("page") != null) page = Integer.parseInt(ctx.request().getParam("page"));
            if (ctx.request().getParam("limit") != null) limit = Integer.parseInt(ctx.request().getParam("limit"));
        } catch (NumberFormatException ignored) {}

        JsonObject filters = new JsonObject();
        if (q != null && !q.trim().isEmpty()) filters.put("q", q.trim());
        if (topics != null && !topics.isEmpty()) filters.put("topics", new io.vertx.core.json.JsonArray(topics));
        if (paymentTypes != null && !paymentTypes.isEmpty()) filters.put("payment_types", new io.vertx.core.json.JsonArray(paymentTypes));
        if (modes != null && !modes.isEmpty()) filters.put("modes", new io.vertx.core.json.JsonArray(modes));
        if (sort != null && !sort.trim().isEmpty()) filters.put("sort", sort.trim());
        if (ownerId != null && !ownerId.trim().isEmpty()) filters.put("ownerId", ownerId.trim());

        listingService.searchListings(filters, page, limit)
            .onSuccess(result -> {
                ApiResponse.ok(ctx, result);
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

    public void updateListing(RoutingContext ctx) {
        String authenticatedUserId = ctx.get("authenticatedUserId");
        if (authenticatedUserId == null) {
            ApiResponse.sendError(ctx, 401, "Unauthorized");
            return;
        }

        String id = ctx.pathParam("id");
        if (id == null || id.trim().isEmpty()) {
            ApiResponse.badRequest(ctx, "Listing ID is required");
            return;
        }

        JsonObject body = ctx.body().asJsonObject();
        if (body == null) {
            ApiResponse.badRequest(ctx, "Missing request body");
            return;
        }

        Listing listing;
        try {
            listing = body.mapTo(Listing.class);
        } catch (IllegalArgumentException e) {
            ApiResponse.badRequest(ctx, "Invalid payload or enum value");
            return;
        }

        listingService.updateListing(id, authenticatedUserId, listing)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Listing updated")))
            .onFailure(err -> {
                if ("NOT_FOUND".equals(err.getMessage())) {
                    ApiResponse.notFound(ctx, "Listing not found");
                } else if ("UNAUTHORIZED".equals(err.getMessage())) {
                    ApiResponse.sendError(ctx, 403, "Not authorized to update this listing");
                } else {
                    ApiResponse.badRequest(ctx, err.getMessage());
                }
            });
    }

    public void deleteListing(RoutingContext ctx) {
        String authenticatedUserId = ctx.get("authenticatedUserId");
        if (authenticatedUserId == null) {
            ApiResponse.sendError(ctx, 401, "Unauthorized");
            return;
        }

        String id = ctx.pathParam("id");
        if (id == null || id.trim().isEmpty()) {
            ApiResponse.badRequest(ctx, "Listing ID is required");
            return;
        }

        listingService.deleteListing(id, authenticatedUserId)
            .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("message", "Listing deleted")))
            .onFailure(err -> {
                if ("NOT_FOUND".equals(err.getMessage())) {
                    ApiResponse.notFound(ctx, "Listing not found");
                } else if ("UNAUTHORIZED".equals(err.getMessage())) {
                    ApiResponse.sendError(ctx, 403, "Not authorized to delete this listing");
                } else {
                    ApiResponse.internalError(ctx, "Failed to delete listing");
                }
            });
    }
}
