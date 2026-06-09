package com.campusskills.modules.users.handlers;

import com.campusskills.modules.users.services.VerificationService;
import com.campusskills.web.response.ApiResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class VerificationHandler {
    private final VerificationService service;

    public VerificationHandler(VerificationService service) {
        this.service = service;
    }

    public void requestVerification(RoutingContext ctx) {
        JsonObject user = ctx.get("user");
        String userId = user.getString("userId");
        
        JsonObject body = ctx.body().asJsonObject();
        if (body == null || !body.containsKey("skillName")) {
            ApiResponse.badRequest(ctx, "skillName is required");
            return;
        }
        
        service.requestVerification(userId, body.getString("skillName"))
            .onSuccess(verification -> ApiResponse.created(ctx, JsonObject.mapFrom(verification)))
            .onFailure(err -> ApiResponse.badRequest(ctx, err.getMessage()));
    }

    public void getMyRequests(RoutingContext ctx) {
        JsonObject user = ctx.get("user");
        String userId = user.getString("userId");
        
        service.getMyRequests(userId)
            .onSuccess(list -> {
                io.vertx.core.json.JsonArray arr = new io.vertx.core.json.JsonArray();
                list.forEach(v -> arr.add(JsonObject.mapFrom(v)));
                ApiResponse.ok(ctx, arr);
            })
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }
}
