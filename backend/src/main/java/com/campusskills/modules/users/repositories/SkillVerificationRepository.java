package com.campusskills.modules.users.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.users.models.SkillVerification;
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

    public Future<List<SkillVerification>> findByUserId(String userId) {
        JsonObject query = new JsonObject().put("userId", userId);
        return client.find(COLLECTION, query).map(docs -> 
            docs.stream().map(doc -> doc.mapTo(SkillVerification.class)).collect(Collectors.toList())
        );
    }

    public Future<List<SkillVerification>> findByUserIdAndSkill(String userId, String skill) {
        JsonObject query = new JsonObject()
            .put("userId", userId)
            .put("skill", skill);
        return client.find(COLLECTION, query).map(docs -> 
            docs.stream().map(doc -> doc.mapTo(SkillVerification.class)).collect(Collectors.toList())
        );
    }
}
