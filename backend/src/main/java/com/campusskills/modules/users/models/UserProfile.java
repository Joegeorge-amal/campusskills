package com.campusskills.modules.users.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.campusskills.shared.models.SkillProfile;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class UserProfile {
    @JsonProperty("_id")
    private String id;
    private String userId;
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
    private List<String> verifiedSkills;
    private List<String> preferredTimes;
    private String sessionPreference;
    private String exchangePreference;
    private Boolean profileCompleted;
    private Long createdAt;
    private Long updatedAt;

    public UserProfile() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

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
}
