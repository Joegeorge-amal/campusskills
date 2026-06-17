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
        try {
            String skill = payload != null ? payload.getString("skill") : "UNKNOWN_SKILL";
            
            JsonObject answers = new JsonObject();
            if (payload != null && payload.getValue("answers") instanceof JsonObject) {
                answers = payload.getJsonObject("answers");
            }
            
            Boolean failedDueToTabSwitch = false;
            try { failedDueToTabSwitch = payload != null ? payload.getBoolean("failedDueToTabSwitch", false) : false; } catch (Exception e) {}
            
            Integer warningCount = 0;
            try { warningCount = payload != null ? payload.getInteger("warningCount", 0) : 0; } catch (Exception e) {}
            
            Long startedAt = System.currentTimeMillis();
            if (payload != null) {
                try {
                    Object startedAtObj = payload.getValue("startedAt");
                    if (startedAtObj instanceof Number) {
                        startedAt = ((Number) startedAtObj).longValue();
                    } else if (startedAtObj != null) {
                        startedAt = Long.parseLong(startedAtObj.toString());
                    }
                } catch (Exception e) {}
            }
            Long completedAt = System.currentTimeMillis();

            if (failedDueToTabSwitch) {
                return saveAttempt(userId, skill, 0.0, 0.0, false, warningCount, true, startedAt, completedAt, "FAILED_TAB_SWITCH", "Tab switch failed");
            }

            JsonObject query = new JsonObject().put("skill", skill);

            final JsonObject finalAnswers = answers;
            final Long finalStartedAt = startedAt;
            final Integer finalWarningCount = warningCount;
            return mongoClient.find("question_banks", query).compose(docs -> {
                int total = docs != null && docs.size() > 0 ? docs.size() : 10;
                int correct = 0;
                
                StringBuilder debugStr = new StringBuilder();
                debugStr.append("Payload answers keys: ").append(finalAnswers.fieldNames()).append(". ");
                
                if (docs != null) {
                    for (JsonObject q : docs) {
                        try {
                            String qText = q.getString("question");
                            String qId = null;
                            Object idObj = q.getValue("_id");
                            if (idObj instanceof JsonObject && ((JsonObject) idObj).containsKey("$oid")) {
                                qId = ((JsonObject) idObj).getString("$oid");
                            } else if (idObj != null) {
                                qId = idObj.toString();
                            }

                            if ((qText != null && finalAnswers.containsKey(qText)) || (qId != null && finalAnswers.containsKey(qId))) {
                                Object providedObj = finalAnswers.containsKey(qText) ? finalAnswers.getValue(qText) : finalAnswers.getValue(qId);
                                Integer provided = null;
                                if (providedObj instanceof Number) {
                                    provided = ((Number) providedObj).intValue();
                                } else if (providedObj != null) {
                                    provided = Integer.parseInt(providedObj.toString());
                                }
                                
                                Integer actual = q.getInteger("correctAnswer");
                                debugStr.append("Q:").append(qText != null ? qText.substring(0, Math.min(10, qText.length())) : "null")
                                        .append(" P:").append(provided).append(" A:").append(actual).append(" | ");
                                if (provided != null && actual != null && provided.equals(actual)) {
                                    correct++;
                                }
                            }
                        } catch (Exception loopEx) {}
                    }
                }
                
                double score = total > 0 ? ((double) correct / total * 100.0) : 0.0;
                double confidenceScore = score;
                boolean passed = score >= 60.0;
                String status = passed ? "COMPLETED_PASS" : "COMPLETED_FAIL";

                return saveAttempt(userId, skill, score, confidenceScore, passed, finalWarningCount, false, finalStartedAt, completedAt, status, debugStr.toString())
                    .compose(verification -> {
                        if (passed) {
                            return updateUserProfile(userId, skill).map(verification);
                        }
                        return Future.succeededFuture(verification);
                    });
            }).recover(err -> {
                SkillVerification fallback = new SkillVerification();
                fallback.setPassed(false);
                fallback.setScore(0.0);
                fallback.setConfidenceScore(0.0);
                return Future.succeededFuture(fallback);
            });
        } catch (Exception e) {
            SkillVerification fallback = new SkillVerification();
            fallback.setPassed(false);
            fallback.setScore(0.0);
            fallback.setConfidenceScore(0.0);
            return Future.succeededFuture(fallback);
        }
    }

    private Future<SkillVerification> saveAttempt(String userId, String skill, Double score, Double confidenceScore, Boolean passed, Integer warningCount, Boolean failedDueToTabSwitch, Long startedAt, Long completedAt, String status, String debug) {
        SkillVerification v = new SkillVerification();
        v.setUserId(userId);
        v.setSkill(skill);
        v.setScore(score);
        v.setConfidenceScore(confidenceScore);
        v.setPassed(passed);
        v.setWarningCount(warningCount);
        v.setFailedDueToTabSwitch(failedDueToTabSwitch);
        v.setStartedAt(startedAt);
        v.setCompletedAt(completedAt);
        v.setStatus(status);
        v.setDebug(debug);

        return repository.create(v).map(id -> {
            v.setId(id);
            return v;
        });
    }

    private Future<Void> updateUserProfile(String userId, String skill) {
        JsonObject query = new JsonObject().put("userId", userId);
        JsonObject update = new JsonObject().put("$addToSet", new JsonObject().put("verifiedSkills", skill));
        return mongoClient.updateCollection("user_profiles", query, update).mapEmpty();
    }

    public Future<List<SkillVerification>> getMyRequests(String userId) {
        return repository.findByUserId(userId);
    }
}
