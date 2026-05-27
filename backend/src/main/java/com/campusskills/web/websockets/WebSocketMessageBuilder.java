package com.campusskills.web.websockets;

import io.vertx.core.json.JsonObject;

public class WebSocketMessageBuilder {

    private WebSocketEventType type;
    private Long timestamp;
    private JsonObject payload;

    public WebSocketMessageBuilder() {
        this.timestamp = System.currentTimeMillis();
        this.payload = new JsonObject();
    }

    public WebSocketMessageBuilder type(WebSocketEventType type) {
        this.type = type;
        return this;
    }

    public WebSocketMessageBuilder timestamp(Long timestamp) {
        this.timestamp = timestamp;
        return this;
    }

    public WebSocketMessageBuilder payload(JsonObject payload) {
        this.payload = payload;
        return this;
    }

    public JsonObject build() {
        if (type == null) {
            throw new IllegalStateException("WebSocket event type is required");
        }
        
        return new JsonObject()
                .put("type", type.name())
                .put("timestamp", timestamp)
                .put("payload", payload);
    }
}
