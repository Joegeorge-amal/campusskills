package com.campusskills.modules.reviews.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.reviews.models.Review;
import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.AggregateOptions;
import io.vertx.ext.mongo.FindOptions;
import io.vertx.ext.mongo.MongoClient;

import java.util.List;
import java.util.stream.Collectors;

public class ReviewRepository {

    private final MongoClient client;
    private static final String COLLECTION = "reviews";

    public ReviewRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<String> createReview(Review review) {
        review.setCreatedAt(System.currentTimeMillis());
        JsonObject doc = JsonObject.mapFrom(review);
        doc.remove("_id");
        return client.save(COLLECTION, doc);
    }

    public Future<Boolean> hasReviewed(String sessionId, String reviewerId, String revieweeId) {
        JsonObject query = new JsonObject()
                .put("sessionId", sessionId)
                .put("reviewerId", reviewerId)
                .put("revieweeId", revieweeId);
        
        return client.count(COLLECTION, query).map(count -> count > 0);
    }

    public Future<JsonObject> calculateAggregates(String revieweeId) {
        JsonArray pipeline = new JsonArray()
            .add(new JsonObject().put("$match", new JsonObject().put("revieweeId", revieweeId)))
            .add(new JsonObject().put("$group", new JsonObject()
                .put("_id", null)
                .put("averageRating", new JsonObject().put("$avg", "$rating"))
                .put("reviewCount", new JsonObject().put("$sum", 1))
            ));
        
        io.vertx.core.Promise<JsonObject> promise = io.vertx.core.Promise.promise();
        client.aggregateWithOptions(COLLECTION, pipeline, new AggregateOptions())
            .handler(doc -> promise.tryComplete(doc))
            .exceptionHandler(err -> promise.tryFail(err))
            .endHandler(v -> promise.tryComplete(new JsonObject().put("averageRating", 0.0).put("reviewCount", 0)));
            
        return promise.future().map(agg -> {
            Double avg = agg.getDouble("averageRating");
            Integer count = agg.getInteger("reviewCount");
            return new JsonObject()
                .put("averageRating", avg != null ? avg : 0.0)
                .put("reviewCount", count != null ? count : 0);
        });
    }

    public Future<List<Review>> fetchUserReviews(String userId, int skip, int limit) {
        JsonObject query = new JsonObject().put("revieweeId", userId);
        FindOptions options = new FindOptions()
                .setSort(new JsonObject().put("createdAt", -1))
                .setSkip(skip)
                .setLimit(limit);

        return client.findWithOptions(COLLECTION, query, options)
                .map(list -> list.stream().map(json -> json.mapTo(Review.class)).collect(Collectors.toList()));
    }
}
