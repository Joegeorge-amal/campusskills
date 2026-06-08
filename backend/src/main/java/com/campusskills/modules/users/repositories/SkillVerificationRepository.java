package com.campusskills.modules.users.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.users.models.SkillVerification;
import com.campusskills.modules.users.models.VerificationStatus;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import java.util.List;
import java.util.stream.Collectors;

public class SkillVerificationRepository {
    private final MongoClient client;
    private static final String COLLECTION = "skill_verifications";

    public SkillVerificationRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<String> create(SkillVerification verification) {
        JsonObject doc = JsonObject.mapFrom(verification);
        doc.remove("_id");
        return client.insert(COLLECTION, doc);
    }

    public Future<SkillVerification> findById(String id) {
        JsonObject query = new JsonObject().put("_id", id);
        return client.findOne(COLLECTION, query, null).map(doc -> {
            if (doc == null) return null;
            return doc.mapTo(SkillVerification.class);
        });
    }

    public Future<List<SkillVerification>> findByUserId(String userId) {
        JsonObject query = new JsonObject().put("userId", userId);
        return client.find(COLLECTION, query).map(docs -> 
            docs.stream().map(doc -> doc.mapTo(SkillVerification.class)).collect(Collectors.toList())
        );
    }

    public Future<List<SkillVerification>> findByUserIdAndSkill(String userId, String skillName) {
        JsonObject query = new JsonObject()
            .put("userId", userId)
            .put("skillName", skillName);
        return client.find(COLLECTION, query).map(docs -> 
            docs.stream().map(doc -> doc.mapTo(SkillVerification.class)).collect(Collectors.toList())
        );
    }

    public Future<List<SkillVerification>> findPending() {
        JsonObject query = new JsonObject().put("status", VerificationStatus.PENDING.name());
        return client.find(COLLECTION, query).map(docs -> 
            docs.stream().map(doc -> doc.mapTo(SkillVerification.class)).collect(Collectors.toList())
        );
    }

    public Future<Boolean> assign(String id, String evaluatorId) {
        JsonObject query = new JsonObject().put("_id", id).put("status", VerificationStatus.PENDING.name());
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("evaluatorId", evaluatorId)
            .put("status", VerificationStatus.ASSIGNED.name())
            .put("evaluatedAt", System.currentTimeMillis())); // Track when assigned
        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<Boolean> evaluate(String id, VerificationStatus status, String notes) {
        JsonObject query = new JsonObject().put("_id", id).put("status", VerificationStatus.ASSIGNED.name());
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("status", status.name())
            .put("notes", notes)
            .put("evaluatedAt", System.currentTimeMillis()));
        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified() > 0);
    }
}
