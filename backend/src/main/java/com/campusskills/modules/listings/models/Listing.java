package com.campusskills.modules.listings.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.campusskills.shared.models.SkillProfile;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Listing {

    @JsonProperty("_id")
    private String id;
    private String teacherId;
    
    private String title;
    private String description;
    
    private String category;
    private List<SkillProfile> skills;
    
    private SessionType sessionType;
    private Double price;
    private List<SkillProfile> preferredSkills;
    
    private Availability availability;
    
    private List<String> availableDays;
    private String availableHours;
    
    private Boolean active;
    
    private Long createdAt;
    private Long updatedAt;

    public Listing() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTeacherId() { return teacherId; }
    public void setTeacherId(String teacherId) { this.teacherId = teacherId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public List<SkillProfile> getSkills() { return skills; }
    public void setSkills(List<SkillProfile> skills) { this.skills = skills; }

    public SessionType getSessionType() { return sessionType; }
    public void setSessionType(SessionType sessionType) { this.sessionType = sessionType; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public List<SkillProfile> getPreferredSkills() { return preferredSkills; }
    public void setPreferredSkills(List<SkillProfile> preferredSkills) { this.preferredSkills = preferredSkills; }

    public Availability getAvailability() { return availability; }
    public void setAvailability(Availability availability) { this.availability = availability; }

    public List<String> getAvailableDays() { return availableDays; }
    public void setAvailableDays(List<String> availableDays) { this.availableDays = availableDays; }

    public String getAvailableHours() { return availableHours; }
    public void setAvailableHours(String availableHours) { this.availableHours = availableHours; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }

    public Long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Long updatedAt) { this.updatedAt = updatedAt; }
}
