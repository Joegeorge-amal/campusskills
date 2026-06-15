package com.campusskills.modules.reports.handlers;

import com.campusskills.modules.reports.models.Report;
import com.campusskills.modules.reports.services.ReportService;
import com.campusskills.web.response.ApiResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class ReportHandler {

    private final ReportService service;

    public ReportHandler() {
        this.service = new ReportService();
    }

    public void createReport(RoutingContext ctx) {
        String authId = ctx.get("authenticatedUserId");
        JsonObject body = ctx.body().asJsonObject();

        if (body == null) {
            ApiResponse.badRequest(ctx, "Body is required");
            return;
        }

        Report report = new Report();
        report.setReporterId(authId);
        report.setReportedUserId(body.getString("reportedUserId"));
        report.setSessionId(body.getString("sessionId"));
        report.setReason(body.getString("reason"));
        report.setDescription(body.getString("description"));

        service.createReport(report)
            .onSuccess(id -> ApiResponse.created(ctx, new JsonObject().put("id", id).put("message", "Report submitted successfully")))
            .onFailure(err -> ApiResponse.internalError(ctx, err.getMessage()));
    }
}
