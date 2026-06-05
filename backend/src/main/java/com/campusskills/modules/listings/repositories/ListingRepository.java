package com.campusskills.modules.listings.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.listings.models.Listing;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

public class ListingRepository {
    
    private final MongoClient client;
    private static final String COLLECTION = "skill_listings";

    public ListingRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<String> create(Listing listing) {
        listing.setCreatedAt(System.currentTimeMillis());
        listing.setUpdatedAt(System.currentTimeMillis());
        JsonObject doc = JsonObject.mapFrom(listing);
        doc.remove("_id");
        return client.insert(COLLECTION, doc);
    }

    public Future<Listing> findById(String id) {
        JsonObject query = new JsonObject().put("_id", id);
        return client.findOne(COLLECTION, query, null).map(doc -> {
            if (doc == null) return null;
            return doc.mapTo(Listing.class);
        });
    }

    public Future<Void> update(Listing listing) {
        listing.setUpdatedAt(System.currentTimeMillis());
        JsonObject query = new JsonObject().put("_id", listing.getId());
        JsonObject doc = JsonObject.mapFrom(listing);
        doc.remove("_id");
        JsonObject update = new JsonObject().put("$set", doc);
        return client.updateCollection(COLLECTION, query, update).mapEmpty();
    }

    public Future<Void> deactivate(String id) {
        JsonObject query = new JsonObject().put("_id", id);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("active", false)
            .put("updatedAt", System.currentTimeMillis()));
        return client.updateCollection(COLLECTION, query, update).mapEmpty();
    }

    private JsonObject buildSearchQuery(JsonObject filters) {
        JsonObject query = new JsonObject()
            .put("active", true)
            .put("status", new JsonObject().put("$ne", "ADMIN_DISABLED")); // Base condition

        if (filters == null) return query;

        // Text Search (q)
        String q = filters.getString("q");
        if (q != null && !q.isEmpty()) {
            query.put("$text", new JsonObject().put("$search", q));
        }

        // Topics (topics or skills.name)
        io.vertx.core.json.JsonArray topics = filters.getJsonArray("topics");
        if (topics != null && !topics.isEmpty()) {
            query.put("$or", new io.vertx.core.json.JsonArray()
                .add(new JsonObject().put("category", new JsonObject().put("$in", topics)))
                .add(new JsonObject().put("skills.name", new JsonObject().put("$in", topics)))
            );
        }

        // Payment Types
        io.vertx.core.json.JsonArray paymentTypes = filters.getJsonArray("payment_types");
        if (paymentTypes != null && !paymentTypes.isEmpty()) {
            query.put("sessionType", new JsonObject().put("$in", paymentTypes));
        }

        // Modes (availability)
        io.vertx.core.json.JsonArray modes = filters.getJsonArray("modes");
        if (modes != null && !modes.isEmpty()) {
            query.put("availability", new JsonObject().put("$in", modes));
        }

        return query;
    }

    public Future<Long> countSearch(JsonObject filters) {
        JsonObject query = buildSearchQuery(filters);
        return client.count(COLLECTION, query);
    }

    public Future<java.util.List<Listing>> search(JsonObject filters, int page, int limit) {
        JsonObject query = buildSearchQuery(filters);
        
        JsonObject sortQuery = new JsonObject();
        String sort = filters != null ? filters.getString("sort") : null;
        if ("oldest".equals(sort)) {
            sortQuery.put("createdAt", 1);
        } else {
            // Default to newest
            sortQuery.put("createdAt", -1);
        }

        int skip = (page - 1) * limit;

        io.vertx.ext.mongo.FindOptions options = new io.vertx.ext.mongo.FindOptions()
            .setSort(sortQuery)
            .setSkip(skip)
            .setLimit(limit);
            
        return client.findWithOptions(COLLECTION, query, options).map(docs -> {
            return docs.stream()
                .map(doc -> doc.mapTo(Listing.class))
                .collect(java.util.stream.Collectors.toList());
        });
    }
}
