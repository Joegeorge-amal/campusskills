package com.campusskills.shared.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SkillProfile {
    private String name;
    private SkillLevel level;

    public SkillProfile() {}

    public SkillProfile(String name, SkillLevel level) {
        this.name = name;
        this.level = level;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public SkillLevel getLevel() {
        return level;
    }

    public void setLevel(SkillLevel level) {
        this.level = level;
    }
}
