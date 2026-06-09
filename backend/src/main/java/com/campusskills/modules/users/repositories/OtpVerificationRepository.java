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
            String isoDate = java.time.Instant.ofEpochMilli(otpVerification.getExpiresAt()).toString();
            doc.put("expiresAt", new JsonObject().put("$date", isoDate));
        }
        return client.insert(COLLECTION, doc);
    }

    public Future<OtpVerification> findByUserIdAndType(String userId, String type) {
        JsonObject query = new JsonObject().put("userId", userId).put("type", type);
        return client.findOne(COLLECTION, query, null).map(doc -> {
            if (doc == null) return null;
            if (doc.getValue("expiresAt") instanceof JsonObject) {
                JsonObject expiresAtObj = doc.getJsonObject("expiresAt");
                if (expiresAtObj.containsKey("$date")) {
                    try {
                        String isoDate = expiresAtObj.getString("$date");
                        long millis = java.time.Instant.parse(isoDate).toEpochMilli();
                        doc.put("expiresAt", millis);
                    } catch (Exception e) {
                        // If it's stored as Long directly inside $date somehow
                        Object val = expiresAtObj.getValue("$date");
                        if (val instanceof Number) {
                            doc.put("expiresAt", ((Number) val).longValue());
                        }
                    }
                }
            }
            return doc.mapTo(OtpVerification.class);
        });
    }

    public Future<Boolean> incrementAttempts(String id) {
        JsonObject query = new JsonObject().put("_id", id);
        JsonObject update = new JsonObject().put("$inc", new JsonObject().put("attempts", 1));
        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<Boolean> updateOtp(String id, String newOtpHash, Long newExpiresAt, Long newLastResentAt) {
        String isoDate = java.time.Instant.ofEpochMilli(newExpiresAt).toString();
        JsonObject query = new JsonObject().put("_id", id);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("otpHash", newOtpHash)
            .put("expiresAt", new io.vertx.core.json.JsonObject().put("$date", isoDate))
            .put("lastResentAt", newLastResentAt)
            .put("attempts", 0)); // Reset attempts
        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<Void> deleteByUserIdAndType(String userId, String type) {
        JsonObject query = new JsonObject().put("userId", userId).put("type", type);
        return client.removeDocument(COLLECTION, query).mapEmpty();
    }
}
