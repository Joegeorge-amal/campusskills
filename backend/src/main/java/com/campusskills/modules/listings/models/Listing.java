package com.campusskills.modules.listings.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.campusskills.shared.models.SkillProfile;
import com.campusskills.modules.users.models.UserProfile;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Listing {

    @JsonProperty("_id")
    private String id;
    
    private String ownerId; // NEW
    @Deprecated
    private String teacherId; // LEGACY
    
    private String title;
    private String description;
    
    private String category;
    
    private List<String> topics; // NEW
    
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private UserProfile owner; // Populated field
    
    private ListingType listingType; // NEW
    @Deprecated
    private SessionType sessionType; // LEGACY
    
    private List<SkillProfile> offeredSkills; // NEW
    @Deprecated
    private List<SkillProfile> skills; // LEGACY
    
    private List<SkillProfile> requestedSkills; // NEW
    @Deprecated
    private List<SkillProfile> preferredSkills; // LEGACY
    
    private Double price;
    private Double budget; // NEW for LEARN
    
    private Availability availability;
    
    private List<ListingSlot> availableSlots;
    
    private Boolean active;
    
    private String status;
    
    private Long createdAt;
    private Long updatedAt;

    public Listing() {
        this.status = "ACTIVE";
    }

    // --- Synchronization methods for dual-write ---
    private void syncOwnerId() {
        if (ownerId != null && teacherId == null) teacherId = ownerId;
        else if (teacherId != null && ownerId == null) ownerId = teacherId;
        else if (ownerId != null && teacherId != null && !ownerId.equals(teacherId)) teacherId = ownerId;
    }
    
    private void syncListingType() {
        if (listingType != null) {
            if (listingType == ListingType.TEACH || listingType == ListingType.LEARN) {
                sessionType = SessionType.PAID;
            } else if (listingType == ListingType.SWAP) {
                sessionType = SessionType.SWAP;
            }
        } else if (sessionType != null) {
            if (sessionType == SessionType.PAID) listingType = ListingType.TEACH;
            else if (sessionType == SessionType.SWAP) listingType = ListingType.SWAP;
            else if (sessionType == SessionType.BOTH) listingType = ListingType.TEACH; // fallback
        }
    }
    
    private void syncSkills() {
        if (offeredSkills != null && skills == null) skills = offeredSkills;
        else if (skills != null && offeredSkills == null) offeredSkills = skills;
        
        if (requestedSkills != null && preferredSkills == null) preferredSkills = requestedSkills;
        else if (preferredSkills != null && requestedSkills == null) requestedSkills = preferredSkills;
    }
    
    // Ensure sync happens before db operations
    public void prepareForSave() {
        syncOwnerId();
        syncListingType();
        syncSkills();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOwnerId() { syncOwnerId(); return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; syncOwnerId(); }

    @Deprecated
    public String getTeacherId() { syncOwnerId(); return teacherId; }
    @Deprecated
    public void setTeacherId(String teacherId) { this.teacherId = teacherId; syncOwnerId(); }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public List<String> getTopics() { return topics; }
    public void setTopics(List<String> topics) { this.topics = topics; }

    public UserProfile getOwner() { return owner; }
    public void setOwner(UserProfile owner) { this.owner = owner; }

    public ListingType getListingType() { syncListingType(); return listingType; }
    public void setListingType(ListingType listingType) { this.listingType = listingType; syncListingType(); }

    @Deprecated
    public SessionType getSessionType() { syncListingType(); return sessionType; }
    @Deprecated
    public void setSessionType(SessionType sessionType) { this.sessionType = sessionType; syncListingType(); }

    public List<SkillProfile> getOfferedSkills() { syncSkills(); return offeredSkills; }
    public void setOfferedSkills(List<SkillProfile> offeredSkills) { this.offeredSkills = offeredSkills; syncSkills(); }

    @Deprecated
    public List<SkillProfile> getSkills() { syncSkills(); return skills; }
    @Deprecated
    public void setSkills(List<SkillProfile> skills) { this.skills = skills; syncSkills(); }

    public List<SkillProfile> getRequestedSkills() { syncSkills(); return requestedSkills; }
    public void setRequestedSkills(List<SkillProfile> requestedSkills) { this.requestedSkills = requestedSkills; syncSkills(); }

    @Deprecated
    public List<SkillProfile> getPreferredSkills() { syncSkills(); return preferredSkills; }
    @Deprecated
    public void setPreferredSkills(List<SkillProfile> preferredSkills) { this.preferredSkills = preferredSkills; syncSkills(); }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }

    public Availability getAvailability() { return availability; }
    public void setAvailability(Availability availability) { this.availability = availability; }

    public List<ListingSlot> getAvailableSlots() { return availableSlots; }
    public void setAvailableSlots(List<ListingSlot> availableSlots) { this.availableSlots = availableSlots; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }

    public Long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Long updatedAt) { this.updatedAt = updatedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
