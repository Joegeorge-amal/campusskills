package com.campusskills.modules.availability.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AvailabilityException {

    @JsonProperty("_id")
    private String id;
    private String userId;
    private String date; // YYYY-MM-DD
    private boolean isAvailable;
    private String overrideStartTime;
    private String overrideEndTime;
    private Long createdAt;
    private Long updatedAt;

    public AvailabilityException() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }

    public String getOverrideStartTime() { return overrideStartTime; }
    public void setOverrideStartTime(String overrideStartTime) { this.overrideStartTime = overrideStartTime; }

    public String getOverrideEndTime() { return overrideEndTime; }
    public void setOverrideEndTime(String overrideEndTime) { this.overrideEndTime = overrideEndTime; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }

    public Long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Long updatedAt) { this.updatedAt = updatedAt; }
}
