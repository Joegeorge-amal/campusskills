package com.campusskills.modules.disputes.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.campusskills.shared.constants.DisputeReason;

@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateDisputeRequest {
    private String reportedId;
    private String sessionId;
    private String exchangeId;
    private DisputeReason reasonType;
    private String description;

    public CreateDisputeRequest() {}

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
}
