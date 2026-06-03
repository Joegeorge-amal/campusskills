package com.campusskills.modules.notifications.services;

import com.campusskills.modules.notifications.models.Notification;
import com.campusskills.shared.constants.WebSocketEventType;
import com.campusskills.web.websockets.ConnectionManager;
import com.campusskills.web.websockets.WebSocketMessageBuilder;
import io.vertx.core.json.JsonObject;

public class NotificationBroadcaster {

    public static void broadcastNewNotification(Notification notification) {
        try {
            JsonObject event = new WebSocketMessageBuilder()
                    .type(WebSocketEventType.NOTIFICATION)
                    .payload(JsonObject.mapFrom(notification))
                    .build();

            if (notification.getUserId() != null) {
                ConnectionManager.sendMessage(notification.getUserId(), event);
            }
        } catch (Exception e) {
            System.err.println("[BROADCAST WARN] Failed to broadcast NOTIFICATION: " + e.getMessage());
        }
    }
}
