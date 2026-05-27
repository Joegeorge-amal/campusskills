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
    private String chatId;
    private String teacherId;
    private String studentId;
    private Long scheduledStart;
    private Long scheduledEnd;
    private String meetingPlatform;
    private String meetingLink;
    private SessionStatus status; // SCHEDULED, ONGOING, COMPLETED, DISPUTED, CANCELLED
    private Boolean teacherConfirmed;
    private Boolean studentConfirmed;
    private Long createdAt;
    private Long updatedAt;

    public Session() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getExchangeId() {
        return exchangeId;
    }

    public void setExchangeId(String exchangeId) {
        this.exchangeId = exchangeId;
    }

    public String getChatId() {
        return chatId;
    }

    public void setChatId(String chatId) {
        this.chatId = chatId;
    }

    public String getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(String teacherId) {
        this.teacherId = teacherId;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
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

    public SessionStatus getStatus() {
        return status;
    }

    public void setStatus(SessionStatus status) {
        this.status = status;
    }

    public Boolean getTeacherConfirmed() {
        return teacherConfirmed;
    }

    public void setTeacherConfirmed(Boolean teacherConfirmed) {
        this.teacherConfirmed = teacherConfirmed;
    }

    public Boolean getStudentConfirmed() {
        return studentConfirmed;
    }

    public void setStudentConfirmed(Boolean studentConfirmed) {
        this.studentConfirmed = studentConfirmed;
    }

    public Long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }

    public Long getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Long updatedAt) {
        this.updatedAt = updatedAt;
    }
}
