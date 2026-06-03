package com.campusskills.modules.sessions.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateSessionRequest {

    private String requestId;
    private Long scheduledAt;
    private Integer durationMinutes;
    private Long scheduledStart;
    private Long scheduledEnd;
    private String meetingPlatform;
    private String meetingLink;

    public CreateSessionRequest() {
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public Long getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(Long scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Long getScheduledStart() {
        return scheduledStart;
    }

    public void setScheduledStart(Long scheduledStart) {
        this.scheduledStart = scheduledStart;
    }

    public Long getScheduledEnd() {
        return scheduledEnd;
    }

    public void setScheduledEnd(Long scheduledEnd) {
        this.scheduledEnd = scheduledEnd;
    }

    public String getMeetingPlatform() {
        return meetingPlatform;
    }

    public void setMeetingPlatform(String meetingPlatform) {
        this.meetingPlatform = meetingPlatform;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }
}
