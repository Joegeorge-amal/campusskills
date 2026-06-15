package com.campusskills.modules.sessions.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RescheduleProposal {
    private String proposedByUserId;
    private Long newScheduledStart;
    private Long newScheduledEnd;
    private String status; // PENDING

    public RescheduleProposal() {}

    public String getProposedByUserId() { return proposedByUserId; }
    public void setProposedByUserId(String proposedByUserId) { this.proposedByUserId = proposedByUserId; }

    public Long getNewScheduledStart() { return newScheduledStart; }
    public void setNewScheduledStart(Long newScheduledStart) { this.newScheduledStart = newScheduledStart; }

    public Long getNewScheduledEnd() { return newScheduledEnd; }
    public void setNewScheduledEnd(Long newScheduledEnd) { this.newScheduledEnd = newScheduledEnd; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
