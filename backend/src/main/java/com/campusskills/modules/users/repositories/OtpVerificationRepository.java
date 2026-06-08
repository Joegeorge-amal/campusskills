package com.campusskills.modules.users.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.users.models.OtpVerification;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

public class OtpVerificationRepository {
    private final MongoClient client;
    public static final String COLLECTION = "otp_verifications";

    public OtpVerificationRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<String> create(OtpVerification otpVerification) {
        JsonObject doc = JsonObject.mapFrom(otpVerification);
        doc.remove("_id");
        if (otpVerification.getExpiresAt() != null) {
            doc.put("expiresAt", new JsonObject().put("$date", otpVerification.getExpiresAt().getTime()));
        }
        return client.insert(COLLECTION, doc);
    }

    public Future<OtpVerification> findByUserId(String userId) {
        JsonObject query = new JsonObject().put("userId", userId);
        return client.findOne(COLLECTION, query, null).map(doc -> {
            if (doc == null) return null;
            return doc.mapTo(OtpVerification.class);
        });
    }

    public Future<Boolean> incrementAttempts(String id) {
        JsonObject query = new JsonObject().put("_id", id);
        JsonObject update = new JsonObject().put("$inc", new JsonObject().put("attempts", 1));
        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<Boolean> updateOtp(String id, String newOtpHash, java.util.Date newExpiresAt, Long newLastResentAt) {
        JsonObject query = new JsonObject().put("_id", id);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("otpHash", newOtpHash)
            .put("expiresAt", new io.vertx.core.json.JsonObject().put("$date", newExpiresAt.getTime()))
            .put("lastResentAt", newLastResentAt)
            .put("attempts", 0)); // Reset attempts
        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<Void> deleteByUserId(String userId) {
        JsonObject query = new JsonObject().put("userId", userId);
        return client.removeDocument(COLLECTION, query).mapEmpty();
    }
}
