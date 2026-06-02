package com.campusskills.modules.notifications.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.notifications.models.Notification;
import com.campusskills.modules.notifications.models.NotificationType;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

import java.util.List;
import java.util.stream.Collectors;

public class NotificationRepository {
    private static final String COLLECTION = "notifications";
    private final MongoClient client;

    public NotificationRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<String> create(Notification notification) {
        long now = System.currentTimeMillis();
        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(now);
        }
        notification.setUpdatedAt(now);
        notification.setRead(false);
        
        JsonObject document = JsonObject.mapFrom(notification);
        document.remove("id");
        
        return client.save(COLLECTION, document).map(id -> {
            notification.setId(id);
            return id;
        });
    }

    public Future<Notification> findById(String id) {
        JsonObject query = new JsonObject().put("_id", id);
        return client.findOne(COLLECTION, query, null)
                .map(doc -> {
                    if (doc == null) return null;
                    doc.put("id", doc.getString("_id"));
                    doc.remove("_id");
                    return doc.mapTo(Notification.class);
                });
    }

    public Future<Notification> findUnreadChatNotification(String userId, String chatId) {
        JsonObject query = new JsonObject()
            .put("userId", userId)
            .put("type", NotificationType.NEW_CHAT_ACTIVITY.name())
            .put("sourceType", "CHAT")
            .put("sourceId", chatId)
            .put("isRead", false);
            
        io.vertx.ext.mongo.FindOptions options = new io.vertx.ext.mongo.FindOptions()
            .setSort(new JsonObject().put("createdAt", -1))
            .setLimit(1);

        return client.findWithOptions(COLLECTION, query, options)
                .map(list -> {
                    if (list == null || list.isEmpty()) return null;
                    JsonObject doc = list.get(0);
                    doc.put("id", doc.getString("_id"));
                    doc.remove("_id");
                    return doc.mapTo(Notification.class);
                });
    }

    public Future<Boolean> updateMessageAndTimestamp(String id, String newMessage) {
        JsonObject query = new JsonObject().put("_id", id);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("message", newMessage)
            .put("updatedAt", System.currentTimeMillis()));

        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<Boolean> markAsRead(String id, String userId) {
        JsonObject query = new JsonObject()
            .put("_id", id)
            .put("userId", userId);
            
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("isRead", true)
            .put("updatedAt", System.currentTimeMillis()));

        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified() > 0);
    }
    
    public Future<Long> markAllAsRead(String userId) {
        JsonObject query = new JsonObject()
            .put("userId", userId)
            .put("isRead", false);
            
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("isRead", true)
            .put("updatedAt", System.currentTimeMillis()));

        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified());
    }

    public Future<List<Notification>> fetchUserNotifications(String userId, int skip, int limit) {
        JsonObject query = new JsonObject().put("userId", userId);
        
        io.vertx.ext.mongo.FindOptions options = new io.vertx.ext.mongo.FindOptions()
                .setSort(new JsonObject().put("updatedAt", -1))
                .setSkip(skip)
                .setLimit(limit);

        return client.findWithOptions(COLLECTION, query, options)
                .map(list -> list.stream().map(doc -> {
                    doc.put("id", doc.getString("_id"));
                    doc.remove("_id");
                    return doc.mapTo(Notification.class);
                }).collect(Collectors.toList()));
    }
    
    public Future<Long> countUnreadNotifications(String userId) {
        JsonObject query = new JsonObject()
            .put("userId", userId)
            .put("isRead", false);
        return client.count(COLLECTION, query);
    }
}
