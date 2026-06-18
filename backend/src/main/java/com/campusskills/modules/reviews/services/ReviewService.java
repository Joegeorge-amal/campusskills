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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.campusskills.modules.users.models.UserProfile;
import com.campusskills.modules.sessions.models.Session;
import java.util.stream.Collectors;

import com.campusskills.core.database.MongoManager;

public class ReviewService {
    private static final Logger log = LoggerFactory.getLogger(ReviewService.class);

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
        log.info("[Review DEBUG] createReview entry — sessionId='{}', rating={}, reviewerId='{}'", req.getSessionId(), req.getRating(), reviewerId);
        if (req.getSessionId() == null || req.getSessionId().trim().isEmpty()) {
            log.warn("[Review DEBUG] FAILED — sessionId is null/empty");
            return Future.failedFuture("sessionId is required");
        }
        if (req.getRating() == null) {
            log.warn("[Review DEBUG] FAILED — rating is null");
            return Future.failedFuture("rating is required");
        }
        if (req.getRating() < 0.5 || req.getRating() > 5.0) {
            log.warn("[Review DEBUG] FAILED — rating out of range: {}", req.getRating());
            return Future.failedFuture("rating must be between 0.5 and 5.0");
        }
        if ((req.getRating() * 10) % 5 != 0) {
            log.warn("[Review DEBUG] FAILED — rating not in 0.5 increments: {}", req.getRating());
            return Future.failedFuture("rating must be in 0.5 increments (e.g. 1.0, 1.5, 2.0)");
        }

        return sessionRepository.getSessionById(req.getSessionId()).compose(session -> {
            if (session == null) {
                log.warn("[Review DEBUG] FAILED — getSessionById returned null for sessionId='{}'", req.getSessionId());
                return Future.failedFuture("SESSION_NOT_FOUND");
            }
            log.info("[Review DEBUG] getSessionById OK — sessionId='{}', teacherId='{}', studentId='{}', status={}",
                session.getId(), session.getTeacherId(), session.getStudentId(), session.getStatus());
            if (!session.getTeacherId().equals(reviewerId) && !session.getStudentId().equals(reviewerId)) {
                log.warn("[Review DEBUG] FAILED — reviewerId='{}' not in session participants (teacher='{}', student='{}')",
                    reviewerId, session.getTeacherId(), session.getStudentId());
                return Future.failedFuture("UNAUTHORIZED: You are not a participant in this session");
            }
            if (session.getStatus() != SessionStatus.COMPLETED) {
                log.warn("[Review DEBUG] FAILED — session status is {} not COMPLETED", session.getStatus());
                return Future.failedFuture("FORBIDDEN: Reviews can only be submitted for COMPLETED sessions");
            }

            // Determine revieweeId (the other participant)
            String revieweeId = session.getTeacherId().equals(reviewerId) ? session.getStudentId() : session.getTeacherId();
            log.info("[Review DEBUG] Determined revieweeId='{}' for reviewerId='{}'", revieweeId, reviewerId);

            if (revieweeId == null) {
                log.warn("[Review DEBUG] FAILED — revieweeId is null");
                return Future.failedFuture("UNAUTHORIZED: Could not determine reviewee");
            }
            if (revieweeId.equals(reviewerId)) {
                log.warn("[Review DEBUG] FAILED — revieweeId equals reviewerId ('{}')", reviewerId);
                return Future.failedFuture("CONFLICT: You cannot review yourself");
            }
            
            final String finalRevieweeId = revieweeId;

            return reviewRepository.hasReviewed(req.getSessionId(), reviewerId, finalRevieweeId).compose(hasReviewed -> {
                log.info("[Review DEBUG] hasReviewed({}, {}, {}) = {}", req.getSessionId(), reviewerId, finalRevieweeId, hasReviewed);
                if (hasReviewed) {
                    log.warn("[Review DEBUG] FAILED — duplicate review detected");
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

                log.info("[Review DEBUG] Creating review document — sessionId='{}', reviewerId='{}', revieweeId='{}'",
                    req.getSessionId(), reviewerId, finalRevieweeId);
                return reviewRepository.createReview(review).compose(id -> {
                    log.info("[Review DEBUG] Review created with id='{}'", id);
                    // Trigger async recalculation and update Profile & Stats
                    syncRatings(finalRevieweeId);
                    syncListingRatings(req.getSessionId());
                    
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

        final int fLimit = limit;
        final int fPage = page;
        
        return reviewRepository.fetchUserReviews(userId, skip, limit).compose(list -> {
            List<Future<JsonObject>> futures = list.stream().map(r -> {
                JsonObject json = JsonObject.mapFrom(r);
                Future<UserProfile> profFut = userProfileRepository.findByUserId(r.getReviewerId())
                    .otherwise(t -> {
                        log.warn("Failed to fetch profile for review {}: {}", r.getId(), t.getMessage());
                        return null;
                    });
                Future<Session> sessFut = r.getSessionId() != null
                    ? sessionRepository.getSessionById(r.getSessionId())
                        .otherwise(t -> {
                            log.warn("Failed to fetch session for review {}: {}", r.getId(), t.getMessage());
                            return null;
                        })
                    : Future.succeededFuture(null);
                
                return Future.join(profFut, sessFut).map(join -> {
                    UserProfile profile = join.resultAt(0);
                    Session session = join.resultAt(1);
                    json.put("reviewerName", profile != null ? profile.getName() : "Unknown User");
                    json.put("sessionTitle", session != null ? session.getTopic() : "Skill Session");
                    return json;
                });
            }).collect(Collectors.toList());
            
            return Future.all(futures).map(all -> {
                JsonArray items = new JsonArray();
                for (int i = 0; i < all.size(); i++) {
                    items.add((JsonObject) all.resultAt(i));
                }
                return new JsonObject()
                    .put("items", items)
                    .put("page", fPage)
                    .put("limit", fLimit);
            });
        });
    }

    public Future<Boolean> updateReview(String reviewId, String requesterId, Double rating, String comment) {
        if (rating == null) return Future.failedFuture("rating is required");
        if (rating < 0.5 || rating > 5.0) return Future.failedFuture("rating must be between 0.5 and 5.0");
        if ((rating * 10) % 5 != 0) return Future.failedFuture("rating must be in 0.5 increments (e.g. 0.5, 1.0, 1.5)");

        return reviewRepository.findById(reviewId).compose(review -> {
            if (review == null) return Future.failedFuture("NOT_FOUND: Review not found");
            if (!review.getReviewerId().equals(requesterId)) return Future.failedFuture("FORBIDDEN: You can only edit your own reviews");

            long now = System.currentTimeMillis();
            if (review.getCreatedAt() != null && (now - review.getCreatedAt() > 48L * 60L * 60L * 1000L)) {
                return Future.failedFuture("FORBIDDEN: Reviews can only be edited within 48 hours of creation");
            }

            return reviewRepository.updateReview(reviewId, rating, comment).compose(success -> {
                if (success) {
                    syncRatings(review.getRevieweeId());
                    syncListingRatings(review.getSessionId());
                }
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
                if (success) {
                    syncRatings(review.getRevieweeId());
                    syncListingRatings(review.getSessionId());
                }
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
            
            io.vertx.core.Future.all(profileUpdate, statsUpdate).onSuccess(v -> {
                com.campusskills.web.websockets.MessageBroadcaster.broadcastProfileUpdate(revieweeId,
                    new io.vertx.core.json.JsonObject()
                        .put("ratingAvg", avg)
                        .put("ratingCount", count));
            }).onFailure(err -> {
                log.error("Failed to sync ratings for user {}", revieweeId, err);
            });
        });
    }

    private void syncListingRatings(String sessionId) {
        if (sessionId == null) return;
        sessionRepository.getSessionById(sessionId).onSuccess(session -> {
            if (session == null || session.getListingId() == null) return;
            String listingId = session.getListingId();
            
            JsonArray pipeline = new JsonArray()
                .add(new JsonObject().put("$lookup", new JsonObject()
                    .put("from", "sessions")
                    .put("localField", "sessionId")
                    .put("foreignField", "_id")
                    .put("as", "session")
                ))
                .add(new JsonObject().put("$unwind", "$session"))
                .add(new JsonObject().put("$match", new JsonObject().put("session.listingId", listingId)))
                .add(new JsonObject().put("$group", new JsonObject()
                    .put("_id", null)
                    .put("averageRating", new JsonObject().put("$avg", "$rating"))
                    .put("reviewCount", new JsonObject().put("$sum", 1))
                ));
            
            io.vertx.core.Promise<JsonObject> promise = io.vertx.core.Promise.promise();
            MongoManager.getClient().aggregateWithOptions("reviews", pipeline, new io.vertx.ext.mongo.AggregateOptions())
                .handler(doc -> promise.tryComplete(doc))
                .exceptionHandler(err -> promise.tryFail(err))
                .endHandler(v -> promise.tryComplete(new JsonObject().put("averageRating", 0.0).put("reviewCount", 0)));
                
            promise.future().onSuccess(agg -> {
                Double avg = agg.getDouble("averageRating");
                Integer count = agg.getInteger("reviewCount");
                
                double finalAvg = avg != null ? avg : 0.0;
                int finalCount = count != null ? count : 0;
                
                JsonObject query = new JsonObject().put("_id", listingId);
                JsonObject update = new JsonObject().put("$set", new JsonObject()
                    .put("averageRating", finalAvg)
                    .put("reviewCount", finalCount)
                    .put("updatedAt", System.currentTimeMillis()));
                    
                MongoManager.getClient().updateCollection("skill_listings", query, update).onFailure(err -> {
                    log.error("Failed to update ratings for listing {}", listingId, err);
                });
            }).onFailure(err -> {
                log.error("Failed to aggregate listing ratings for listing {}", listingId, err);
            });
        }).onFailure(err -> {
            log.error("Failed to get session {} for listing ratings sync", sessionId, err);
        });
    }
}
