package com.campusskills.modules.listings.handlers;

import com.campusskills.modules.listings.models.Listing;
import com.campusskills.modules.listings.services.ListingService;
import com.campusskills.web.response.ApiResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class ListingHandler {

    private final ListingService listingService;

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

            Listing listing = body.mapTo(Listing.class);
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
}
