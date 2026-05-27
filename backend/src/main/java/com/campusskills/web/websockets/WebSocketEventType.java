package com.campusskills.web.websockets;

public enum WebSocketEventType {
    NEW_MESSAGE,
    TYPING_STARTED,
    TYPING_STOPPED,
    USER_ONLINE,
    USER_OFFLINE,
    NOTIFICATION,
    SESSION_UPDATE
}
