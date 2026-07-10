package com.campusskills.modules.users.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class OtpVerification {
    
    public static final String TYPE_EMAIL_VERIFICATION = "EMAIL_VERIFICATION";
    public static final String TYPE_PASSWORD_RESET = "PASSWORD_RESET";
    public static final String TYPE_TWO_FACTOR_LOGIN = "TWO_FACTOR_LOGIN";
    public static final String TYPE_BOOTSTRAP_SUPER_ADMIN = "BOOTSTRAP_SUPER_ADMIN";
    public static final String TYPE_ADMIN_INVITATION = "ADMIN_INVITATION";

    @JsonProperty("_id")
    private String id;
    private String userId;
    private String email;
    private String type;
    private String otpHash;
    private Integer attempts = 0;
    private Long expiresAt;
    private Long lastResentAt;
    private java.util.Map<String, Object> metadata;

    public OtpVerification() {}

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

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

    public Long getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Long expiresAt) { this.expiresAt = expiresAt; }

    public Long getLastResentAt() { return lastResentAt; }
    public void setLastResentAt(Long lastResentAt) { this.lastResentAt = lastResentAt; }

    public java.util.Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(java.util.Map<String, Object> metadata) { this.metadata = metadata; }
}
