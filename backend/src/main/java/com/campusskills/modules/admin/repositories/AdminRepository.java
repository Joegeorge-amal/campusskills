package com.campusskills.modules.admin.repositories;

import com.campusskills.core.database.MongoManager;
import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.FindOptions;
import io.vertx.ext.mongo.MongoClient;

import java.util.List;

public class AdminRepository {

    private final MongoClient client;

    public AdminRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<JsonObject> searchUsers(String q, String status, int page, int limit) {
        int skip = (page - 1) * limit;

        JsonArray pipeline = new JsonArray();
        
        // 1. Initial Match (if status is provided, plus exclude ADMIN users)
        JsonObject matchStage = new JsonObject();
        matchStage.put("role", new JsonObject().put("$ne", "ADMIN"));
        
        if (status != null && !status.trim().isEmpty()) {
            matchStage.put("isActive", "ACTIVE".equalsIgnoreCase(status.trim()));
        }
        
        pipeline.add(new JsonObject().put("$match", matchStage));

        // Create string version of _id for lookups since other collections store userId as string
        pipeline.add(new JsonObject().put("$addFields", new JsonObject()
            .put("userIdStr", new JsonObject().put("$toString", "$_id"))
        ));

        // 2. Lookup user_profiles
        pipeline.add(new JsonObject().put("$lookup", new JsonObject()
            .put("from", "user_profiles")
            .put("localField", "userIdStr")
            .put("foreignField", "userId")
            .put("as", "profile")
        ));
        pipeline.add(new JsonObject().put("$unwind", new JsonObject()
            .put("path", "$profile")
            .put("preserveNullAndEmptyArrays", true)
        ));

        // 3. Lookup user_stats
        pipeline.add(new JsonObject().put("$lookup", new JsonObject()
            .put("from", "user_stats")
            .put("localField", "userIdStr")
            .put("foreignField", "_id")
            .put("as", "stats")
        ));
        pipeline.add(new JsonObject().put("$unwind", new JsonObject()
            .put("path", "$stats")
            .put("preserveNullAndEmptyArrays", true)
        ));

        // 4. Text/Regex Search match (if q is provided)
        if (q != null && !q.trim().isEmpty()) {
            JsonObject regex = new JsonObject().put("$regex", q.trim()).put("$options", "i");
            JsonArray orConditions = new JsonArray()
                .add(new JsonObject().put("email", regex))
                .add(new JsonObject().put("profile.name", regex));
            pipeline.add(new JsonObject().put("$match", new JsonObject().put("$or", orConditions)));
        }

        // We need the total count for pagination, but doing it inside the same query is complex with aggregate.
        // Instead, we use $facet to get metadata (totalCount) and the data itself.
        JsonArray dataFacet = new JsonArray()
            .add(new JsonObject().put("$sort", new JsonObject().put("createdAt", -1)))
            .add(new JsonObject().put("$skip", skip))
            .add(new JsonObject().put("$limit", limit));

        JsonArray countFacet = new JsonArray()
            .add(new JsonObject().put("$count", "total"));

        pipeline.add(new JsonObject().put("$facet", new JsonObject()
            .put("data", dataFacet)
            .put("metadata", countFacet)
        ));

        io.vertx.ext.mongo.AggregateOptions options = new io.vertx.ext.mongo.AggregateOptions();
        return client.aggregateWithOptions("users", pipeline, options)
            .collect(java.util.stream.Collectors.toList())
            .map(results -> {
                if (results.isEmpty()) {
                    return new JsonObject()
                        .put("data", new JsonArray())
                        .put("pagination", new JsonObject().put("total", 0).put("page", page).put("limit", limit).put("totalPages", 0));
                }

                JsonObject result = results.get(0);
                JsonArray data = result.getJsonArray("data", new JsonArray());
                JsonArray metadata = result.getJsonArray("metadata", new JsonArray());
                
                long total = metadata.isEmpty() ? 0 : metadata.getJsonObject(0).getInteger("total", 0);
                int totalPages = (int) Math.ceil((double) total / limit);

                // Format the output to match frontend expectations
                JsonArray formattedData = new JsonArray();
                for (int i = 0; i < data.size(); i++) {
                    JsonObject user = data.getJsonObject(i);
                    JsonObject profile = user.getJsonObject("profile", new JsonObject());
                    JsonObject stats = user.getJsonObject("stats", new JsonObject());

                    int sessionsCompleted = stats.getInteger("sessionsCompleted", 0);
                    int sessionsAttended = stats.getInteger("sessionsAttended", 0);
                    
                    // Mock trust score based on attendance
                    int trustScore = 100;
                    if (sessionsCompleted > 0) {
                        trustScore = (int) Math.round((double) sessionsAttended / sessionsCompleted * 100);
                    }

                    String prog = profile.getString("programme");
                    String yr = profile.getString("year");
                    String courseStr = "";
                    if (prog != null && !prog.equals("null") && !prog.trim().isEmpty()) courseStr += prog.trim();
                    if (yr != null && !yr.equals("null") && !yr.trim().isEmpty()) courseStr += (courseStr.isEmpty() ? "" : " ") + yr.trim();

                    formattedData.add(new JsonObject()
                        .put("id", user.getString("_id"))
                        .put("email", user.getString("email"))
                        .put("role", user.getString("role"))
                        .put("status", user.getBoolean("isActive", true) ? "ACTIVE" : "SUSPENDED")
                        .put("createdAt", user.getLong("createdAt"))
                        .put("displayName", profile.getString("name", "Unknown User"))
                        .put("avatar", profile.getString("profilePicture"))
                        .put("course", courseStr.isEmpty() ? null : courseStr)
                        .put("sessionCount", sessionsCompleted)
                        .put("trustScore", trustScore)
                    );
                }

                return new JsonObject()
                    .put("data", formattedData)
                    .put("pagination", new JsonObject()
                        .put("total", total)
                        .put("page", page)
                        .put("limit", limit)
                        .put("totalPages", totalPages)
                    );
            });
    }

    public Future<JsonObject> searchDisputes(String q, String status, int page, int limit) {
        int skip = (page - 1) * limit;

        JsonArray pipeline = new JsonArray();

        // 1. Initial Match (dispute statuses + optional filter)
        JsonObject matchStage = new JsonObject();
        if (status != null && !status.trim().isEmpty()) {
            matchStage.put("status", status.trim());
        }

        if (q != null && !q.trim().isEmpty()) {
            matchStage.put("$text", new JsonObject().put("$search", q.trim()));
        }

        if (!matchStage.isEmpty()) {
            pipeline.add(new JsonObject().put("$match", matchStage));
        }

        // 2. Lookup sessions
        pipeline.add(new JsonObject().put("$lookup", new JsonObject()
            .put("from", "sessions")
            .put("localField", "sessionId")
            .put("foreignField", "_id")
            .put("as", "sessionDetails")
        ));
        
        // 3. Lookup user profiles for reporter
        pipeline.add(new JsonObject().put("$lookup", new JsonObject()
            .put("from", "user_profiles")
            .put("localField", "reporterId")
            .put("foreignField", "userId")
            .put("as", "reporterProfile")
        ));
        
        // 4. Lookup user profiles for reported
        pipeline.add(new JsonObject().put("$lookup", new JsonObject()
            .put("from", "user_profiles")
            .put("localField", "reportedId")
            .put("foreignField", "userId")
            .put("as", "reportedProfile")
        ));

        // 5. Facet for pagination
        JsonArray dataFacet = new JsonArray()
            .add(new JsonObject().put("$sort", new JsonObject().put("createdAt", -1)))
            .add(new JsonObject().put("$skip", skip))
            .add(new JsonObject().put("$limit", limit));

        JsonArray countFacet = new JsonArray()
            .add(new JsonObject().put("$count", "total"));

        pipeline.add(new JsonObject().put("$facet", new JsonObject()
            .put("data", dataFacet)
            .put("metadata", countFacet)
        ));

        io.vertx.ext.mongo.AggregateOptions options = new io.vertx.ext.mongo.AggregateOptions();
        return client.aggregateWithOptions("disputes", pipeline, options)
            .collect(java.util.stream.Collectors.toList())
            .map(results -> {
                if (results.isEmpty()) {
                    return new JsonObject()
                        .put("data", new JsonArray())
                        .put("pagination", new JsonObject().put("total", 0).put("page", page).put("limit", limit).put("totalPages", 0));
                }

                JsonObject result = results.get(0);
                JsonArray data = result.getJsonArray("data", new JsonArray());
                JsonArray metadata = result.getJsonArray("metadata", new JsonArray());
                
                long total = metadata.isEmpty() ? 0 : metadata.getJsonObject(0).getInteger("total", 0);
                int totalPages = (int) Math.ceil((double) total / limit);

                JsonArray formattedData = new JsonArray();
                for (int i = 0; i < data.size(); i++) {
                    JsonObject d = data.getJsonObject(i);
                    JsonArray repProfiles = d.getJsonArray("reporterProfile", new JsonArray());
                    JsonArray rptProfiles = d.getJsonArray("reportedProfile", new JsonArray());
                    JsonArray sessArr = d.getJsonArray("sessionDetails", new JsonArray());
                    
                    String participant1Name = repProfiles.isEmpty() ? "Unknown" : repProfiles.getJsonObject(0).getString("name", "Unknown");
                    String participant2Name = rptProfiles.isEmpty() ? "Unknown" : rptProfiles.getJsonObject(0).getString("name", "Unknown");
                    JsonObject sess = sessArr.isEmpty() ? new JsonObject() : sessArr.getJsonObject(0);

                    formattedData.add(new JsonObject()
                        .put("id", d.getString("_id"))
                        .put("status", d.getString("status"))
                        .put("participants", participant1Name + " vs " + participant2Name)
                        .put("reason", d.getString("reasonType", "Unknown Reason"))
                        .put("amount", sess.getDouble("price", 0.0))
                        .put("currency", sess.getString("currency", "INR"))
                        .put("updatedAt", d.getLong("updatedAt"))
                        .put("createdAt", d.getLong("createdAt"))
                    );
                }

                return new JsonObject()
                    .put("data", formattedData)
                    .put("pagination", new JsonObject()
                        .put("total", total)
                        .put("page", page)
                        .put("limit", limit)
                        .put("totalPages", totalPages)
                    );
            });
    }

    public Future<JsonObject> searchReports(String q, String status, int page, int limit) {
        int skip = (page - 1) * limit;

        JsonArray pipeline = new JsonArray();

        // 1. Initial Match (report statuses + optional filter)
        JsonObject matchStage = new JsonObject();
        if (status != null && !status.trim().isEmpty()) {
            matchStage.put("status", status.trim());
        }

        if (q != null && !q.trim().isEmpty()) {
            matchStage.put("reason", new JsonObject().put("$regex", q.trim()).put("$options", "i"));
        }

        if (!matchStage.isEmpty()) {
            pipeline.add(new JsonObject().put("$match", matchStage));
        }

        // 2. Lookup user profiles for reporter
        pipeline.add(new JsonObject().put("$lookup", new JsonObject()
            .put("from", "user_profiles")
            .put("localField", "reporterId")
            .put("foreignField", "userId")
            .put("as", "reporterProfile")
        ));
        
        // 3. Lookup user profiles for reported
        pipeline.add(new JsonObject().put("$lookup", new JsonObject()
            .put("from", "user_profiles")
            .put("localField", "reportedUserId")
            .put("foreignField", "userId")
            .put("as", "reportedProfile")
        ));

        // 4. Facet for pagination
        JsonArray dataFacet = new JsonArray()
            .add(new JsonObject().put("$sort", new JsonObject().put("createdAt", -1)))
            .add(new JsonObject().put("$skip", skip))
            .add(new JsonObject().put("$limit", limit));

        JsonArray countFacet = new JsonArray()
            .add(new JsonObject().put("$count", "total"));

        pipeline.add(new JsonObject().put("$facet", new JsonObject()
            .put("data", dataFacet)
            .put("metadata", countFacet)
        ));

        io.vertx.ext.mongo.AggregateOptions options = new io.vertx.ext.mongo.AggregateOptions();
        return client.aggregateWithOptions("reports", pipeline, options)
            .collect(java.util.stream.Collectors.toList())
            .map(results -> {
                if (results.isEmpty()) {
                    return new JsonObject()
                        .put("data", new JsonArray())
                        .put("pagination", new JsonObject().put("total", 0).put("page", page).put("limit", limit).put("totalPages", 0));
                }

                JsonObject result = results.get(0);
                JsonArray data = result.getJsonArray("data", new JsonArray());
                JsonArray metadata = result.getJsonArray("metadata", new JsonArray());
                
                long total = metadata.isEmpty() ? 0 : metadata.getJsonObject(0).getInteger("total", 0);
                int totalPages = (int) Math.ceil((double) total / limit);

                JsonArray formattedData = new JsonArray();
                for (int i = 0; i < data.size(); i++) {
                    JsonObject d = data.getJsonObject(i);
                    JsonArray repProfiles = d.getJsonArray("reporterProfile", new JsonArray());
                    JsonArray rptProfiles = d.getJsonArray("reportedProfile", new JsonArray());
                    
                    String reporterName = repProfiles.isEmpty() ? "Unknown" : repProfiles.getJsonObject(0).getString("name", "Unknown");
                    String reportedName = rptProfiles.isEmpty() ? "Unknown" : rptProfiles.getJsonObject(0).getString("name", "Unknown");

                    formattedData.add(new JsonObject()
                        .put("id", d.getString("_id"))
                        .put("status", d.getString("status", "OPEN"))
                        .put("reporterId", d.getString("reporterId"))
                        .put("reporterName", reporterName)
                        .put("reportedUserId", d.getString("reportedUserId"))
                        .put("reportedName", reportedName)
                        .put("sessionId", d.getString("sessionId"))
                        .put("reason", d.getString("reason", "Unknown Reason"))
                        .put("details", d.getString("details", ""))
                        .put("adminNotes", d.getString("adminNotes", ""))
                        .put("updatedAt", d.getLong("updatedAt"))
                        .put("createdAt", d.getLong("createdAt"))
                    );
                }

                return new JsonObject()
                    .put("data", formattedData)
                    .put("pagination", new JsonObject()
                        .put("total", total)
                        .put("page", page)
                        .put("limit", limit)
                        .put("totalPages", totalPages)
                    );
            });
    }

    public Future<Boolean> updateReportStatus(String reportId, String status, String adminNotes) {
        JsonObject query = new JsonObject().put("_id", reportId);
        JsonObject setFields = new JsonObject()
            .put("status", status)
            .put("updatedAt", System.currentTimeMillis());
            
        if (adminNotes != null && !adminNotes.trim().isEmpty()) {
            setFields.put("adminNotes", adminNotes);
        }
        
        JsonObject update = new JsonObject().put("$set", setFields);
        return client.updateCollection("reports", query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<JsonObject> searchSessions(String q, String status, int page, int limit) {
        int skip = (page - 1) * limit;

        JsonArray pipeline = new JsonArray();

        // 1. Initial Match (status filter)
        JsonObject matchStage = new JsonObject();
        if (status != null && !status.trim().isEmpty()) {
            matchStage.put("status", status.trim());
        }

        if (q != null && !q.trim().isEmpty()) {
            // regex search on topic instead of text index
            matchStage.put("topic", new JsonObject().put("$regex", q.trim()).put("$options", "i"));
        }

        if (!matchStage.isEmpty()) {
            pipeline.add(new JsonObject().put("$match", matchStage));
        }

        // 2. Lookup teacher profile
        pipeline.add(new JsonObject().put("$lookup", new JsonObject()
            .put("from", "user_profiles")
            .put("localField", "teacherId")
            .put("foreignField", "userId")
            .put("as", "teacherProfile")
        ));
        
        // 3. Lookup student profile
        pipeline.add(new JsonObject().put("$lookup", new JsonObject()
            .put("from", "user_profiles")
            .put("localField", "studentId")
            .put("foreignField", "userId")
            .put("as", "studentProfile")
        ));

        // 4. Facet for pagination
        JsonArray dataFacet = new JsonArray()
            .add(new JsonObject().put("$sort", new JsonObject().put("scheduledStart", 1))) // Ascending order to show upcoming next
            .add(new JsonObject().put("$skip", skip))
            .add(new JsonObject().put("$limit", limit));

        JsonArray countFacet = new JsonArray()
            .add(new JsonObject().put("$count", "total"));

        pipeline.add(new JsonObject().put("$facet", new JsonObject()
            .put("data", dataFacet)
            .put("metadata", countFacet)
        ));

        io.vertx.ext.mongo.AggregateOptions options = new io.vertx.ext.mongo.AggregateOptions();
        return client.aggregateWithOptions("sessions", pipeline, options)
            .collect(java.util.stream.Collectors.toList())
            .map(results -> {
                if (results.isEmpty()) {
                    return new JsonObject()
                        .put("data", new JsonArray())
                        .put("pagination", new JsonObject().put("total", 0).put("page", page).put("limit", limit).put("totalPages", 0));
                }

                JsonObject result = results.get(0);
                JsonArray data = result.getJsonArray("data", new JsonArray());
                JsonArray metadata = result.getJsonArray("metadata", new JsonArray());
                
                long total = metadata.isEmpty() ? 0 : metadata.getJsonObject(0).getInteger("total", 0);
                int totalPages = (int) Math.ceil((double) total / limit);

                JsonArray formattedData = new JsonArray();
                for (int i = 0; i < data.size(); i++) {
                    JsonObject session = data.getJsonObject(i);
                    JsonArray teacherArr = session.getJsonArray("teacherProfile", new JsonArray());
                    JsonArray studentArr = session.getJsonArray("studentProfile", new JsonArray());
                    
                    String teacherName = teacherArr.isEmpty() ? "Unknown Tutor" : teacherArr.getJsonObject(0).getString("name", "Unknown Tutor");
                    String studentName = studentArr.isEmpty() ? "Unknown Learner" : studentArr.getJsonObject(0).getString("name", "Unknown Learner");

                    formattedData.add(new JsonObject()
                        .put("id", session.getString("_id"))
                        .put("status", session.getString("status"))
                        .put("title", session.getString("topic", "Untitled Session"))
                        .put("tutor", teacherName)
                        .put("learner", studentName)
                        .put("mode", session.getString("meetingPlatform", "Online"))
                        .put("price", 0.0)
                        .put("currency", "INR")
                        .put("scheduledAt", session.getLong("scheduledStart"))
                    );
                }

                return new JsonObject()
                    .put("data", formattedData)
                    .put("pagination", new JsonObject()
                        .put("total", total)
                        .put("page", page)
                        .put("limit", limit)
                        .put("totalPages", totalPages)
                    );
            });
    }

    public Future<Boolean> updateUserStatus(String userId, boolean isActive) {
        JsonObject query = new JsonObject().put("_id", userId);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("isActive", isActive)
            .put("updatedAt", System.currentTimeMillis()));
        return client.updateCollection("users", query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<Boolean> updateDisputeStatus(String disputeId, String status, String adminNotes) {
        JsonObject query = new JsonObject().put("_id", disputeId);
        JsonObject setFields = new JsonObject()
            .put("status", status)
            .put("updatedAt", System.currentTimeMillis());
            
        if (adminNotes != null && !adminNotes.trim().isEmpty()) {
            setFields.put("adminNotes", adminNotes);
        }
        
        JsonObject update = new JsonObject().put("$set", setFields);
        return client.updateCollection("disputes", query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<Boolean> cancelSession(String sessionId) {
        JsonObject query = new JsonObject().put("_id", sessionId);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("status", "CANCELLED")
            .put("cancelledBy", "admin")
            .put("cancellationReason", "Cancelled by Admin")
            .put("updatedAt", System.currentTimeMillis()));
        return client.updateCollection("sessions", query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<JsonObject> searchListings(String q, String status, int page, int limit) {
        int skip = (page - 1) * limit;
        JsonArray pipeline = new JsonArray();

        // 1. Initial Match
        JsonObject matchStage = new JsonObject();
        if (status != null && !status.trim().isEmpty()) {
            String s = status.trim().toUpperCase();
            if (s.equals("ACTIVE")) {
                matchStage.put("$or", new JsonArray()
                    .add(new JsonObject().put("status", "ACTIVE"))
                    .add(new JsonObject().put("status", new JsonObject().put("$exists", false))));
                matchStage.put("active", new JsonObject().put("$ne", false));
            } else if (s.equals("ADMIN_DISABLED")) {
                matchStage.put("$or", new JsonArray()
                    .add(new JsonObject().put("status", "ADMIN_DISABLED"))
                    .add(new JsonObject().put("active", false)));
            } else {
                matchStage.put("status", s);
            }
        }
        if (!matchStage.isEmpty()) {
            pipeline.add(new JsonObject().put("$match", matchStage));
        }

        // 2. Lookup owner details
        pipeline.add(new JsonObject().put("$lookup", new JsonObject()
            .put("from", "user_profiles")
            .put("localField", "ownerId")
            .put("foreignField", "userId")
            .put("as", "owner")
        ));
        pipeline.add(new JsonObject().put("$unwind", new JsonObject()
            .put("path", "$owner")
            .put("preserveNullAndEmptyArrays", true)
        ));

        // 3. Search
        if (q != null && !q.trim().isEmpty()) {
            JsonObject regex = new JsonObject().put("$regex", q.trim()).put("$options", "i");
            JsonArray orConditions = new JsonArray()
                .add(new JsonObject().put("title", regex))
                .add(new JsonObject().put("description", regex))
                .add(new JsonObject().put("category", regex))
                .add(new JsonObject().put("owner.name", regex));
            pipeline.add(new JsonObject().put("$match", new JsonObject().put("$or", orConditions)));
        }

        // 4. Facet for count/data
        JsonArray dataFacet = new JsonArray()
            .add(new JsonObject().put("$sort", new JsonObject().put("createdAt", -1)))
            .add(new JsonObject().put("$skip", skip))
            .add(new JsonObject().put("$limit", limit));

        JsonArray countFacet = new JsonArray()
            .add(new JsonObject().put("$count", "total"));

        pipeline.add(new JsonObject().put("$facet", new JsonObject()
            .put("data", dataFacet)
            .put("metadata", countFacet)
        ));

        io.vertx.ext.mongo.AggregateOptions options = new io.vertx.ext.mongo.AggregateOptions();
        return client.aggregateWithOptions("skill_listings", pipeline, options)
            .collect(java.util.stream.Collectors.toList())
            .map(results -> {
                if (results.isEmpty()) {
                    return new JsonObject()
                        .put("data", new JsonArray())
                        .put("pagination", new JsonObject().put("total", 0).put("page", page).put("limit", limit).put("totalPages", 0));
                }
                JsonObject result = results.get(0);
                JsonArray data = result.getJsonArray("data", new JsonArray());
                JsonArray metadata = result.getJsonArray("metadata", new JsonArray());
                long total = metadata.isEmpty() ? 0 : metadata.getJsonObject(0).getInteger("total", 0);
                int totalPages = (int) Math.ceil((double) total / limit);

                JsonArray formattedData = new JsonArray();
                for (int i = 0; i < data.size(); i++) {
                    JsonObject listing = data.getJsonObject(i);
                    JsonObject owner = listing.getJsonObject("owner");
                    if (owner == null) {
                        owner = new JsonObject();
                    }

                    formattedData.add(new JsonObject()
                        .put("id", listing.getString("_id"))
                        .put("title", listing.getString("title"))
                        .put("category", listing.getString("category"))
                        .put("status", listing.getString("status", "ACTIVE"))
                        .put("active", listing.getBoolean("active", true))
                        .put("createdAt", listing.getLong("createdAt"))
                        .put("ownerName", owner.getString("name", "Unknown"))
                        .put("ownerId", listing.getString("ownerId"))
                    );
                }

                return new JsonObject()
                    .put("data", formattedData)
                    .put("pagination", new JsonObject().put("total", total).put("page", page).put("limit", limit).put("totalPages", totalPages));
            });
    }

    public Future<Boolean> updateListingStatus(String id, String status) {
        JsonObject query = new JsonObject().put("_id", id);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("status", status)
            .put("updatedAt", System.currentTimeMillis()));
        return client.updateCollection("skill_listings", query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<JsonObject> getOverviewStats() {
        Future<Long> studentsCount = client.count("users", new JsonObject().put("role", "USER"));
        Future<Long> sessionsCount = client.count("sessions", new JsonObject().put("status", new JsonObject().put("$in", new JsonArray().add("ACCEPTED").add("IN_PROGRESS"))));
        Future<Long> disputesCount = client.count("disputes", new JsonObject().put("status", "OPEN"));
        
        JsonArray revenuePipeline = new JsonArray()
            .add(new JsonObject().put("$match", new JsonObject().put("status", "COMPLETED")))
            .add(new JsonObject().put("$lookup", new JsonObject()
                .put("from", "skill_listings")
                .put("let", new JsonObject().put("lId", "$listingId"))
                .put("pipeline", new JsonArray().add(new JsonObject().put("$match", new JsonObject().put("$expr", new JsonObject().put("$eq", new JsonArray().add(new JsonObject().put("$toString", "$_id")).add("$$lId"))))))
                .put("as", "listing")
            ))
            .add(new JsonObject().put("$unwind", new JsonObject().put("path", "$listing").put("preserveNullAndEmptyArrays", true)))
            .add(new JsonObject().put("$project", new JsonObject()
                .put("price", new JsonObject().put("$ifNull", new JsonArray().add("$listing.price").add(0)))
                .put("durationHours", new JsonObject().put("$divide", new JsonArray()
                    .add(new JsonObject().put("$subtract", new JsonArray().add("$scheduledEnd").add("$scheduledStart")))
                    .add(3600000)
                ))
            ))
            .add(new JsonObject().put("$group", new JsonObject()
                .put("_id", null)
                .put("total", new JsonObject().put("$sum", new JsonObject().put("$multiply", new JsonArray().add("$price").add("$durationHours"))))
            ));
            
        Future<Long> revenueFuture = client.aggregateWithOptions("sessions", revenuePipeline, new io.vertx.ext.mongo.AggregateOptions()).collect(java.util.stream.Collectors.toList())
            .map(results -> {
                if (results.isEmpty()) return 0L;
                return results.get(0).getDouble("total", 0.0).longValue();
            });

        return io.vertx.core.CompositeFuture.all(studentsCount, sessionsCount, disputesCount, revenueFuture)
            .map(cf -> {
                return new JsonObject()
                    .put("totalStudents", new JsonObject().put("value", (Long) cf.resultAt(0)).put("trend", "+0 this week").put("isPositive", true))
                    .put("activeSessions", new JsonObject().put("value", (Long) cf.resultAt(1)).put("trend", "+0 today").put("isPositive", true))
                    .put("openDisputes", new JsonObject().put("value", (Long) cf.resultAt(2)).put("trend", "0 resolved today").put("isPositive", false))
                    .put("revenue", new JsonObject().put("value", (Long) cf.resultAt(3)).put("trend", "Estimated").put("isPositive", true))
                    .put("estimatedRevenue", true); 
            });
    }

    public Future<JsonArray> getRecentRegistrations() {
        JsonArray pipeline = new JsonArray()
            .add(new JsonObject().put("$sort", new JsonObject().put("createdAt", -1)))
            .add(new JsonObject().put("$limit", 5))
            .add(new JsonObject().put("$lookup", new JsonObject()
                .put("from", "users")
                .put("localField", "userId")
                .put("foreignField", "_id")
                .put("as", "userAccount")
            ))
            .add(new JsonObject().put("$unwind", new JsonObject()
                .put("path", "$userAccount")
                .put("preserveNullAndEmptyArrays", true)
            ));

        return client.aggregateWithOptions("user_profiles", pipeline, new io.vertx.ext.mongo.AggregateOptions()).collect(java.util.stream.Collectors.toList())
            .map(results -> {
                JsonArray arr = new JsonArray();
                for (JsonObject u : results) {
                    String name = u.getString("name", "Unknown");
                    String programme = u.getString("programme", null);
                    String year = u.getString("year", null);

                    String info = "";
                    if (programme != null && !programme.isEmpty()) {
                        info = programme;
                        if (year != null && !year.isEmpty()) {
                            info += " · " + year;
                        }
                    } else {
                        info = "New User";
                    }

                    // Get the actual role from the users collection
                    JsonObject userAccount = u.getJsonObject("userAccount");
                    String role = "Student";
                    if (userAccount != null) {
                        String rawRole = userAccount.getString("role", "USER");
                        if ("ADMIN".equalsIgnoreCase(rawRole) || "SUPER_ADMIN".equalsIgnoreCase(rawRole)) {
                            role = "Admin";
                        }
                    }

                    // Check if user has any listings (tutor indicator)
                    boolean hasListings = u.containsKey("skillsOffered") && u.getJsonArray("skillsOffered") != null && !u.getJsonArray("skillsOffered").isEmpty();
                    if (hasListings && "Student".equals(role)) {
                        role = "Tutor";
                    }

                    long diff = System.currentTimeMillis() - u.getLong("createdAt", System.currentTimeMillis());
                    long mins = diff / 60000;
                    long hrs = mins / 60;
                    long days = hrs / 24;
                    String timeStr = mins < 60 ? mins + "m ago" : (hrs < 24 ? hrs + "h ago" : days + "d ago");

                    arr.add(new JsonObject()
                        .put("id", u.getString("userId"))
                        .put("name", name)
                        .put("initial", name.isEmpty() ? "U" : name.substring(0, 1).toUpperCase())
                        .put("info", info)
                        .put("role", role)
                        .put("time", timeStr)
                    );
                }
                return arr;
            });
    }

    public Future<Long> getWeeklyRegistrationCount() {
        long oneWeekAgo = System.currentTimeMillis() - (7L * 24 * 60 * 60 * 1000);
        JsonObject query = new JsonObject().put("createdAt", new JsonObject().put("$gte", oneWeekAgo));
        return client.count("user_profiles", query);
    }

    public Future<JsonArray> getPendingDisputes() {
        JsonObject query = new JsonObject().put("status", "OPEN");
        FindOptions options = new FindOptions().setSort(new JsonObject().put("createdAt", -1)).setLimit(3);
        return client.findWithOptions("disputes", query, options).map(disputes -> {
            JsonArray arr = new JsonArray();
            for(JsonObject d : disputes) {
                Long createdAt = d.getLong("createdAt", System.currentTimeMillis());
                java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("MMM d, yyyy");
                String dateStr = "Filed " + sdf.format(new java.util.Date(createdAt));
                
                arr.add(new JsonObject()
                    .put("id", d.getString("_id"))
                    .put("parties", d.getString("studentId", "Student") + " vs " + d.getString("teacherId", "Tutor"))
                    .put("reason", d.getString("reason", "No reason provided"))
                    .put("date", dateStr)
                    .put("amount", d.getLong("amount", 0L))
                    .put("status", "open")
                );
            }
            return arr;
        });
    }

    public Future<JsonObject> getCategoryPerformance() {
        JsonArray pipeline = new JsonArray()
            .add(new JsonObject().put("$lookup", new JsonObject()
                .put("from", "skill_listings")
                .put("let", new JsonObject().put("lId", "$listingId"))
                .put("pipeline", new JsonArray().add(new JsonObject().put("$match", new JsonObject().put("$expr", new JsonObject().put("$eq", new JsonArray().add(new JsonObject().put("$toString", "$_id")).add("$$lId"))))))
                .put("as", "listing")
            ))
            .add(new JsonObject().put("$unwind", new JsonObject()
                .put("path", "$listing")
                .put("preserveNullAndEmptyArrays", false)
            ))
            .add(new JsonObject().put("$group", new JsonObject()
                .put("_id", "$listing.category")
                .put("sessions", new JsonObject().put("$sum", 1))
            ))
            .add(new JsonObject().put("$sort", new JsonObject().put("sessions", -1)))
            .add(new JsonObject().put("$limit", 5));
            
        Future<List<JsonObject>> catStatsFut = client.aggregateWithOptions("sessions", pipeline, new io.vertx.ext.mongo.AggregateOptions()).collect(java.util.stream.Collectors.toList());
        
        java.util.Set<String> onlineUserIds = com.campusskills.web.websockets.ConnectionManager.getOnlineUserIds();
        Future<Long> activeTutorsFut;
        if (onlineUserIds == null || onlineUserIds.isEmpty()) {
            activeTutorsFut = Future.succeededFuture(0L);
        } else {
            JsonArray onlineIdsArray = new JsonArray(new java.util.ArrayList<>(onlineUserIds));
            JsonArray tutorsPipeline = new JsonArray()
                .add(new JsonObject().put("$match", new JsonObject()
                    .put("status", "ACTIVE")
                    .put("ownerId", new JsonObject().put("$in", onlineIdsArray))
                ))
                .add(new JsonObject().put("$group", new JsonObject().put("_id", "$ownerId")));
            
            activeTutorsFut = client.aggregateWithOptions("skill_listings", tutorsPipeline, new io.vertx.ext.mongo.AggregateOptions()).collect(java.util.stream.Collectors.toList())
                .map(results -> (long) results.size());
        }
            
        JsonArray reviewsPipeline = new JsonArray()
            .add(new JsonObject().put("$group", new JsonObject()
                .put("_id", null)
                .put("avg", new JsonObject().put("$avg", "$rating"))
            ));
            
        Future<Double> avgRatingFut = client.aggregateWithOptions("reviews", reviewsPipeline, new io.vertx.ext.mongo.AggregateOptions()).collect(java.util.stream.Collectors.toList())
            .map(results -> {
                if (results.isEmpty()) return 0.0;
                return results.get(0).getDouble("avg", 0.0);
            });

        return io.vertx.core.CompositeFuture.all(catStatsFut, activeTutorsFut, avgRatingFut)
            .map(cf -> {
                List<JsonObject> results = cf.resultAt(0);
                Long activeTutors = cf.resultAt(1);
                Double avgRating = cf.resultAt(2);
                
                JsonArray categories = new JsonArray();
                int totalSessions = 0;
                String[] colors = {"#3b82f6", "#1e3a8a", "#60a5fa", "#ef4444", "#9ca3af"};
                for (int i = 0; i < results.size(); i++) {
                    JsonObject r = results.get(i);
                    String name = r.getString("_id");
                    if (name == null || name.isEmpty()) name = "Uncategorized";
                    int sessions = r.getInteger("sessions", 0);
                    totalSessions += sessions;
                    categories.add(new JsonObject()
                        .put("name", name)
                        .put("sessions", sessions)
                        .put("rating", 0.0) 
                        .put("status", "Stable")
                        .put("fill", Math.min(100, sessions * 15)) 
                        .put("color", colors[i % colors.length])
                    );
                }
                double roundedRating = Math.round(avgRating * 10.0) / 10.0;
                return new JsonObject()
                    .put("totalSessions", totalSessions)
                    .put("activeTutors", activeTutors) 
                    .put("avgRating", roundedRating)
                    .put("categories", categories);
            });
    }

    public Future<JsonArray> getTopTutors() {
        JsonArray pipeline = new JsonArray()
            .add(new JsonObject().put("$match", new JsonObject().put("status", "COMPLETED")))
            .add(new JsonObject().put("$lookup", new JsonObject()
                .put("from", "skill_listings")
                .put("let", new JsonObject().put("lId", "$listingId"))
                .put("pipeline", new JsonArray().add(new JsonObject().put("$match", new JsonObject().put("$expr", new JsonObject().put("$eq", new JsonArray().add(new JsonObject().put("$toString", "$_id")).add("$$lId"))))))
                .put("as", "listing")
            ))
            .add(new JsonObject().put("$unwind", new JsonObject().put("path", "$listing").put("preserveNullAndEmptyArrays", true)))
            .add(new JsonObject().put("$project", new JsonObject()
                .put("teacherId", 1)
                .put("price", new JsonObject().put("$ifNull", new JsonArray().add("$listing.price").add(0)))
                .put("durationHours", new JsonObject().put("$divide", new JsonArray()
                    .add(new JsonObject().put("$subtract", new JsonArray().add("$scheduledEnd").add("$scheduledStart")))
                    .add(3600000)
                ))
            ))
            .add(new JsonObject().put("$group", new JsonObject()
                .put("_id", "$teacherId")
                .put("sessions", new JsonObject().put("$sum", 1))
                .put("earnings", new JsonObject().put("$sum", new JsonObject().put("$multiply", new JsonArray().add("$price").add(new JsonObject().put("$max", new JsonArray().add("$durationHours").add(1))))))
            ))
            .add(new JsonObject().put("$sort", new JsonObject().put("sessions", -1)))
            .add(new JsonObject().put("$limit", 5))
            .add(new JsonObject().put("$lookup", new JsonObject()
                .put("from", "user_profiles")
                .put("localField", "_id")
                .put("foreignField", "userId")
                .put("as", "profile")
            ))
            .add(new JsonObject().put("$unwind", new JsonObject()
                .put("path", "$profile")
                .put("preserveNullAndEmptyArrays", true)
            ));

        return client.aggregateWithOptions("sessions", pipeline, new io.vertx.ext.mongo.AggregateOptions()).collect(java.util.stream.Collectors.toList())
            .map(results -> {
                JsonArray arr = new JsonArray();
                for (int i = 0; i < results.size(); i++) {
                    JsonObject r = results.get(i);
                    JsonObject profile = r.getJsonObject("profile");
                    if (profile == null) profile = new JsonObject();
                    
                    String name = profile.getString("name", "Unknown Tutor");
                    double rating = profile.getDouble("averageRating", 0.0);
                    double roundedRating = Math.round(rating * 10.0) / 10.0;
                    
                    arr.add(new JsonObject()
                        .put("id", r.getString("_id"))
                        .put("name", name)
                        .put("initial", name.isEmpty() ? "T" : name.substring(0, 1).toUpperCase())
                        .put("dept", profile.getString("department", "General"))
                        .put("sessions", r.getInteger("sessions", 0))
                        .put("rating", roundedRating) 
                        .put("earnings", String.valueOf(r.getInteger("earnings", 0)))
                        .put("rank", i + 1)
                    );
                }
                return arr;
            });
    }

    public Future<JsonArray> getLiveActivity() {
        FindOptions options = new FindOptions().setSort(new JsonObject().put("createdAt", -1)).setLimit(5);
        
        Future<List<JsonObject>> registrations = client.findWithOptions("user_profiles", new JsonObject(), options);
        Future<List<JsonObject>> sessions = client.findWithOptions("sessions", new JsonObject(), options);
        Future<List<JsonObject>> disputes = client.findWithOptions("disputes", new JsonObject(), options);
        
        return io.vertx.core.CompositeFuture.all(registrations, sessions, disputes).map(cf -> {
            List<JsonObject> allActivity = new java.util.ArrayList<>();
            
            List<JsonObject> regs = cf.resultAt(0);
            for (JsonObject reg : regs) {
                String name = reg.getString("name", "Unknown");
                allActivity.add(new JsonObject()
                    .put("id", "reg_" + reg.getString("userId"))
                    .put("type", "registration")
                    .put("title", name + " registered")
                    .put("subtitle", reg.getString("programme", "Student"))
                    .put("createdAt", reg.getLong("createdAt", 0L))
                    .put("status", "success")
                );
            }
            
            List<JsonObject> sess = cf.resultAt(1);
            for (JsonObject s : sess) {
                String status = s.getString("status", "PENDING");
                allActivity.add(new JsonObject()
                    .put("id", "sess_" + s.getString("_id"))
                    .put("type", "session")
                    .put("title", "Session " + status.toLowerCase())
                    .put("subtitle", s.getString("topic", "General") + " session")
                    .put("createdAt", s.getLong("createdAt", 0L))
                    .put("status", "info")
                );
            }
            
            List<JsonObject> disps = cf.resultAt(2);
            for (JsonObject d : disps) {
                allActivity.add(new JsonObject()
                    .put("id", "disp_" + d.getString("_id"))
                    .put("type", "dispute")
                    .put("title", "Dispute raised")
                    .put("subtitle", d.getString("reason", "No reason"))
                    .put("createdAt", d.getLong("createdAt", 0L))
                    .put("status", "warning")
                );
            }
            
            allActivity.sort((a, b) -> Long.compare(b.getLong("createdAt", 0L), a.getLong("createdAt", 0L)));
            
            JsonArray result = new JsonArray();
            for (int i = 0; i < Math.min(5, allActivity.size()); i++) {
                JsonObject item = allActivity.get(i);
                long diff = System.currentTimeMillis() - item.getLong("createdAt", 0L);
                long mins = diff / 60000;
                long hrs = mins / 60;
                long days = hrs / 24;
                String timeStr = mins < 60 ? mins + "m ago" : (hrs < 24 ? hrs + "h ago" : days + "d ago");
                item.put("time", timeStr);
                result.add(item);
            }
            return result;
        });
    }

    public Future<JsonObject> getPlatformHealthMetrics() {
        Future<Long> totalSessionsFut = client.count("sessions", new JsonObject());
        Future<Long> completedSessionsFut = client.count("sessions", new JsonObject().put("status", "COMPLETED"));
        Future<Long> totalDisputesFut = client.count("disputes", new JsonObject());
        Future<Long> totalReviewsFut = client.count("reviews", new JsonObject());
        Future<Long> positiveReviewsFut = client.count("reviews", new JsonObject().put("rating", new JsonObject().put("$gte", 4)));

        return io.vertx.core.CompositeFuture.all(totalSessionsFut, completedSessionsFut, totalDisputesFut, totalReviewsFut, positiveReviewsFut)
            .map(cf -> {
                long totalSessions = cf.resultAt(0);
                long completedSessions = cf.resultAt(1);
                long totalDisputes = cf.resultAt(2);
                long totalReviews = cf.resultAt(3);
                long positiveReviews = cf.resultAt(4);

                long sessionCompletionRate = totalSessions == 0 ? 100 : (completedSessions * 100) / totalSessions;
                long disputeRate = totalSessions == 0 ? 0 : (totalDisputes * 100) / totalSessions;
                long positiveRatingRate = totalReviews == 0 ? 100 : (positiveReviews * 100) / totalReviews;

                return new JsonObject()
                    .put("sessionCompletionRate", sessionCompletionRate)
                    .put("disputeRate", disputeRate)
                    .put("positiveRatingRate", positiveRatingRate);
            });
    }

    public Future<JsonObject> getAnalyticsData(Integer filterYear, String filterDepartment, String filterMonth) {
        JsonObject query = new JsonObject();
        if (filterDepartment != null && !filterDepartment.isEmpty() && !"all".equalsIgnoreCase(filterDepartment)) {
            // We use 'programme' field for department
            query.put("programme", new JsonObject().put("$regex", filterDepartment).put("$options", "i"));
        }

        return client.find("user_profiles", query).map(profiles -> {
            int currentYear = filterYear != null ? filterYear : java.util.Calendar.getInstance().get(java.util.Calendar.YEAR);
            int prevYear = currentYear - 1;

            int currentYearCount = 0;
            int prevYearCount = 0;
            int[] monthlyCounts = new int[12];

            for (JsonObject profile : profiles) {
                Long createdAt = profile.getLong("createdAt");
                if (createdAt != null) {
                    java.util.Calendar cal = java.util.Calendar.getInstance();
                    cal.setTimeInMillis(createdAt);
                    int y = cal.get(java.util.Calendar.YEAR);
                    int m = cal.get(java.util.Calendar.MONTH); // 0-11

                    if (y == currentYear) {
                        currentYearCount++;
                        monthlyCounts[m]++;
                    } else if (y == prevYear) {
                        prevYearCount++;
                    }
                }
            }

            // Calculate peak month
            int peakMonthIdx = 0;
            int peakMonthVal = 0;
            for (int i = 0; i < 12; i++) {
                if (monthlyCounts[i] > peakMonthVal) {
                    peakMonthVal = monthlyCounts[i];
                    peakMonthIdx = i;
                }
            }
            String[] monthNames = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
            String peakMonthName = peakMonthVal > 0 ? monthNames[peakMonthIdx] : "None";

            int currentMonthIdx = currentYear == java.util.Calendar.getInstance().get(java.util.Calendar.YEAR)
                ? java.util.Calendar.getInstance().get(java.util.Calendar.MONTH)
                : 11;
            int monthsPassed = currentMonthIdx + 1;
            double monthlyAvg = (double) currentYearCount / monthsPassed;
            String monthlyAvgStr = String.format("%.1f", monthlyAvg);

            // Calculate YoY Growth
            double yoyGrowth = 0.0;
            if (prevYearCount > 0) {
                yoyGrowth = ((double)(currentYearCount - prevYearCount) / prevYearCount) * 100;
            } else if (currentYearCount > 0) {
                yoyGrowth = 100.0; // From 0 to something
            }
            
            String yoyColor = yoyGrowth >= 0 ? "#10b981" : "#ef4444";
            String yoySign = yoyGrowth >= 0 ? "+" : "";

            JsonObject stats = new JsonObject()
                .put("totalRegistrations", new JsonObject().put("value", currentYearCount).put("sub", "Students registered in " + currentYear))
                .put("peakMonth", new JsonObject().put("value", peakMonthName).put("sub", peakMonthVal + " registrations"))
                .put("monthlyAvg", new JsonObject().put("value", monthlyAvgStr).put("sub", "Registrations per month"))
                .put("yoyGrowth", new JsonObject().put("value", yoySign + String.format("%.1f", yoyGrowth) + "%").put("sub", "Compared to " + prevYear).put("color", yoyColor));

            JsonArray chartData = new JsonArray();
            for (int i = 0; i < 12; i++) {
                chartData.add(new JsonObject().put("month", monthNames[i]).put("registrations", monthlyCounts[i]));
            }

            return new JsonObject()
                .put("stats", stats)
                .put("chartData", chartData)
                .put("meta", new JsonObject()
                    .put("year", currentYear)
                    .put("yoyGrowth", yoySign + String.format("%.1f", yoyGrowth) + "% YoY")
                );
        });
    }

    private JsonObject getDefaultSettings() {
        return new JsonObject()
            .put("type", "global_settings")
            .put("platformAccess", new JsonObject()
                .put("isLive", true))
            .put("platformSettings", new JsonObject()
                .put("skill_swaps", true)
                .put("email_verify", true)
                .put("auto_suspend", false)
                .put("public_tutors", false))
            .put("notificationSettings", new JsonObject()
                .put("new_user_alerts", true)
                .put("dispute_alerts", true)
                .put("payment_alerts", false));
    }

    public Future<JsonObject> getSettings() {
        JsonObject query = new JsonObject().put("type", "global_settings");
        return client.findOne("platform_settings", query, null).compose(result -> {
            if (result == null || result.isEmpty()) {
                JsonObject defaultSettings = getDefaultSettings();
                defaultSettings.put("createdAt", System.currentTimeMillis());
                return client.save("platform_settings", defaultSettings)
                    .map(res -> defaultSettings);
            }
            return Future.succeededFuture(result);
        });
    }

    public Future<JsonObject> updateSettings(JsonObject newSettings, String updatedBy) {
        JsonObject query = new JsonObject().put("type", "global_settings");
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("platformAccess", newSettings.getJsonObject("platformAccess", new JsonObject()))
            .put("platformSettings", newSettings.getJsonObject("platformSettings", new JsonObject()))
            .put("notificationSettings", newSettings.getJsonObject("notificationSettings", new JsonObject()))
            .put("updatedBy", updatedBy)
            .put("updatedAt", System.currentTimeMillis())
        );

        io.vertx.ext.mongo.UpdateOptions options = new io.vertx.ext.mongo.UpdateOptions().setUpsert(true);
        return client.updateCollectionWithOptions("platform_settings", query, update, options)
            .compose(res -> getSettings());
    }
}
