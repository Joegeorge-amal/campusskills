package com.campusskills.modules.notifications.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class Notification {
    private String id;
    private String userId; // The recipient of the notification (if applicable)
    
    private NotificationAudience recipientType = NotificationAudience.USER; // defaults to USER
    
    private String title;
    private String message;
    
    private NotificationType type;
    
    private String sourceType;
    private String sourceId;
    
    private boolean isRead;
    
    private Long createdAt;
    private Long updatedAt;

    public Notification() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public NotificationAudience getRecipientType() { return recipientType; }
    public void setRecipientType(NotificationAudience recipientType) { this.recipientType = recipientType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }

    public String getSourceId() { return sourceId; }
    public void setSourceId(String sourceId) { this.sourceId = sourceId; }

    @com.fasterxml.jackson.annotation.JsonProperty("isRead")
    public boolean isRead() { return isRead; }

    @com.fasterxml.jackson.annotation.JsonProperty("isRead")
    public void setRead(boolean read) { isRead = read; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }

    public Long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Long updatedAt) { this.updatedAt = updatedAt; }
}
