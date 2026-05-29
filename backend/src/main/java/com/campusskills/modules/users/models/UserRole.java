package com.campusskills.modules.users.models;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum UserRole {
    USER,
    ADMIN;

    @JsonCreator
    public static UserRole fromString(String key) {
        if (key == null) return USER;
        String upper = key.toUpperCase();
        if (upper.equals("STUDENT") || upper.equals("TEACHER")) {
            return USER;
        }
        try {
            return UserRole.valueOf(upper);
        } catch (IllegalArgumentException e) {
            return USER; // Safe default for any unknown legacy roles
        }
    }
}
