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

    public ReviewService(ReviewRepository reviewRepository, SessionRepository sessionRepository, UserProfileRepository userProfileRepository) {
        this.reviewRepository = reviewRepository;
        this.sessionRepository = sessionRepository;
        this.userProfileRepository = userProfileRepository;
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
            if (session.getStatus() != SessionStatus.COMPLETED) {
                return Future.failedFuture("FORBIDDEN: Reviews can only be submitted for COMPLETED sessions");
            }
            if (session.getParticipants() == null || !session.getParticipants().contains(reviewerId)) {
                return Future.failedFuture("UNAUTHORIZED: You are not a participant in this session");
            }

            // Determine revieweeId (the other participant)
            String revieweeId = null;
            for (String pId : session.getParticipants()) {
                if (!pId.equals(reviewerId)) {
                    revieweeId = pId;
                    break;
                }
            }

            if (revieweeId == null) {
                return Future.failedFuture("UNAUTHORIZED: Could not determine reviewee");
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
                    // Trigger async recalculation and update Profile
                    reviewRepository.calculateAggregates(finalRevieweeId).onSuccess(agg -> {
                        Double avg = agg.getDouble("averageRating");
                        Integer count = agg.getInteger("reviewCount");
                        userProfileRepository.updateRatings(finalRevieweeId, avg, count);
                    });

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
}
