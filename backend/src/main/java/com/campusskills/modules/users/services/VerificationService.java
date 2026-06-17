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
            System.out.println("===== START SUBMIT VERIFICATION =====");
            System.out.println("Payload received: " + (payload != null ? payload.encode() : "null"));
            
            String skill = payload != null ? payload.getString("skill") : "UNKNOWN_SKILL";
            System.out.println("Skill: " + skill);
            
            JsonObject answers = new JsonObject();
            if (payload != null && payload.getValue("answers") instanceof JsonObject) {
                answers = payload.getJsonObject("answers");
            } else {
                System.out.println("WARNING: answers field is missing or not a JsonObject. Value: " + 
                    (payload != null ? payload.getValue("answers") : "null"));
            }
            System.out.println("Answers array keys: " + answers.fieldNames());
            
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
                } catch (Exception e) {
                    System.out.println("WARNING: Failed to parse startedAt. Using current time.");
                    e.printStackTrace();
                }
            }
            Long completedAt = System.currentTimeMillis();

            if (failedDueToTabSwitch) {
                return saveAttempt(userId, skill, 0.0, 0.0, false, warningCount, true, startedAt, completedAt, "FAILED_TAB_SWITCH", "Tab switch failed");
            }

            JsonObject query = new JsonObject().put("skill", skill);
            System.out.println("Mongo query: " + query.encode());

            final JsonObject finalAnswers = answers;
            final Long finalStartedAt = startedAt;
            final Integer finalWarningCount = warningCount;
            return mongoClient.find("question_banks", query).compose(docs -> {
                System.out.println("Retrieved question count from DB: " + (docs != null ? docs.size() : "null"));
                
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
                        } catch (Exception loopEx) {
                            System.out.println("Exception processing individual question: ");
                            loopEx.printStackTrace();
                        }
                    }
                }

                System.out.println("Calculated correct: " + correct + ", total: " + total);
                
                double score = total > 0 ? ((double) correct / total * 100.0) : 0.0;
                double confidenceScore = score; // Placeholder confidence score
                boolean passed = score >= 60.0;
                String status = passed ? "COMPLETED_PASS" : "COMPLETED_FAIL";

                System.out.println("Score calculation: " + score + ", Confidence: " + confidenceScore + ", Passed: " + passed);

                return saveAttempt(userId, skill, score, confidenceScore, passed, finalWarningCount, false, finalStartedAt, completedAt, status, debugStr.toString())
                    .compose(verification -> {
                        System.out.println("Attempt saved to DB: " + verification.getId());
                        if (passed) {
                            return updateUserProfile(userId, skill).map(verification);
                        }
                        return Future.succeededFuture(verification);
                    });
            }).onFailure(err -> {
                System.out.println("Exception in MongoClient find or save callback:");
                err.printStackTrace();
            }).recover(err -> {
                System.out.println("Recovering from error, returning fallback JSON.");
                SkillVerification fallback = new SkillVerification();
                fallback.setPassed(false);
                fallback.setScore(0.0);
                fallback.setConfidenceScore(0.0);
                return Future.succeededFuture(fallback);
            });
        } catch (Exception e) {
            System.out.println("Exception caught in synchronous block of submitVerification:");
            e.printStackTrace();
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
        return mongoClient.updateCollection("users", query, update).mapEmpty();
    }

    public Future<List<SkillVerification>> getMyRequests(String userId) {
        return repository.findByUserId(userId);
    }
}
