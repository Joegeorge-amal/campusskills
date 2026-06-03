package com.campusskills.modules.topics.repositories;

import com.campusskills.modules.topics.models.Topic;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

import java.util.List;
import java.util.stream.Collectors;

public class TopicRepository {

    private static final String COLLECTION = "topics";
    private final MongoClient mongoClient;

    public TopicRepository() {
        this.mongoClient = com.campusskills.core.database.MongoManager.getClient();
    }

    public Future<Topic> findById(String id) {
        JsonObject query = new JsonObject().put("_id", id);
        return mongoClient.findOne(COLLECTION, query, null)
                .map(json -> json != null ? json.mapTo(Topic.class) : null);
    }

    public Future<Topic> findByNormalizedName(String normalizedName) {
        JsonObject query = new JsonObject().put("normalizedName", normalizedName);
        return mongoClient.findOne(COLLECTION, query, null)
                .map(json -> json != null ? json.mapTo(Topic.class) : null);
    }

    public Future<List<Topic>> findAll() {
        return mongoClient.find(COLLECTION, new JsonObject())
                .map(list -> list.stream().map(json -> json.mapTo(Topic.class)).collect(Collectors.toList()));
    }

    public Future<List<Topic>> findByCategory(String category) {
        JsonObject query = new JsonObject().put("category", category);
        return mongoClient.find(COLLECTION, query)
                .map(list -> list.stream().map(json -> json.mapTo(Topic.class)).collect(Collectors.toList()));
    }

    public Future<Topic> create(Topic topic) {
        JsonObject document = JsonObject.mapFrom(topic);
        if (topic.getId() == null) {
            document.remove("id");
        }
        return mongoClient.save(COLLECTION, document).map(id -> {
            topic.setId(id);
            return topic;
        });
    }
}
