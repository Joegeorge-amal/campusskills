package com.campusskills.modules.users.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class UserProfile {
    @JsonProperty("_id")
    private String id;
    private String userId;
    private String displayName;
    private String department;
    private String sem;
    private String year;
    private String bio;
    private String profilePicture;
    private List<String> skillsOffered;
    private List<String> skillsWanted;
    private Boolean profileCompleted;
    private Long createdAt;
    private Long updatedAt;

    public UserProfile() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getSem() { return sem; }
    public void setSem(String sem) { this.sem = sem; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }

    public List<String> getSkillsOffered() { return skillsOffered; }
    public void setSkillsOffered(List<String> skillsOffered) { this.skillsOffered = skillsOffered; }

    public List<String> getSkillsWanted() { return skillsWanted; }
    public void setSkillsWanted(List<String> skillsWanted) { this.skillsWanted = skillsWanted; }

    public Boolean getProfileCompleted() { return profileCompleted; }
    public void setProfileCompleted(Boolean profileCompleted) { this.profileCompleted = profileCompleted; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }

    public Long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Long updatedAt) { this.updatedAt = updatedAt; }
}
