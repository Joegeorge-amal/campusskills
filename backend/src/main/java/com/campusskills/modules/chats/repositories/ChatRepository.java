package com.campusskills.modules.chats.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.chats.models.Chat;
import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

import java.util.List;
import java.util.stream.Collectors;

public class ChatRepository {

    private static final String COLLECTION = "chats";
    private final MongoClient client;

    public ChatRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<String> createChat(Chat chat) {
        long now = System.currentTimeMillis();
        chat.setCreatedAt(now);
        chat.setUpdatedAt(now);
        
        JsonObject document = JsonObject.mapFrom(chat);
        // Remove _id if null so MongoDB auto-generates it
        if (document.getString("_id") == null) {
            document.remove("_id");
        }
        
        return client.save(COLLECTION, document);
    }

    public Future<List<Chat>> fetchUserChats(String userId) {
        JsonObject query = new JsonObject().put("participants", userId);
        
        return client.find(COLLECTION, query)
                .map(list -> list.stream()
                        .map(json -> json.mapTo(Chat.class))
                        .collect(Collectors.toList()));
    }

    public Future<Chat> findExistingChat(String listingId, List<String> participants) {
        JsonObject query = new JsonObject()
                .put("listingId", listingId)
                .put("participants", new JsonObject().put("$size", participants.size()).put("$all", new JsonArray(participants)));
        
        return client.findOne(COLLECTION, query, null)
                .map(doc -> doc == null ? null : doc.mapTo(Chat.class));
    }
}
