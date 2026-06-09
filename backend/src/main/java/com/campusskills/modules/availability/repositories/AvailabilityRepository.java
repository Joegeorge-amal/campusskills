package com.campusskills.modules.availability.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.availability.models.AvailabilityException;
import com.campusskills.modules.availability.models.AvailabilitySlot;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

import java.util.List;
import java.util.stream.Collectors;

public class AvailabilityRepository {
    
    private final MongoClient client;
    private static final String SLOTS_COLLECTION = "availability_slots";
    private static final String EXCEPTIONS_COLLECTION = "availability_exceptions";

    public AvailabilityRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<String> createSlot(AvailabilitySlot slot) {
        slot.setCreatedAt(System.currentTimeMillis());
        slot.setUpdatedAt(System.currentTimeMillis());
        JsonObject doc = JsonObject.mapFrom(slot);
        doc.remove("_id");
        return client.insert(SLOTS_COLLECTION, doc);
    }

    public Future<List<AvailabilitySlot>> findSlotsByUserId(String userId) {
        JsonObject query = new JsonObject().put("userId", userId);
        return client.find(SLOTS_COLLECTION, query).map(docs -> 
            docs.stream().map(doc -> doc.mapTo(AvailabilitySlot.class)).collect(Collectors.toList())
        );
    }
    
    public Future<Void> deleteSlotsByUserId(String userId) {
        JsonObject query = new JsonObject().put("userId", userId);
        return client.removeDocuments(SLOTS_COLLECTION, query).mapEmpty();
    }

    public Future<String> createException(AvailabilityException exception) {
        exception.setCreatedAt(System.currentTimeMillis());
        exception.setUpdatedAt(System.currentTimeMillis());
        JsonObject doc = JsonObject.mapFrom(exception);
        doc.remove("_id");
        return client.insert(EXCEPTIONS_COLLECTION, doc);
    }

    public Future<List<AvailabilityException>> findExceptionsByUserId(String userId) {
        JsonObject query = new JsonObject().put("userId", userId);
        return client.find(EXCEPTIONS_COLLECTION, query).map(docs -> 
            docs.stream().map(doc -> doc.mapTo(AvailabilityException.class)).collect(Collectors.toList())
        );
    }
    
    public Future<Void> deleteException(String exceptionId) {
        JsonObject query = new JsonObject().put("_id", exceptionId);
        return client.removeDocument(EXCEPTIONS_COLLECTION, query).mapEmpty();
    }
}
