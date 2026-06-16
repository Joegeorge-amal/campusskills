package com.campusskills.modules.notifications.services;

import com.campusskills.modules.notifications.models.Notification;
import com.campusskills.modules.notifications.models.NotificationType;
import com.campusskills.modules.notifications.repositories.NotificationRepository;
import io.vertx.core.Future;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonObject;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
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
                log.error("[NotificationService] Failed to process notification", e);
            }
        });
    }

    private void handleNotificationCreation(Notification notification, String senderName) {
        if (notification.getType() == NotificationType.NEW_MESSAGE && "CHAT".equals(notification.getSourceType())) {
            repository.findUnreadChatNotification(notification.getUserId(), notification.getSourceId()).onSuccess(existing -> {
                if (existing != null) {
                    // Aggregate
                    String existingMsg = existing.getMessage();
                    int count = 2;
                    String name = senderName != null ? senderName : "Someone";
                    
                    if (existingMsg != null) {
                        if (existingMsg.contains(" new message from ")) {
                            name = existingMsg.substring(existingMsg.indexOf(" new message from ") + " new message from ".length());
                            count = 2;
                        } else if (existingMsg.contains(" new messages from ")) {
                            name = existingMsg.substring(existingMsg.indexOf(" new messages from ") + " new messages from ".length());
                            String countStr = existingMsg.substring(0, existingMsg.indexOf(" new messages from "));
                            try {
                                count = Integer.parseInt(countStr.trim()) + 1;
                            } catch (Exception ignored) {}
                        }
                    }
                    
                    String newMessage = count + " new messages from " + name;
                    repository.updateMessageAndTimestamp(existing.getId(), newMessage).onSuccess(updated -> {
                        existing.setMessage(newMessage);
                        existing.setUpdatedAt(System.currentTimeMillis());
                        NotificationBroadcaster.broadcastNewNotification(existing);
                    });
                } else {
                    // Create new notification for the first message
                    String name = senderName != null ? senderName : "Someone";
                    notification.setMessage("1 new message from " + name);
                    repository.create(notification).onSuccess(id -> {
                        NotificationBroadcaster.broadcastNewNotification(notification);
                    });
                }
            }).onFailure(err -> {
                log.warn("[NotificationService] Failed to find unread chat notification", err);
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

    public Future<List<Notification>> getUnreadNotifications(String userId, int skip, int limit) {
        return repository.findUnreadUserNotifications(userId, skip, limit);
    }

    public Future<Notification> markAsRead(String notificationId, String userId) {
        return repository.markAsRead(notificationId, userId).compose(updated -> {
            if (updated) {
                return repository.findById(notificationId);
            }
            return Future.failedFuture("NOTIFICATION_NOT_FOUND");
        });
    }

    public Future<Long> markAllAsRead(String userId) {
        return repository.markAllAsRead(userId);
    }
}
