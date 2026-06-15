package com.campusskills.modules.disputes.handlers;

import com.campusskills.web.response.ApiResponse;
import com.campusskills.modules.disputes.models.CreateDisputeRequest;
import com.campusskills.modules.disputes.services.DisputeService;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class DisputeHandler {

    private final DisputeService disputeService;

    public DisputeHandler(DisputeService disputeService) {
        this.disputeService = disputeService;
    }

    public void createDispute(RoutingContext ctx) {
        JsonObject user = ctx.get("user");
        String userId = user.getString("userId");

        try {
            CreateDisputeRequest req = ctx.getBodyAsJson().mapTo(CreateDisputeRequest.class);
            if (req.getReasonType() == null || req.getDescription() == null || req.getDescription().trim().isEmpty()) {
                ApiResponse.badRequest(ctx, "Reason type and description are required");
                return;
            }

            disputeService.createDispute(userId, req)
                .onSuccess(id -> ApiResponse.created(ctx, new JsonObject().put("id", id).put("message", "Dispute created successfully")))
                .onFailure(err -> {
                    if (err.getMessage().equals("Session not found") || err.getMessage().equals("Unauthorized to dispute this session")) {
                        ApiResponse.badRequest(ctx, err.getMessage());
                    } else {
                        ApiResponse.internalError(ctx, err.getMessage());
                    }
                });
        } catch (Exception e) {
            ApiResponse.badRequest(ctx, "Invalid payload");
        }
    }

    public void getMyDisputes(RoutingContext ctx) {
        JsonObject user = ctx.get("user");
        String userId = user.getString("userId");

        disputeService.getMyDisputes(userId)
            .onSuccess(disputes -> ApiResponse.ok(ctx, disputes))
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }
}
