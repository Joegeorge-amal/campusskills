package com.campusskills.modules.sessions.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.campusskills.shared.constants.SessionStatus;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Session {

    @JsonProperty("_id")
    private String id;
    private String exchangeId;
    private String teacherId;
    private String studentId;
    private String topic;
    private String chatId;
    private String listingId;
    private Long scheduledStart;
    private Long scheduledEnd;
    private String meetingPlatform;
    private String meetingLink;
    private SessionStatus status;
    private Long confirmationDeadline;
    private java.util.Set<String> confirmedBy;
    private Long createdAt;
    private Long updatedAt;

    public Session() {
        this.confirmedBy = new java.util.HashSet<>();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getExchangeId() { return exchangeId; }
    public void setExchangeId(String exchangeId) { this.exchangeId = exchangeId; }

    public String getTeacherId() { return teacherId; }
    public void setTeacherId(String teacherId) { this.teacherId = teacherId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getChatId() { return chatId; }
    public void setChatId(String chatId) { this.chatId = chatId; }

    public String getListingId() { return listingId; }
    public void setListingId(String listingId) { this.listingId = listingId; }

    public Long getScheduledStart() { return scheduledStart; }
    public void setScheduledStart(Long scheduledStart) { this.scheduledStart = scheduledStart; }

    public Long getScheduledEnd() { return scheduledEnd; }
    public void setScheduledEnd(Long scheduledEnd) { this.scheduledEnd = scheduledEnd; }

    public String getMeetingPlatform() { return meetingPlatform; }
    public void setMeetingPlatform(String meetingPlatform) { this.meetingPlatform = meetingPlatform; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }

    public Long getConfirmationDeadline() { return confirmationDeadline; }
    public void setConfirmationDeadline(Long confirmationDeadline) { this.confirmationDeadline = confirmationDeadline; }

    public java.util.Set<String> getConfirmedBy() { return confirmedBy; }
    public void setConfirmedBy(java.util.Set<String> confirmedBy) { this.confirmedBy = confirmedBy; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }

    public Long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Long updatedAt) { this.updatedAt = updatedAt; }
}
