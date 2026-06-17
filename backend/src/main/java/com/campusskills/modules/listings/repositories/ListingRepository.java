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

    private Listing mapToListing(JsonObject doc) {
        if (doc == null) return null;
        Object idObj = doc.getValue("_id");
        if (idObj instanceof JsonObject && ((JsonObject) idObj).containsKey("$oid")) {
            doc.put("_id", ((JsonObject) idObj).getString("$oid"));
        }
        return doc.mapTo(Listing.class);
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
            ))
            .add(new JsonObject().put("$project", new JsonObject()
                .put("owner.upi", 0)
            ));
            
        io.vertx.ext.mongo.AggregateOptions options = new io.vertx.ext.mongo.AggregateOptions();
        return client.aggregateWithOptions(COLLECTION, pipeline, options)
            .collect(java.util.stream.Collectors.toList())
            .map(docs -> {
                if (docs == null || docs.isEmpty()) return null;
                return mapToListing(docs.get(0));
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

    public Future<Void> incrementRequestCount(String id) {
        JsonObject query = new JsonObject().put("_id", id);
        JsonObject update = new JsonObject().put("$inc", new JsonObject().put("requestCount", 1));
        return client.updateCollection(COLLECTION, query, update).mapEmpty();
    }

    private JsonObject buildSearchQuery(JsonObject filters) {
        JsonObject query = new JsonObject()
            .put("active", true)
            .put("status", new JsonObject().put("$ne", "ADMIN_DISABLED")); // Base condition

        if (filters == null) return query;

        io.vertx.core.json.JsonArray blockedUsers = filters.getJsonArray("blockedUsers");
        if (blockedUsers != null && !blockedUsers.isEmpty()) {
            query.put("ownerId", new JsonObject().put("$nin", blockedUsers));
        }

        String ownerId = filters.getString("ownerId");
        if (ownerId != null && !ownerId.isEmpty()) {
            query.put("$or", new io.vertx.core.json.JsonArray()
                .add(new JsonObject().put("ownerId", ownerId))
                .add(new JsonObject().put("teacherId", ownerId))
            );
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

    private Future<io.vertx.core.json.JsonArray> getSuspendedUserIds() {
        return client.find("users", new JsonObject().put("isActive", false))
            .map(users -> {
                io.vertx.core.json.JsonArray ids = new io.vertx.core.json.JsonArray();
                for (JsonObject u : users) {
                    ids.add(u.getString("_id"));
                }
                return ids;
            });
    }

    public Future<Long> countSearch(JsonObject filters) {
        return getSuspendedUserIds().compose(suspendedIds -> {
            JsonObject query = buildSearchQuery(filters);
            if (!suspendedIds.isEmpty()) {
                query.put("ownerId", new JsonObject().put("$nin", suspendedIds));
            }
            return client.count(COLLECTION, query);
        });
    }

    public Future<java.util.List<Listing>> search(JsonObject filters, int page, int limit) {
        return getSuspendedUserIds().compose(suspendedIds -> {
            JsonObject query = buildSearchQuery(filters);
            if (!suspendedIds.isEmpty()) {
                query.put("ownerId", new JsonObject().put("$nin", suspendedIds));
            }
            
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
                .add(new JsonObject().put("$project", new JsonObject()
                    .put("owner.upi", 0)
                ))
                .add(new JsonObject().put("$sort", sortQuery))
                .add(new JsonObject().put("$skip", skip))
                .add(new JsonObject().put("$limit", limit));

            io.vertx.ext.mongo.AggregateOptions options = new io.vertx.ext.mongo.AggregateOptions();
                
            return client.aggregateWithOptions(COLLECTION, pipeline, options)
                .collect(java.util.stream.Collectors.toList())
                .map(docs -> {
                    return docs.stream()
                        .map(this::mapToListing)
                        .collect(java.util.stream.Collectors.toList());
                });
        });
    }
}
