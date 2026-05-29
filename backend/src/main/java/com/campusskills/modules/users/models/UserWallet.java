package com.campusskills.modules.users.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UserWallet {
    @JsonProperty("_id")
    private String id;
    private String userId;
    private Double balance;
    private Long createdAt;
    private Long updatedAt;

    public UserWallet() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Double getBalance() { return balance; }
    public void setBalance(Double balance) { this.balance = balance; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }

    public Long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Long updatedAt) { this.updatedAt = updatedAt; }
}
