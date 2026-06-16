package com.campusskills.modules.topics.services;

import io.vertx.core.Vertx;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.InputStream;
import java.util.Scanner;

public class QuestionBankSeeder {
    private static final Logger log = LoggerFactory.getLogger(QuestionBankSeeder.class);

    public static void seed(Vertx vertx, MongoClient mongoClient) {
        log.info("Checking Question Banks...");
        
        // We will read a file named question-banks/questions.json from resources
        vertx.executeBlocking(promise -> {
            try {
                InputStream is = QuestionBankSeeder.class.getClassLoader().getResourceAsStream("question-banks/questions.json");
                if (is == null) {
                    log.info("No question bank seed file found at resources/question-banks/questions.json. Skipping question bank seeding.");
                    promise.complete();
                    return;
                }

                Scanner scanner = new Scanner(is).useDelimiter("\\A");
                String jsonStr = scanner.hasNext() ? scanner.next() : "";
                scanner.close();

                JsonArray questionsArray = new JsonArray(jsonStr);

                // Upsert each question by some unique constraint, e.g., question text + skill
                for (int i = 0; i < questionsArray.size(); i++) {
                    JsonObject q = questionsArray.getJsonObject(i);
                    JsonObject query = new JsonObject()
                        .put("skill", q.getString("skill"))
                        .put("question", q.getString("question"));
                    
                    JsonObject update = new JsonObject().put("$set", q);
                    
                    mongoClient.updateCollectionWithOptions("question_banks", query, update, new io.vertx.ext.mongo.UpdateOptions().setUpsert(true))
                        .onFailure(err -> log.error("Failed to seed question: " + q.getString("question"), err));
                }
                
                log.info("Successfully dispatched seeding for {} questions.", questionsArray.size());
                promise.complete();
            } catch (Exception e) {
                log.error("Failed to parse or seed question banks", e);
                promise.fail(e);
            }
        }, res -> {
            if (res.succeeded()) {
                log.info("Question Bank seeding task completed.");
            } else {
                log.error("Question Bank seeding task failed.", res.cause());
            }
        });
    }
}
