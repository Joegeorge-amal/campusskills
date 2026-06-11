package com.campusskills.modules.users.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SkillVerification {
    @JsonProperty("_id")
    private String id;
    private String userId;
    private String skillName;
    private VerificationStatus status;
    private Long requestedAt;
    private Long evaluatedAt;

    public SkillVerification() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public VerificationStatus getStatus() { return status; }
    public void setStatus(VerificationStatus status) { this.status = status; }

    public Long getRequestedAt() { return requestedAt; }
    public void setRequestedAt(Long requestedAt) { this.requestedAt = requestedAt; }

    public Long getEvaluatedAt() { return evaluatedAt; }
    public void setEvaluatedAt(Long evaluatedAt) { this.evaluatedAt = evaluatedAt; }
}
