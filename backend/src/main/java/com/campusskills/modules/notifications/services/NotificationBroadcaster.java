package com.campusskills.modules.notifications.services;

import com.campusskills.modules.notifications.models.Notification;
import com.campusskills.shared.constants.WebSocketEventType;
import com.campusskills.web.websockets.ConnectionManager;
import com.campusskills.web.websockets.WebSocketMessageBuilder;
import io.vertx.core.json.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class NotificationBroadcaster {
    private static final Logger log = LoggerFactory.getLogger(NotificationBroadcaster.class);

    public static void broadcastNewNotification(Notification notification) {
        try {
            JsonObject event = new WebSocketMessageBuilder()
                    .type(WebSocketEventType.NOTIFICATION)
                    .payload(JsonObject.mapFrom(notification))
                    .build();

            if (com.campusskills.modules.notifications.models.NotificationAudience.ADMIN.equals(notification.getRecipientType())) {
                ConnectionManager.broadcastToAdmins(event);
            } else if (notification.getUserId() != null) {
                ConnectionManager.broadcastToUser(notification.getUserId(), event);
            }
        } catch (Exception e) {
            log.error("[BROADCAST WARN] Failed to broadcast NOTIFICATION", e);
        }
    }
}
