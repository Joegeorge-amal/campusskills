package com.campusskills.modules.reports.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.reports.models.Report;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

public class ReportRepository {

    private static final String COLLECTION = "reports";
    private final MongoClient client;

    public ReportRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<String> createReport(Report report) {
        long now = System.currentTimeMillis();
        report.setCreatedAt(now);
        report.setUpdatedAt(now);

        JsonObject document = JsonObject.mapFrom(report);
        document.remove("_id");

        return client.save(COLLECTION, document);
    }
}
