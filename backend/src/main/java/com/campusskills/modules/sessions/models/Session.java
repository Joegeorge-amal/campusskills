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
    private String swapGroupId;
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
    private String mode;
    private Boolean teacherConfirmedCompletion;
    private Boolean studentConfirmedCompletion;
    private Boolean studentMarkedPaid;
    private RescheduleProposal rescheduleProposal;
    private Long createdAt;
    private Long updatedAt;
    private Boolean sent30MinChatReminder;
    private Boolean sentStartChatReminder;
    private String cancelledBy;
    private String cancellationReason;

    public Session() {
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getExchangeId() { return exchangeId; }
    public void setExchangeId(String exchangeId) { this.exchangeId = exchangeId; }

    public String getSwapGroupId() { return swapGroupId; }
    public void setSwapGroupId(String swapGroupId) { this.swapGroupId = swapGroupId; }

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

    public Boolean getTeacherConfirmedCompletion() { return teacherConfirmedCompletion; }
    public void setTeacherConfirmedCompletion(Boolean teacherConfirmedCompletion) { this.teacherConfirmedCompletion = teacherConfirmedCompletion; }

    public Boolean getStudentConfirmedCompletion() { return studentConfirmedCompletion; }
    public void setStudentConfirmedCompletion(Boolean studentConfirmedCompletion) { this.studentConfirmedCompletion = studentConfirmedCompletion; }

    public Boolean getStudentMarkedPaid() { return studentMarkedPaid; }
    public void setStudentMarkedPaid(Boolean studentMarkedPaid) { this.studentMarkedPaid = studentMarkedPaid; }

    public RescheduleProposal getRescheduleProposal() { return rescheduleProposal; }
    public void setRescheduleProposal(RescheduleProposal rescheduleProposal) { this.rescheduleProposal = rescheduleProposal; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }

    public Long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Long updatedAt) { this.updatedAt = updatedAt; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public Boolean getSent30MinChatReminder() { return sent30MinChatReminder; }
    public void setSent30MinChatReminder(Boolean sent30MinChatReminder) { this.sent30MinChatReminder = sent30MinChatReminder; }

    public Boolean getSentStartChatReminder() { return sentStartChatReminder; }
    public void setSentStartChatReminder(Boolean sentStartChatReminder) { this.sentStartChatReminder = sentStartChatReminder; }

    public String getCancelledBy() { return cancelledBy; }
    public void setCancelledBy(String cancelledBy) { this.cancelledBy = cancelledBy; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
}
