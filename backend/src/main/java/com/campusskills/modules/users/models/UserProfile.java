package com.campusskills.modules.users.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.campusskills.shared.models.SkillProfile;
import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;

@JsonIgnoreProperties(ignoreUnknown = true)
public class UserProfile {
    @JsonProperty("_id")
    private String id;
    private String userId;
    @JsonProperty("name")
    @JsonAlias({"displayName"})
    private String name;
    @JsonProperty("programme")
    private String programme;
    private String phoneNumber;
    private String year;
    private String bio;
    @JsonProperty("avatarImg")
    @JsonAlias("profilePicture")
    private String profilePicture;
    private String bannerImg;
    private Object avatarColor;
    private String upi;
    private List<SkillProfile> skillsOffered;
    private List<String> skillsWanted;
    private List<String> verifiedSkills = new ArrayList<>();
    private List<String> preferredTimes;
    private String sessionPreference;
    private String exchangePreference;
    private Boolean profileCompleted;
    private Boolean heatmapVisibility = true;
    private String institutionId;
    private String rollNo;
    private Long createdAt;
    private Long updatedAt;
    private Set<String> blockedUsers = new HashSet<>();

    public UserProfile() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    @JsonProperty("displayName")
    public void setDisplayName(String displayName) { 
        if (this.name == null) {
            this.name = displayName; 
        }
    }
    
    @JsonProperty("displayName")
    public String getDisplayName() {
        return name;
    }

    public String getProgramme() { return programme; }
    public void setProgramme(String programme) { this.programme = programme; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }

    public String getBannerImg() { return bannerImg; }
    public void setBannerImg(String bannerImg) { this.bannerImg = bannerImg; }

    public Object getAvatarColor() { return avatarColor; }
    public void setAvatarColor(Object avatarColor) { this.avatarColor = avatarColor; }

    public String getUpi() { return upi; }
    public void setUpi(String upi) { this.upi = upi; }

    public List<SkillProfile> getSkillsOffered() { return skillsOffered; }
    public void setSkillsOffered(List<SkillProfile> skillsOffered) { this.skillsOffered = skillsOffered; }

    public List<String> getSkillsWanted() { return skillsWanted; }
    public void setSkillsWanted(List<String> skillsWanted) { this.skillsWanted = skillsWanted; }

    public List<String> getVerifiedSkills() { return verifiedSkills; }
    public void setVerifiedSkills(List<String> verifiedSkills) { this.verifiedSkills = verifiedSkills; }

    public Boolean getProfileCompleted() { return profileCompleted; }
    public void setProfileCompleted(Boolean profileCompleted) { this.profileCompleted = profileCompleted; }

    public Boolean getHeatmapVisibility() { return heatmapVisibility != null ? heatmapVisibility : true; }
    public void setHeatmapVisibility(Boolean heatmapVisibility) { this.heatmapVisibility = heatmapVisibility; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }

    public Long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Long updatedAt) { this.updatedAt = updatedAt; }

    public List<String> getPreferredTimes() { return preferredTimes; }
    public void setPreferredTimes(List<String> preferredTimes) { this.preferredTimes = preferredTimes; }

    public String getSessionPreference() { return sessionPreference; }
    public void setSessionPreference(String sessionPreference) { this.sessionPreference = sessionPreference; }

    public String getExchangePreference() { return exchangePreference; }
    public void setExchangePreference(String exchangePreference) { this.exchangePreference = exchangePreference; }

    public String getRollNo() { return rollNo; }
    public void setRollNo(String rollNo) { this.rollNo = rollNo; }

    public Set<String> getBlockedUsers() {
        if (blockedUsers == null) {
            blockedUsers = new HashSet<>();
        }
        return blockedUsers;
    }

    public void setBlockedUsers(Set<String> blockedUsers) {
        this.blockedUsers = blockedUsers;
    }
}
