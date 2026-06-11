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
        io.vertx.core.json.JsonArray pipeline = new io.vertx.core.json.JsonArray()
            .add(new JsonObject().put("$match", query))
            .add(new JsonObject().put("$lookup", new JsonObject()
                .put("from", "user_profiles")
                .put("let", new JsonObject().put("oId", "$ownerId").put("tId", "$teacherId"))
                .put("pipeline", new io.vertx.core.json.JsonArray().add(new JsonObject().put("$match", new JsonObject()
                    .put("$expr", new JsonObject().put("$or", new io.vertx.core.json.JsonArray()
                        .add(new JsonObject().put("$eq", new io.vertx.core.json.JsonArray().add("$userId").add("$$oId")))
                        .add(new JsonObject().put("$eq", new io.vertx.core.json.JsonArray().add("$userId").add("$$tId")))
                    ))
                )))
                .put("as", "owner_arr")
            ))
            .add(new JsonObject().put("$unwind", new JsonObject()
                .put("path", "$owner_arr")
                .put("preserveNullAndEmptyArrays", true)
            ))
            .add(new JsonObject().put("$addFields", new JsonObject()
                .put("owner", "$owner_arr")
            ));
            
        io.vertx.ext.mongo.AggregateOptions options = new io.vertx.ext.mongo.AggregateOptions();
        return client.aggregateWithOptions(COLLECTION, pipeline, options)
            .collect(java.util.stream.Collectors.toList())
            .map(docs -> {
                if (docs == null || docs.isEmpty()) return null;
                return docs.get(0).mapTo(Listing.class);
            });
    }

    public Future<Void> update(Listing listing) {
        listing.prepareForSave(); // Trigger dual-write sync
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

        String ownerId = filters.getString("ownerId");
        if (ownerId != null && !ownerId.isEmpty()) {
            query.put("ownerId", ownerId);
        }

        // Text Search (q)
        String q = filters.getString("q");
        if (q != null && !q.isEmpty()) {
            query.put("$text", new JsonObject().put("$search", q));
        }

        // Search Mode (FIND_TUTORS, FIND_STUDENTS, FIND_SWAPS)
        String searchMode = filters.getString("searchMode");
        io.vertx.core.json.JsonArray topics = filters.getJsonArray("topics");

        if ("FIND_TUTORS".equals(searchMode)) {
            query.put("listingType", new JsonObject().put("$in", new io.vertx.core.json.JsonArray().add("TEACH").add("TEACH_SWAP")));
            if (topics != null && !topics.isEmpty()) {
                query.put("$or", new io.vertx.core.json.JsonArray()
                    .add(new JsonObject().put("category", new JsonObject().put("$in", topics)))
                    .add(new JsonObject().put("offeredSkills.name", new JsonObject().put("$in", topics)))
                    .add(new JsonObject().put("skills.name", new JsonObject().put("$in", topics))) // Legacy fallback
                );
            }
        } else if ("FIND_STUDENTS".equals(searchMode)) {
            query.put("listingType", new JsonObject().put("$in", new io.vertx.core.json.JsonArray().add("LEARN").add("LEARN_SWAP")));
            if (topics != null && !topics.isEmpty()) {
                query.put("$or", new io.vertx.core.json.JsonArray()
                    .add(new JsonObject().put("category", new JsonObject().put("$in", topics)))
                    .add(new JsonObject().put("requestedSkills.name", new JsonObject().put("$in", topics)))
                    .add(new JsonObject().put("preferredSkills.name", new JsonObject().put("$in", topics))) // Legacy fallback
                );
            }
        } else if ("FIND_SWAPS".equals(searchMode)) {
            query.put("listingType", new JsonObject().put("$in", new io.vertx.core.json.JsonArray().add("SWAP").add("TEACH_SWAP").add("LEARN_SWAP")));
            if (topics != null && !topics.isEmpty()) {
                query.put("$or", new io.vertx.core.json.JsonArray()
                    .add(new JsonObject().put("category", new JsonObject().put("$in", topics)))
                    .add(new JsonObject().put("offeredSkills.name", new JsonObject().put("$in", topics)))
                    .add(new JsonObject().put("requestedSkills.name", new JsonObject().put("$in", topics)))
                );
            }
        } else {
            // Legacy / Default Fallback
            if (topics != null && !topics.isEmpty()) {
                query.put("$or", new io.vertx.core.json.JsonArray()
                    .add(new JsonObject().put("category", new JsonObject().put("$in", topics)))
                    .add(new JsonObject().put("skills.name", new JsonObject().put("$in", topics)))
                    .add(new JsonObject().put("offeredSkills.name", new JsonObject().put("$in", topics)))
                    .add(new JsonObject().put("requestedSkills.name", new JsonObject().put("$in", topics)))
                );
            }
        }

        // Payment Types / Session Types
        io.vertx.core.json.JsonArray paymentTypes = filters.getJsonArray("payment_types");
        if (paymentTypes != null && !paymentTypes.isEmpty()) {
            query.put("$or", new io.vertx.core.json.JsonArray()
                .add(new JsonObject().put("listingType", new JsonObject().put("$in", paymentTypes)))
                .add(new JsonObject().put("sessionType", new JsonObject().put("$in", paymentTypes)))
            );
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

        io.vertx.core.json.JsonArray pipeline = new io.vertx.core.json.JsonArray()
            .add(new JsonObject().put("$match", query))
            .add(new JsonObject().put("$lookup", new JsonObject()
                .put("from", "user_profiles")
                .put("let", new JsonObject().put("oId", "$ownerId").put("tId", "$teacherId"))
                .put("pipeline", new io.vertx.core.json.JsonArray().add(new JsonObject().put("$match", new JsonObject()
                    .put("$expr", new JsonObject().put("$or", new io.vertx.core.json.JsonArray()
                        .add(new JsonObject().put("$eq", new io.vertx.core.json.JsonArray().add("$userId").add("$$oId")))
                        .add(new JsonObject().put("$eq", new io.vertx.core.json.JsonArray().add("$userId").add("$$tId")))
                    ))
                )))
                .put("as", "owner_arr")
            ))
            .add(new JsonObject().put("$unwind", new JsonObject()
                .put("path", "$owner_arr")
                .put("preserveNullAndEmptyArrays", true)
            ))
            .add(new JsonObject().put("$addFields", new JsonObject()
                .put("owner", "$owner_arr")
            ))
            .add(new JsonObject().put("$sort", sortQuery))
            .add(new JsonObject().put("$skip", skip))
            .add(new JsonObject().put("$limit", limit));

        io.vertx.ext.mongo.AggregateOptions options = new io.vertx.ext.mongo.AggregateOptions();
            
        return client.aggregateWithOptions(COLLECTION, pipeline, options)
            .collect(java.util.stream.Collectors.toList())
            .map(docs -> {
                return docs.stream()
                    .map(doc -> doc.mapTo(Listing.class))
                    .collect(java.util.stream.Collectors.toList());
            });
    }
}
