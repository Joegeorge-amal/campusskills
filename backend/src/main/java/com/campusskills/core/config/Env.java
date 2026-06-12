package com.campusskills.core.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Env {
    private static final Logger log = LoggerFactory.getLogger(Env.class);
    private static Dotenv dotenv;

    static {
        try {
            dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();
        } catch (Exception e) {
            log.warn("Could not load .env file: {}", e.getMessage());
        }
    }

    public static String get(String key) {
        if (dotenv != null) {
            String value = dotenv.get(key);
            if (value != null) {
                return value;
            }
        }
        return System.getenv(key);
    }

    public static String getOrDefault(String key, String defaultValue) {
        String value = get(key);
        return value != null ? value : defaultValue;
    }
}
