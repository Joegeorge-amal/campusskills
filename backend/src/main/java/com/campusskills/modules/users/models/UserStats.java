package com.campusskills.modules.users.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Map;
import java.util.HashMap;

@JsonIgnoreProperties(ignoreUnknown = true)

public class UserStats {
    @JsonProperty("_id")
    private String id;
    private String userId;
    private Double ratingAvg;
    private Integer ratingCount;
    private Integer sessionsCompleted;
    private Integer sessionsAttended;
    private Integer totalMinutes = 0;
    private Long createdAt;
    private Long updatedAt;
    private Map<String, Integer> dailyActivityCounts = new HashMap<>();

    public UserStats() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Double getRatingAvg() { return ratingAvg; }
    public void setRatingAvg(Double ratingAvg) { this.ratingAvg = ratingAvg; }

    public Integer getRatingCount() { return ratingCount; }
    public void setRatingCount(Integer ratingCount) { this.ratingCount = ratingCount; }

    public Integer getSessionsCompleted() { return sessionsCompleted; }
    public void setSessionsCompleted(Integer sessionsCompleted) { this.sessionsCompleted = sessionsCompleted; }

    public Integer getSessionsAttended() { return sessionsAttended; }
    public void setSessionsAttended(Integer sessionsAttended) { this.sessionsAttended = sessionsAttended; }

    public Integer getTotalMinutes() { return totalMinutes; }
    public void setTotalMinutes(Integer totalMinutes) { this.totalMinutes = totalMinutes; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }

    public Long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Long updatedAt) { this.updatedAt = updatedAt; }

    public Map<String, Integer> getDailyActivityCounts() { return dailyActivityCounts; }
    public void setDailyActivityCounts(Map<String, Integer> dailyActivityCounts) { this.dailyActivityCounts = dailyActivityCounts; }
}
