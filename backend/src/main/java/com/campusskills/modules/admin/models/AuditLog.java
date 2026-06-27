package com.campusskills.modules.admin.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AuditLog {
    
    @JsonProperty("_id")
    private String id;
    
    private String action; // PROMOTE_USER, DEMOTE_USER, SUSPEND_USER, UNSUSPEND_USER
    
    private String actorId;
    private String actorName;
    private String actorEmail;
    
    private String targetId;
    private String targetName;
    private String targetEmail;
    
    private String previousState; 
    private String newState; 
    private String reason; 
    
    private Long timestamp;
    private String ipAddress;
    
    public AuditLog() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    
    public String getActorId() { return actorId; }
    public void setActorId(String actorId) { this.actorId = actorId; }
    
    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }
    
    public String getActorEmail() { return actorEmail; }
    public void setActorEmail(String actorEmail) { this.actorEmail = actorEmail; }
    
    public String getTargetId() { return targetId; }
    public void setTargetId(String targetId) { this.targetId = targetId; }
    
    public String getTargetName() { return targetName; }
    public void setTargetName(String targetName) { this.targetName = targetName; }
    
    public String getTargetEmail() { return targetEmail; }
    public void setTargetEmail(String targetEmail) { this.targetEmail = targetEmail; }
    
    public String getPreviousState() { return previousState; }
    public void setPreviousState(String previousState) { this.previousState = previousState; }
    
    public String getNewState() { return newState; }
    public void setNewState(String newState) { this.newState = newState; }
    
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    
    public Long getTimestamp() { return timestamp; }
    public void setTimestamp(Long timestamp) { this.timestamp = timestamp; }
    
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
}
