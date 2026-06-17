package com.campusskills.modules.messages.services;

import io.vertx.core.Vertx;
import com.campusskills.modules.messages.repositories.MessageRepository;
import com.campusskills.web.websockets.MessageBroadcaster;
import java.util.concurrent.ConcurrentHashMap;
import java.util.List;
import java.util.stream.Collectors;
import io.vertx.core.json.JsonObject;
import io.vertx.core.json.JsonArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TypingIndicatorService {
    private static final Logger log = LoggerFactory.getLogger(TypingIndicatorService.class);
    private final Vertx vertx;
    private final MessageRepository messageRepository;
    private final ConcurrentHashMap<String, Long> activeTypingTimers = new ConcurrentHashMap<>();
    private static final long TYPING_TIMEOUT_MS = 5000;

    public TypingIndicatorService(Vertx vertx, MessageRepository messageRepository) {
        this.vertx = vertx;
        this.messageRepository = messageRepository;
    }

    public void handleTypingEvent(String typeStr, JsonObject payload) {
        String chatId = payload.getString("chatId");
        String userId = payload.getString("userId");
        
        if (chatId == null || userId == null) return;
        
        String key = chatId + ":" + userId;

        messageRepository.getChatById(chatId).onSuccess(chat -> {
            if (chat == null) return;
            JsonArray participantsArray = chat.getJsonArray("participants");
            if (participantsArray == null || !participantsArray.contains(userId)) {
                log.warn("[TYPING ERROR] Unauthorized typing attempt for chat {} by User {}", chatId, userId);
                return;
            }
            
            List<String> participantList = participantsArray.stream()
                .map(Object::toString)
                .collect(Collectors.toList());
            
            if ("TYPING_STARTED".equals(typeStr)) {
                Long existingTimerId = activeTypingTimers.get(key);
                if (existingTimerId != null) {
                    vertx.cancelTimer(existingTimerId);
                }
                MessageBroadcaster.broadcastTypingEvent("TYPING_STARTED", chatId, userId, participantList);
                
                long newTimerId = vertx.setTimer(TYPING_TIMEOUT_MS, id -> {
                    activeTypingTimers.remove(key);
                    MessageBroadcaster.broadcastTypingEvent("TYPING_STOPPED", chatId, userId, participantList);
                });
                activeTypingTimers.put(key, newTimerId);
            } else if ("TYPING_STOPPED".equals(typeStr)) {
                clearTypingState(chatId, userId, participantList);
            }
        });
    }

    public void clearTypingState(String chatId, String userId, List<String> participantList) {
        String key = chatId + ":" + userId;
        Long existingTimerId = activeTypingTimers.remove(key);
        if (existingTimerId != null) {
            vertx.cancelTimer(existingTimerId);
            MessageBroadcaster.broadcastTypingEvent("TYPING_STOPPED", chatId, userId, participantList);
        }
    }
}
