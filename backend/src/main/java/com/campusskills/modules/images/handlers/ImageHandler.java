package com.campusskills.modules.images.handlers;

import com.campusskills.modules.images.services.CloudinaryService;
import com.campusskills.web.response.ApiResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.util.Map;

public class ImageHandler {

    private final CloudinaryService cloudinaryService;

    public ImageHandler(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    public void getSignature(RoutingContext ctx) {
        String userId = ctx.get("authenticatedUserId");
        if (userId == null) {
            ApiResponse.unauthorized(ctx, "Unauthorized");
            return;
        }

        String type = ctx.request().getParam("type");
        if (type == null || (!type.equals("avatar") && !type.equals("banner"))) {
            ApiResponse.badRequest(ctx, "Invalid or missing image type. Must be 'avatar' or 'banner'");
            return;
        }

        Map<String, Object> signatureData = cloudinaryService.generateUploadSignature(userId, type);
        
        if (signatureData == null) {
            ApiResponse.internalError(ctx, "Failed to generate upload signature");
            return;
        }

        ApiResponse.ok(ctx, new JsonObject(signatureData));
    }
}
