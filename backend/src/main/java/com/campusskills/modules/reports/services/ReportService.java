package com.campusskills.modules.reports.services;

import com.campusskills.modules.reports.models.Report;
import com.campusskills.modules.reports.repositories.ReportRepository;
import io.vertx.core.Future;

public class ReportService {

    private final ReportRepository repository;

    public ReportService() {
        this.repository = new ReportRepository();
    }

    public Future<String> createReport(Report report) {
        if (report.getReporterId() == null || report.getReportedUserId() == null || report.getSessionId() == null) {
            return Future.failedFuture("ReporterId, reportedUserId, and sessionId are required");
        }
        return repository.createReport(report);
    }
}
