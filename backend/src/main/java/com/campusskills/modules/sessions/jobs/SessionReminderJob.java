package com.campusskills.modules.sessions.jobs;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.messages.repositories.MessageRepository;
import com.campusskills.modules.messages.models.Message;
import com.campusskills.shared.constants.MessageType;
import com.campusskills.modules.sessions.repositories.SessionRepository;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.core.json.JsonArray;
import io.vertx.ext.mongo.MongoClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SessionReminderJob {
    private static final Logger log = LoggerFactory.getLogger(SessionReminderJob.class);

    public void start(Vertx vertx) {
        // Run every minute (60,000 ms)
        long intervalMs = 60 * 1000;
        
        vertx.setPeriodic(intervalMs, id -> {
            log.debug("Running SessionReminderJob...");
            MongoClient client = MongoManager.getClient();
            MessageRepository msgRepo = new MessageRepository();

            long now = System.currentTimeMillis();

            // 1. Check for 30-Minute Reminder
            // scheduledStart - now <= 30 minutes (1800000 ms) AND scheduledStart - now > 0
            // and sent30MinChatReminder != true
            JsonObject query30 = new JsonObject()
                .put("status", "SCHEDULED")
                .put("scheduledStart", new JsonObject()
                    .put("$lte", now + 30 * 60 * 1000)
                    .put("$gt", now))
                .put("sent30MinChatReminder", new JsonObject().put("$ne", true));

            client.find("sessions", query30, res -> {
                if (res.succeeded()) {
                    for (JsonObject sessJson : res.result()) {
                        String sessionId = sessJson.getString("_id");
                        String chatId = sessJson.getString("chatId");
                        String topic = sessJson.getString("topic");
                        Long start = sessJson.getLong("scheduledStart");

                        if (chatId == null || chatId.trim().isEmpty()) continue;

                        log.info("Sending 30-minute reminder for session {}", sessionId);

                        client.updateCollection("sessions", 
                            new JsonObject().put("_id", sessionId), 
                            new JsonObject().put("$set", new JsonObject().put("sent30MinChatReminder", true)),
                            updRes -> {
                                if (updRes.succeeded()) {
                                    Message message = new Message();
                                    message.setChatId(chatId);
                                    message.setSenderId("system");
                                    message.setMessage("Your " + topic + " session with {partner} starts in 30 minutes.\nRemember to join using your preferred platform.");
                                    message.setType(MessageType.SYSTEM);
                                    message.setSessionId(sessionId);
                                    message.setSessionScheduledStart(start);
                                    message.setSessionTopic(topic);
                                    message.setCreatedAt(System.currentTimeMillis());
                                    message.setIsRead(false);
                                    message.setIsDelivered(true);

                                    msgRepo.createMessage(message).onSuccess(msgId -> {
                                        message.setId(msgId);
                                        client.findOne("chats", new JsonObject().put("_id", chatId), null, chatRes -> {
                                            if (chatRes.succeeded() && chatRes.result() != null) {
                                                JsonArray participants = chatRes.result().getJsonArray("participants");
                                                java.util.List<String> participantList = participants.stream()
                                                    .map(Object::toString)
                                                    .collect(java.util.stream.Collectors.toList());
                                                com.campusskills.web.websockets.MessageBroadcaster.broadcastNewMessage(message, participantList);
                                            }
                                        });
                                    });
                                }
                            }
                        );
                    }
                }
            });

            // 2. Check for Session Scheduled Now Reminder
            // now >= scheduledStart and sentStartChatReminder != true
            JsonObject queryStart = new JsonObject()
                .put("status", "SCHEDULED")
                .put("scheduledStart", new JsonObject().put("$lte", now))
                .put("sentStartChatReminder", new JsonObject().put("$ne", true));

            client.find("sessions", queryStart, res -> {
                if (res.succeeded()) {
                    for (JsonObject sessJson : res.result()) {
                        String sessionId = sessJson.getString("_id");
                        String chatId = sessJson.getString("chatId");
                        String topic = sessJson.getString("topic");
                        Long start = sessJson.getLong("scheduledStart");

                        if (chatId == null || chatId.trim().isEmpty()) continue;

                        log.info("Sending start reminder for session {}", sessionId);

                        client.updateCollection("sessions", 
                            new JsonObject().put("_id", sessionId), 
                            new JsonObject().put("$set", new JsonObject().put("sentStartChatReminder", true)),
                            updRes -> {
                                if (updRes.succeeded()) {
                                    Message message = new Message();
                                    message.setChatId(chatId);
                                    message.setSenderId("system");
                                    message.setMessage("Your session is scheduled now.");
                                    message.setType(MessageType.SYSTEM);
                                    message.setSessionId(sessionId);
                                    message.setSessionScheduledStart(start);
                                    message.setSessionTopic(topic);
                                    message.setCreatedAt(System.currentTimeMillis());
                                    message.setIsRead(false);
                                    message.setIsDelivered(true);

                                    msgRepo.createMessage(message).onSuccess(msgId -> {
                                        message.setId(msgId);
                                        client.findOne("chats", new JsonObject().put("_id", chatId), null, chatRes -> {
                                            if (chatRes.succeeded() && chatRes.result() != null) {
                                                JsonArray participants = chatRes.result().getJsonArray("participants");
                                                java.util.List<String> participantList = participants.stream()
                                                    .map(Object::toString)
                                                    .collect(java.util.stream.Collectors.toList());
                                                com.campusskills.web.websockets.MessageBroadcaster.broadcastNewMessage(message, participantList);
                                            }
                                        });
                                    });
                                }
                            }
                        );
                    }
                }
            });
        });
    }
}
