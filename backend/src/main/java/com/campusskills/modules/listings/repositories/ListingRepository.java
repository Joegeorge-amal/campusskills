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

    public Future<java.util.List<Listing>> findAllActive() {
        JsonObject query = new JsonObject().put("active", true);
        io.vertx.ext.mongo.FindOptions options = new io.vertx.ext.mongo.FindOptions()
            .setSort(new JsonObject().put("createdAt", -1));
            
        return client.findWithOptions(COLLECTION, query, options).map(docs -> {
            return docs.stream()
                .map(doc -> doc.mapTo(Listing.class))
                .collect(java.util.stream.Collectors.toList());
        });
    }
}
