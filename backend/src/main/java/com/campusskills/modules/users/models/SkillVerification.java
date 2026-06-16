package com.campusskills.modules.users.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SkillVerification {
    @JsonProperty("_id")
    private String id;
    private String userId;
    private String skill;
    private Double score;
    private Boolean passed;
    private Integer warningCount;
    private Boolean failedDueToTabSwitch;
    private Long startedAt;
    private Long completedAt;
    private String status; // e.g. "COMPLETED", "FAILED_TAB_SWITCH", "TIMEOUT"

    public SkillVerification() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public Boolean getPassed() { return passed; }
    public void setPassed(Boolean passed) { this.passed = passed; }

    public Integer getWarningCount() { return warningCount; }
    public void setWarningCount(Integer warningCount) { this.warningCount = warningCount; }

    public Boolean getFailedDueToTabSwitch() { return failedDueToTabSwitch; }
    public void setFailedDueToTabSwitch(Boolean failedDueToTabSwitch) { this.failedDueToTabSwitch = failedDueToTabSwitch; }

    public Long getStartedAt() { return startedAt; }
    public void setStartedAt(Long startedAt) { this.startedAt = startedAt; }

    public Long getCompletedAt() { return completedAt; }
    public void setCompletedAt(Long completedAt) { this.completedAt = completedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
