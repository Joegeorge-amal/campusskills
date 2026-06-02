package com.campusskills.modules.notifications.services;

import com.campusskills.modules.notifications.models.Notification;
import com.campusskills.modules.notifications.models.NotificationType;
import com.campusskills.modules.notifications.repositories.NotificationRepository;
import io.vertx.core.Future;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonObject;

import java.util.List;

public class NotificationService {
    private final NotificationRepository repository;
    private final EventBus eventBus;

    public NotificationService(NotificationRepository repository, EventBus eventBus) {
        this.repository = repository;
        this.eventBus = eventBus;
        
        // Register consumer for internal notification creation
        this.eventBus.<JsonObject>consumer("internal.notification.create", msg -> {
            try {
                JsonObject payload = msg.body();
                Notification notification = payload.mapTo(Notification.class);
                String senderName = payload.getString("senderName"); // Optional, for aggregation
                handleNotificationCreation(notification, senderName);
            } catch (Exception e) {
                System.err.println("[NotificationService] Failed to process notification: " + e.getMessage());
            }
        });
    }

    private void handleNotificationCreation(Notification notification, String senderName) {
        if (notification.getType() == NotificationType.NEW_CHAT_ACTIVITY && "CHAT".equals(notification.getSourceType())) {
            repository.findUnreadChatNotification(notification.getUserId(), notification.getSourceId()).onSuccess(existing -> {
                if (existing != null) {
                    // Aggregate
                    String existingMsg = existing.getMessage();
                    int count = 2;
                    String name = senderName != null ? senderName : "Someone";
                    
                    if (existingMsg != null) {
                        if (existingMsg.startsWith("New message from ")) {
                            name = existingMsg.substring("New message from ".length());
                        } else if (existingMsg.contains(" • ") && existingMsg.contains(" unread messages")) {
                            int dotIndex = existingMsg.indexOf(" • ");
                            if (dotIndex > 0) {
                                name = existingMsg.substring(0, dotIndex);
                                String numStr = existingMsg.substring(dotIndex + 3, existingMsg.indexOf(" unread messages"));
                                try { 
                                    count = Integer.parseInt(numStr.trim()) + 1; 
                                } catch (Exception ignored) { }
                            }
                        }
                    }
                    
                    String newMessage = name + " • " + count + " unread messages";
                    repository.updateMessageAndTimestamp(existing.getId(), newMessage).onSuccess(updated -> {
                        existing.setMessage(newMessage);
                        existing.setUpdatedAt(System.currentTimeMillis());
                        NotificationBroadcaster.broadcastNewNotification(existing);
                    });
                } else {
                    // Create new
                    repository.create(notification).onSuccess(id -> {
                        NotificationBroadcaster.broadcastNewNotification(notification);
                    });
                }
            }).onFailure(err -> {
                System.err.println("[NotificationService] Failed to find unread chat notification: " + err.getMessage());
                repository.create(notification).onSuccess(id -> {
                    NotificationBroadcaster.broadcastNewNotification(notification);
                });
            });
        } else {
            // Normal creation for lifecycle events
            repository.create(notification).onSuccess(id -> {
                NotificationBroadcaster.broadcastNewNotification(notification);
            });
        }
    }

    public Future<List<Notification>> getUserNotifications(String userId, int skip, int limit) {
        return repository.fetchUserNotifications(userId, skip, limit);
    }

    public Future<Long> getUnreadCount(String userId) {
        return repository.countUnreadNotifications(userId);
    }

    public Future<Boolean> markAsRead(String notificationId, String userId) {
        return repository.markAsRead(notificationId, userId);
    }

    public Future<Long> markAllAsRead(String userId) {
        return repository.markAllAsRead(userId);
    }
}
