package com.campusskills.modules.messages.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.messages.models.Message;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.FindOptions;
import io.vertx.ext.mongo.MongoClient;

import java.util.List;
import java.util.stream.Collectors;

public class MessageRepository {

    private static final String COLLECTION = "messages";
    private final MongoClient client;

    public MessageRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<String> createMessage(Message message) {
        message.setCreatedAt(System.currentTimeMillis());
        if (message.getIsRead() == null) {
            message.setIsRead(false);
        }
        
        JsonObject document = JsonObject.mapFrom(message);
        if (document.getString("_id") == null) {
            document.remove("_id");
        }
        
        return client.save(COLLECTION, document);
    }

    public Future<List<Message>> fetchChatMessages(String chatId, int limit, int skip) {
        JsonObject query = new JsonObject().put("chatId", chatId);
        
        // Sort by createdAt descending (newest first)
        FindOptions options = new FindOptions()
                .setSort(new JsonObject().put("createdAt", -1))
                .setLimit(limit)
                .setSkip(skip);
                
        return client.findWithOptions(COLLECTION, query, options)
                .map(list -> list.stream()
                        .map(json -> json.mapTo(Message.class))
                        .collect(Collectors.toList()));
    }

    public Future<JsonObject> getChatById(String chatId) {
        JsonObject query = new JsonObject().put("_id", chatId);
        return client.findOne("chats", query, null);
    }
}
