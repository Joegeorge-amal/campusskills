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

    public Future<List<Message>> fetchChatMessages(String chatId, int skip, int limit, Long clearedAt) {
        JsonObject query = new JsonObject().put("chatId", chatId);
        if (clearedAt != null) {
            query.put("createdAt", new JsonObject().put("$gt", clearedAt));
        }
        
        FindOptions options = new FindOptions()
                .setSort(new JsonObject().put("createdAt", -1))
                .setLimit(limit)
                .setSkip(skip);
                
        return client.findWithOptions(COLLECTION, query, options)
                .map(list -> list.stream()
                        .map(json -> json.mapTo(Message.class))
                        .collect(Collectors.toList()));
    }

    public Future<Long> countMessagesByChatId(String chatId, Long clearedAt) {
        JsonObject query = new JsonObject().put("chatId", chatId);
        if (clearedAt != null) {
            query.put("createdAt", new JsonObject().put("$gt", clearedAt));
        }
        return client.count(COLLECTION, query);
    }

    public Future<Message> findLastMessageByChatId(String chatId, Long clearedAt) {
        JsonObject query = new JsonObject().put("chatId", chatId);
        if (clearedAt != null) {
            query.put("createdAt", new JsonObject().put("$gt", clearedAt));
        }
        FindOptions options = new FindOptions()
                .setSort(new JsonObject().put("createdAt", -1))
                .setLimit(1);
                
        return client.findWithOptions(COLLECTION, query, options)
                .map(list -> list.isEmpty() ? null : list.get(0).mapTo(Message.class));
    }

    public Future<JsonObject> getChatById(String chatId) {
        JsonObject query = new JsonObject().put("_id", chatId);
        return client.findOne("chats", query, null);
    }

    public Future<Message> getMessageById(String messageId) {
        JsonObject query = new JsonObject().put("_id", messageId);
        return client.findOne(COLLECTION, query, null)
                .map(doc -> doc == null ? null : doc.mapTo(Message.class));
    }

    public Future<Boolean> markMessageAsRead(String messageId, Long readAt) {
        JsonObject query = new JsonObject().put("_id", messageId);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
                .put("isRead", true)
                .put("readAt", readAt));
        
        return client.updateCollection(COLLECTION, query, update)
                .map(res -> res.getDocModified() > 0);
    }

    public Future<Boolean> markMessageAsDelivered(String messageId, Long deliveredAt) {
        JsonObject query = new JsonObject().put("_id", messageId);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
                .put("isDelivered", true)
                .put("deliveredAt", deliveredAt));
        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<Boolean> editMessage(String messageId, String newContent, Long editedAt) {
        JsonObject query = new JsonObject().put("_id", messageId);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
                .put("message", newContent)
                .put("editedAt", editedAt));
        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<Boolean> softDeleteMessage(String messageId, Long deletedAt) {
        JsonObject query = new JsonObject().put("_id", messageId);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
                .put("message", "This message was deleted.")
                .put("isDeleted", true)
                .put("deletedAt", deletedAt));
        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<Boolean> markChatMessagesAsRead(String chatId, String userId, Long readAt) {
        JsonObject query = new JsonObject()
                .put("chatId", chatId)
                .put("senderId", new JsonObject().put("$ne", userId))
                .put("isRead", false);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
                .put("isRead", true)
                .put("readAt", readAt));
        
        io.vertx.ext.mongo.UpdateOptions options = new io.vertx.ext.mongo.UpdateOptions().setMulti(true);
        return client.updateCollectionWithOptions(COLLECTION, query, update, options)
                .map(res -> true);
    }

    public Future<Long> countUnreadMessagesForUser(String chatId, String userId, Long clearedAt) {
        JsonObject query = new JsonObject()
                .put("chatId", chatId)
                .put("senderId", new JsonObject().put("$ne", userId))
                .put("isRead", false);
        if (clearedAt != null) {
            query.put("createdAt", new JsonObject().put("$gt", clearedAt));
        }
        return client.count(COLLECTION, query);
    }

    public Future<Boolean> deleteMessagesByChatId(String chatId) {
        JsonObject query = new JsonObject().put("chatId", chatId);
        return client.removeDocuments(COLLECTION, query)
                .map(res -> true); // Even if 0 messages, it's successful
    }
}
