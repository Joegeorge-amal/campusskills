package com.campusskills.modules.users.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public class User {

    @JsonProperty("_id")
    private String id;
    private String email;
    private String passwordHash;
    private String erpid;
    private UserRole role;
    private Boolean isActive;
    private Long createdAt;
    private Long updatedAt;

    public User() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getErpid() { return erpid; }
    public void setErpid(String erpid) { this.erpid = erpid; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }

    public Long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Long updatedAt) { this.updatedAt = updatedAt; }
}
