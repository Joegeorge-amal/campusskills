package com.campusskills.modules.reviews.handlers;

import com.campusskills.modules.reviews.models.CreateReviewRequest;
import com.campusskills.modules.reviews.services.ReviewService;
import com.campusskills.web.response.ApiResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class ReviewHandler {

    private final ReviewService reviewService;

    public ReviewHandler(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    public void createReview(RoutingContext ctx) {
        try {
            JsonObject body = ctx.body().asJsonObject();
            CreateReviewRequest req = body.mapTo(CreateReviewRequest.class);

            String authId = ctx.get("authenticatedUserId");
            if (authId == null) {
                ApiResponse.forbidden(ctx, "Unauthorized");
                return;
            }

            reviewService.createReview(req, authId)
                .onSuccess(id -> ApiResponse.created(ctx, new JsonObject().put("id", id).put("message", "Review submitted successfully")))
                .onFailure(err -> {
                    String msg = err.getMessage();
                    if (msg.startsWith("FORBIDDEN") || msg.startsWith("UNAUTHORIZED")) {
                        ApiResponse.forbidden(ctx, msg);
                    } else if (msg.startsWith("CONFLICT")) {
                        ApiResponse.conflict(ctx, msg);
                    } else if (msg.startsWith("SESSION_NOT_FOUND")) {
                        ApiResponse.notFound(ctx, msg);
                    } else {
                        ApiResponse.badRequest(ctx, msg);
                    }
                });
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid JSON format");
        }
    }

    public void getUserReviews(RoutingContext ctx) {
        String userId = ctx.pathParam("userId");
        if (userId == null || userId.trim().isEmpty()) {
            ApiResponse.badRequest(ctx, "userId is required");
            return;
        }

        String pageParam = ctx.queryParam("page").isEmpty() ? "1" : ctx.queryParam("page").get(0);
        String limitParam = ctx.queryParam("limit").isEmpty() ? "20" : ctx.queryParam("limit").get(0);

        int page = 1;
        int limit = 20;
        try {
            page = Integer.parseInt(pageParam);
            limit = Integer.parseInt(limitParam);
        } catch (NumberFormatException ignored) {}

        reviewService.getUserReviews(userId, page, limit)
            .onSuccess(json -> ApiResponse.ok(ctx, json))
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }

    public void updateReview(RoutingContext ctx) {
        String reviewId = ctx.pathParam("id");
        if (reviewId == null || reviewId.trim().isEmpty()) {
            ApiResponse.badRequest(ctx, "id is required");
            return;
        }

        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }

        try {
            JsonObject body = ctx.body().asJsonObject();
            Double rating = body.getDouble("rating");
            String comment = body.getString("comment");

            reviewService.updateReview(reviewId, authId, rating, comment)
                .onSuccess(success -> ApiResponse.ok(ctx, new JsonObject().put("message", "Review updated successfully")))
                .onFailure(err -> {
                    String msg = err.getMessage();
                    if (msg.startsWith("FORBIDDEN") || msg.startsWith("UNAUTHORIZED")) {
                        ApiResponse.forbidden(ctx, msg);
                    } else if (msg.startsWith("NOT_FOUND")) {
                        ApiResponse.notFound(ctx, msg);
                    } else {
                        ApiResponse.badRequest(ctx, msg);
                    }
                });
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid JSON format");
        }
    }

    public void deleteReview(RoutingContext ctx) {
        String reviewId = ctx.pathParam("id");
        if (reviewId == null || reviewId.trim().isEmpty()) {
            ApiResponse.badRequest(ctx, "id is required");
            return;
        }

        String authId = ctx.get("authenticatedUserId");
        if (authId == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }

        String role = ctx.get("authenticatedUserRole");
        boolean isAdmin = "ADMIN".equals(role);

        reviewService.deleteReview(reviewId, authId, isAdmin)
            .onSuccess(success -> ApiResponse.ok(ctx, new JsonObject().put("message", "Review deleted successfully")))
            .onFailure(err -> {
                String msg = err.getMessage();
                if (msg.startsWith("FORBIDDEN") || msg.startsWith("UNAUTHORIZED")) {
                    ApiResponse.forbidden(ctx, msg);
                } else if (msg.startsWith("NOT_FOUND")) {
                    ApiResponse.notFound(ctx, msg);
                } else {
                    ApiResponse.badRequest(ctx, msg);
                }
            });
    }
}
