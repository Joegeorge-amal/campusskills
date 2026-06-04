package com.campusskills.modules.exchanges.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.campusskills.shared.constants.ExchangeStatus;
import com.campusskills.shared.constants.ExchangeType;
import io.vertx.core.json.JsonObject;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Exchange {

    @JsonProperty("_id")
    private String exchangeId;
    private String initiatorId;
    private String receiverId;
    private String listingId;
    private ExchangeType type;
    private ExchangeStatus status;
    private String message;
    private String chatId;
    private java.util.List<JsonObject> proposedSessions; // array of { startTime, endTime, topic }
    private Long createdAt;
    private Long updatedAt;

    public Exchange() {}

    public String getExchangeId() { return exchangeId; }
    public void setExchangeId(String exchangeId) { this.exchangeId = exchangeId; }

    public String getInitiatorId() { return initiatorId; }
    public void setInitiatorId(String initiatorId) { this.initiatorId = initiatorId; }

    public String getReceiverId() { return receiverId; }
    public void setReceiverId(String receiverId) { this.receiverId = receiverId; }

    public String getListingId() { return listingId; }
    public void setListingId(String listingId) { this.listingId = listingId; }

    public ExchangeType getType() { return type; }
    public void setType(ExchangeType type) { this.type = type; }

    public ExchangeStatus getStatus() { return status; }
    public void setStatus(ExchangeStatus status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getChatId() { return chatId; }
    public void setChatId(String chatId) { this.chatId = chatId; }

    public java.util.List<JsonObject> getProposedSessions() { return proposedSessions; }
    public void setProposedSessions(java.util.List<JsonObject> proposedSessions) { this.proposedSessions = proposedSessions; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }

    public Long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Long updatedAt) { this.updatedAt = updatedAt; }
}
