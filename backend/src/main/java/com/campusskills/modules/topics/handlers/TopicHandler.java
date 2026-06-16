package com.campusskills.modules.topics.handlers;

import com.campusskills.modules.topics.services.TopicService;
import com.campusskills.web.response.ApiResponse;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TopicHandler {

    private static final Logger log = LoggerFactory.getLogger(TopicHandler.class);
    private final TopicService topicService;

    public TopicHandler(TopicService topicService) {
        this.topicService = topicService;
    }

    public void getAllTopics(RoutingContext ctx) {
        String category = ctx.request().getParam("category");
        String q = ctx.request().getParam("q");
        topicService.getAllTopics(category, q)
                .onSuccess(data -> ApiResponse.ok(ctx, data))
                .onFailure(err -> {
                    log.error("Failed to get topics", err);
                    ctx.fail(err);
                });
    }

    public void getTopicById(RoutingContext ctx) {
        String id = ctx.pathParam("id");
        topicService.getTopicById(id)
                .onSuccess(data -> ApiResponse.ok(ctx, data))
                .onFailure(err -> {
                    if ("TOPIC_NOT_FOUND".equals(err.getMessage())) {
                        ApiResponse.notFound(ctx, "Topic not found");
                    } else {
                        log.error("Failed to get topic by id: {}", id, err);
                        ctx.fail(err);
                    }
                });
    }
}
