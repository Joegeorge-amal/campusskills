package com.campusskills.modules.users.handlers;

import com.campusskills.modules.users.models.User;
import com.campusskills.modules.users.services.VerificationService;
import com.campusskills.web.response.ApiResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class VerificationHandler {
    private final VerificationService service;

    public VerificationHandler(VerificationService service) {
        this.service = service;
    }

    public void getQuestions(RoutingContext ctx) {
        String skill = ctx.pathParam("skill");
        if (skill == null || skill.trim().isEmpty()) {
            ApiResponse.badRequest(ctx, "skill parameter is required");
            return;
        }

        service.getQuestions(skill)
            .onSuccess(questions -> {
                io.vertx.core.json.JsonArray arr = new io.vertx.core.json.JsonArray(questions);
                ApiResponse.ok(ctx, arr);
            })
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }

    public void submitVerification(RoutingContext ctx) {
        User user = ctx.get("user");
        if (user == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }
        String userId = user.getId();
        
        JsonObject body = ctx.body().asJsonObject();
        if (body == null || !body.containsKey("skill")) {
            ApiResponse.badRequest(ctx, "skill is required");
            return;
        }
        
        service.submitVerification(userId, body)
            .onSuccess(verification -> ApiResponse.ok(ctx, JsonObject.mapFrom(verification)))
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }

    public void getMyRequests(RoutingContext ctx) {
        User user = ctx.get("user");
        if (user == null) {
            ApiResponse.forbidden(ctx, "Unauthorized");
            return;
        }
        String userId = user.getId();
        
        service.getMyRequests(userId)
            .onSuccess(list -> {
                io.vertx.core.json.JsonArray arr = new io.vertx.core.json.JsonArray();
                list.forEach(v -> arr.add(JsonObject.mapFrom(v)));
                ApiResponse.ok(ctx, arr);
            })
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }
}
