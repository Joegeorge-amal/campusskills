package com.campusskills.modules.users.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class User {

    @JsonProperty("_id")
    private String id;
    private String email;
    private String passwordHash;
    private UserRole role;
    private Boolean isActive;
    private Boolean emailVerified;
    private Long createdAt;
    private Long updatedAt;
    
    // Admin Management Audit Fields
    private String suspensionCategory; 
    private String suspensionReason; 
    private Long suspendedAt;
    private String suspendedBy; // ID of the admin who suspended them

    private Long promotedAt;
    private String promotedBy; // ID of the admin who promoted them

    public User() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Boolean getEmailVerified() { return emailVerified; }
    public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }

    public Long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Long updatedAt) { this.updatedAt = updatedAt; }

    public String getSuspensionCategory() { return suspensionCategory; }
    public void setSuspensionCategory(String suspensionCategory) { this.suspensionCategory = suspensionCategory; }

    public String getSuspensionReason() { return suspensionReason; }
    public void setSuspensionReason(String suspensionReason) { this.suspensionReason = suspensionReason; }

    public Long getSuspendedAt() { return suspendedAt; }
    public void setSuspendedAt(Long suspendedAt) { this.suspendedAt = suspendedAt; }

    public String getSuspendedBy() { return suspendedBy; }
    public void setSuspendedBy(String suspendedBy) { this.suspendedBy = suspendedBy; }

    public Long getPromotedAt() { return promotedAt; }
    public void setPromotedAt(Long promotedAt) { this.promotedAt = promotedAt; }

    public String getPromotedBy() { return promotedBy; }
    public void setPromotedBy(String promotedBy) { this.promotedBy = promotedBy; }
}
