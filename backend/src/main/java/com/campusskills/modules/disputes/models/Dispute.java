package com.campusskills.modules.disputes.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.campusskills.shared.constants.DisputeReason;
import com.campusskills.shared.constants.DisputeStatus;
import com.campusskills.shared.constants.ResolutionType;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Dispute {

    @JsonProperty("_id")
    private String id;
    private String reporterId;
    private String reportedId;
    private String sessionId;
    private String exchangeId;
    private DisputeReason reasonType;
    private String description;
    private DisputeStatus status;
    private String adminNotes;
    private ResolutionType resolutionType;
    private String resolvedBy;
    private Long resolvedAt;
    private Long createdAt;
    private Long updatedAt;

    public Dispute() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getReporterId() { return reporterId; }
    public void setReporterId(String reporterId) { this.reporterId = reporterId; }

    public String getReportedId() { return reportedId; }
    public void setReportedId(String reportedId) { this.reportedId = reportedId; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getExchangeId() { return exchangeId; }
    public void setExchangeId(String exchangeId) { this.exchangeId = exchangeId; }

    public DisputeReason getReasonType() { return reasonType; }
    public void setReasonType(DisputeReason reasonType) { this.reasonType = reasonType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public DisputeStatus getStatus() { return status; }
    public void setStatus(DisputeStatus status) { this.status = status; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public ResolutionType getResolutionType() { return resolutionType; }
    public void setResolutionType(ResolutionType resolutionType) { this.resolutionType = resolutionType; }

    public String getResolvedBy() { return resolvedBy; }
    public void setResolvedBy(String resolvedBy) { this.resolvedBy = resolvedBy; }

    public Long getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Long resolvedAt) { this.resolvedAt = resolvedAt; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }

    public Long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Long updatedAt) { this.updatedAt = updatedAt; }
}
