package com.campusskills.modules.users.services;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.users.models.SkillVerification;
import com.campusskills.modules.users.repositories.SkillVerificationRepository;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

import java.util.ArrayList;
import java.util.List;

public class VerificationService {
    private final SkillVerificationRepository repository;
    private final MongoClient mongoClient;

    public VerificationService(SkillVerificationRepository repository) {
        this.repository = repository;
        this.mongoClient = MongoManager.getClient();
    }

    public Future<List<JsonObject>> getQuestions(String skill) {
        JsonObject pipeline = new JsonObject()
            .put("aggregate", "question_banks")
            .put("pipeline", new io.vertx.core.json.JsonArray()
                .add(new JsonObject().put("$match", new JsonObject().put("skill", skill)))
                .add(new JsonObject().put("$sample", new JsonObject().put("size", 10)))
                .add(new JsonObject().put("$project", new JsonObject().put("correctAnswer", 0)))
            )
            .put("cursor", new JsonObject());

        return mongoClient.runCommand("aggregate", pipeline).map(res -> {
            io.vertx.core.json.JsonArray batch = res.getJsonObject("cursor").getJsonArray("firstBatch");
            List<JsonObject> questions = new ArrayList<>();
            if (batch != null) {
                for (int i = 0; i < batch.size(); i++) {
                    JsonObject doc = batch.getJsonObject(i);
                    Object idObj = doc.getValue("_id");
                    if (idObj instanceof JsonObject && ((JsonObject) idObj).containsKey("$oid")) {
                        doc.put("_id", ((JsonObject) idObj).getString("$oid"));
                    } else if (idObj != null) {
                        doc.put("_id", idObj.toString());
                    }
                    questions.add(doc);
                }
            }
            return questions;
        });
    }

    public Future<SkillVerification> submitVerification(String userId, JsonObject payload) {
        String skill = payload.getString("skill");
        JsonObject answers = payload.getJsonObject("answers", new JsonObject());
        Boolean failedDueToTabSwitch = payload.getBoolean("failedDueToTabSwitch", false);
        Integer warningCount = payload.getInteger("warningCount", 0);
        Long startedAt = payload.getLong("startedAt", System.currentTimeMillis());
        Long completedAt = System.currentTimeMillis();

        if (failedDueToTabSwitch) {
            return saveAttempt(userId, skill, 0.0, false, warningCount, true, startedAt, completedAt, "FAILED_TAB_SWITCH");
        }

        JsonObject query = new JsonObject().put("skill", skill);
        return mongoClient.find("question_banks", query).compose(docs -> {
            int total = 10;
            int correct = 0;
            
            for (JsonObject q : docs) {
                String qText = q.getString("question");

                if (qText != null && answers.containsKey(qText)) {
                    Integer provided = answers.getInteger(qText);
                    Integer actual = q.getInteger("correctAnswer");
                    if (provided != null && actual != null && provided.equals(actual)) {
                        correct++;
                    }
                }
            }

            double score = (double) correct / total * 100.0;
            boolean passed = score >= 60.0;
            String status = passed ? "COMPLETED_PASS" : "COMPLETED_FAIL";

            return saveAttempt(userId, skill, score, passed, warningCount, false, startedAt, completedAt, status)
                .compose(verification -> {
                    if (passed) {
                        return updateUserProfile(userId, skill).map(verification);
                    }
                    return Future.succeededFuture(verification);
                });
        });
    }

    private Future<SkillVerification> saveAttempt(String userId, String skill, Double score, Boolean passed, Integer warningCount, Boolean failedDueToTabSwitch, Long startedAt, Long completedAt, String status) {
        SkillVerification v = new SkillVerification();
        v.setUserId(userId);
        v.setSkill(skill);
        v.setScore(score);
        v.setPassed(passed);
        v.setWarningCount(warningCount);
        v.setFailedDueToTabSwitch(failedDueToTabSwitch);
        v.setStartedAt(startedAt);
        v.setCompletedAt(completedAt);
        v.setStatus(status);

        return repository.create(v).map(id -> {
            v.setId(id);
            return v;
        });
    }

    private Future<Void> updateUserProfile(String userId, String skill) {
        JsonObject query = new JsonObject().put("userId", userId);
        JsonObject update = new JsonObject().put("$addToSet", new JsonObject().put("verifiedSkills", skill));
        return mongoClient.updateCollection("users", query, update).mapEmpty();
    }

    public Future<List<SkillVerification>> getMyRequests(String userId) {
        return repository.findByUserId(userId);
    }
}
