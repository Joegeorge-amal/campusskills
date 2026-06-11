package com.campusskills.modules.reviews.services;

import com.campusskills.modules.reviews.models.CreateReviewRequest;
import com.campusskills.modules.reviews.models.Review;
import com.campusskills.modules.reviews.repositories.ReviewRepository;
import com.campusskills.modules.sessions.repositories.SessionRepository;
import com.campusskills.modules.users.repositories.UserProfileRepository;
import com.campusskills.shared.constants.SessionStatus;
import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;

public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final SessionRepository sessionRepository;
    private final UserProfileRepository userProfileRepository;
    private final com.campusskills.modules.users.repositories.UserStatsRepository userStatsRepository;
    private final io.vertx.core.eventbus.EventBus eventBus;

    public ReviewService(ReviewRepository reviewRepository, SessionRepository sessionRepository, UserProfileRepository userProfileRepository, com.campusskills.modules.users.repositories.UserStatsRepository userStatsRepository, io.vertx.core.eventbus.EventBus eventBus) {
        this.reviewRepository = reviewRepository;
        this.sessionRepository = sessionRepository;
        this.userProfileRepository = userProfileRepository;
        this.userStatsRepository = userStatsRepository;
        this.eventBus = eventBus;
    }

    private void sendNotification(String userId, com.campusskills.shared.constants.NotificationType type, String title, String message, String sourceType, String sourceId) {
        if (eventBus == null) return;
        JsonObject payload = new JsonObject()
            .put("userId", userId)
            .put("type", type.name())
            .put("title", title)
            .put("message", message)
            .put("sourceType", sourceType)
            .put("sourceId", sourceId);
        eventBus.send("internal.notification.create", payload);
    }

    public Future<String> createReview(CreateReviewRequest req, String reviewerId) {
        if (req.getSessionId() == null || req.getSessionId().trim().isEmpty()) {
            return Future.failedFuture("sessionId is required");
        }
        if (req.getRating() == null) {
            return Future.failedFuture("rating is required");
        }
        if (req.getRating() < 1.0 || req.getRating() > 5.0) {
            return Future.failedFuture("rating must be between 1.0 and 5.0");
        }
        if ((req.getRating() * 10) % 5 != 0) {
            return Future.failedFuture("rating must be in 0.5 increments (e.g. 1.0, 1.5, 2.0)");
        }

        return sessionRepository.getSessionById(req.getSessionId()).compose(session -> {
            if (session == null) {
                return Future.failedFuture("SESSION_NOT_FOUND");
            }
            if (!session.getTeacherId().equals(reviewerId) && !session.getStudentId().equals(reviewerId)) {
                return Future.failedFuture("UNAUTHORIZED: You are not a participant in this session");
            }
            if (session.getStatus() != SessionStatus.COMPLETED) {
                return Future.failedFuture("FORBIDDEN: Reviews can only be submitted for COMPLETED sessions");
            }

            // Determine revieweeId (the other participant)
            String revieweeId = session.getTeacherId().equals(reviewerId) ? session.getStudentId() : session.getTeacherId();

            if (revieweeId == null) {
                return Future.failedFuture("UNAUTHORIZED: Could not determine reviewee");
            }
            if (revieweeId.equals(reviewerId)) {
                return Future.failedFuture("CONFLICT: You cannot review yourself");
            }
            
            final String finalRevieweeId = revieweeId;

            return reviewRepository.hasReviewed(req.getSessionId(), reviewerId, finalRevieweeId).compose(hasReviewed -> {
                if (hasReviewed) {
                    return Future.failedFuture("CONFLICT: You have already reviewed this user for this session");
                }

                Review review = new Review();
                review.setSessionId(req.getSessionId());
                review.setReviewerId(reviewerId);
                review.setRevieweeId(finalRevieweeId);
                review.setRating(req.getRating());
                if (req.getComment() != null && !req.getComment().trim().isEmpty()) {
                    review.setComment(req.getComment().trim());
                }

                return reviewRepository.createReview(review).compose(id -> {
                    // Trigger async recalculation and update Profile & Stats
                    syncRatings(finalRevieweeId);
                    
                    // Send notification to reviewee
                    sendNotification(finalRevieweeId, com.campusskills.shared.constants.NotificationType.REVIEW_RECEIVED, "New Review Received", "You have received a new review with a rating of " + req.getRating() + " stars.", "REVIEW", id);
                    
                    userStatsRepository.recordActivity(reviewerId);

                    return Future.succeededFuture(id);
                });
            });
        });
    }

    public Future<JsonObject> getUserReviews(String userId, int page, int limit) {
        if (page < 1) page = 1;
        if (limit < 1 || limit > 100) limit = 20;
        int skip = (page - 1) * limit;

        // Optionally, we could count total reviews here, but the user profile already has reviewCount.
        // So we just fetch the list.
        final int fLimit = limit;
        final int fPage = page;
        
        return reviewRepository.fetchUserReviews(userId, skip, limit).map(list -> {
            JsonArray items = new JsonArray();
            for (Review r : list) {
                items.add(JsonObject.mapFrom(r));
            }
            return new JsonObject()
                .put("items", items)
                .put("page", fPage)
                .put("limit", fLimit);
        });
    }

    public Future<Boolean> updateReview(String reviewId, String requesterId, Double rating, String comment) {
        if (rating == null) return Future.failedFuture("rating is required");
        if (rating < 1.0 || rating > 5.0) return Future.failedFuture("rating must be between 1.0 and 5.0");
        if ((rating * 10) % 5 != 0) return Future.failedFuture("rating must be in 0.5 increments (e.g. 1.0, 1.5, 2.0)");

        return reviewRepository.findById(reviewId).compose(review -> {
            if (review == null) return Future.failedFuture("NOT_FOUND: Review not found");
            if (!review.getReviewerId().equals(requesterId)) return Future.failedFuture("FORBIDDEN: You can only edit your own reviews");

            long now = System.currentTimeMillis();
            if (review.getCreatedAt() != null && (now - review.getCreatedAt() > 48L * 60L * 60L * 1000L)) {
                return Future.failedFuture("FORBIDDEN: Reviews can only be edited within 48 hours of creation");
            }

            return reviewRepository.updateReview(reviewId, rating, comment).compose(success -> {
                if (success) syncRatings(review.getRevieweeId());
                return Future.succeededFuture(success);
            });
        });
    }

    public Future<Boolean> deleteReview(String reviewId, String requesterId, boolean isAdmin) {
        return reviewRepository.findById(reviewId).compose(review -> {
            if (review == null) return Future.failedFuture("NOT_FOUND: Review not found");
            
            if (!isAdmin && !review.getReviewerId().equals(requesterId)) {
                return Future.failedFuture("FORBIDDEN: You can only delete your own reviews");
            }

            return reviewRepository.deleteReview(reviewId).compose(success -> {
                if (success) syncRatings(review.getRevieweeId());
                return Future.succeededFuture(success);
            });
        });
    }

    private void syncRatings(String revieweeId) {
        reviewRepository.calculateAggregates(revieweeId).onSuccess(agg -> {
            Double avg = agg.getDouble("averageRating");
            Integer count = agg.getInteger("reviewCount");
            
            io.vertx.core.Future<Boolean> profileUpdate = userProfileRepository.updateRatings(revieweeId, avg, count);
            io.vertx.core.Future<Boolean> statsUpdate = userStatsRepository.updateRatings(revieweeId, avg, count);
            
            io.vertx.core.Future.all(profileUpdate, statsUpdate).onFailure(err -> {
                System.err.println("Failed to sync ratings for user " + revieweeId + ": " + err.getMessage());
            });
        });
    }
}
