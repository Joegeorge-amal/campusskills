package com.campusskills.modules.users.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class OtpVerification {
    
    @JsonProperty("_id")
    private String id;
    private String userId;
    private String email;
    private String otpHash;
    private Integer attempts = 0;
    private java.util.Date expiresAt;
    private Long lastResentAt;

    public OtpVerification() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOtpHash() { return otpHash; }
    public void setOtpHash(String otpHash) { this.otpHash = otpHash; }

    public Integer getAttempts() { return attempts; }
    public void setAttempts(Integer attempts) { this.attempts = attempts; }

    public java.util.Date getExpiresAt() { return expiresAt; }
    public void setExpiresAt(java.util.Date expiresAt) { this.expiresAt = expiresAt; }

    public Long getLastResentAt() { return lastResentAt; }
    public void setLastResentAt(Long lastResentAt) { this.lastResentAt = lastResentAt; }
}
