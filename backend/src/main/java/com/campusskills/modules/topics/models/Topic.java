package com.campusskills.modules.topics.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Topic {
    private String id;
    private String name;
    private String normalizedName;
    private String category;
    private String description;
    private Boolean isSystemTopic;
    private Boolean certifiable;
    private Long createdAt;
    private Long updatedAt;

    public Topic() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNormalizedName() {
        return normalizedName;
    }

    public void setNormalizedName(String normalizedName) {
        this.normalizedName = normalizedName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsSystemTopic() {
        return isSystemTopic;
    }

    public void setIsSystemTopic(Boolean isSystemTopic) {
        this.isSystemTopic = isSystemTopic;
    }

    public Boolean getCertifiable() {
        return certifiable;
    }

    public void setCertifiable(Boolean certifiable) {
        this.certifiable = certifiable;
    }

    public Long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }

    public Long getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Long updatedAt) {
        this.updatedAt = updatedAt;
    }
}
