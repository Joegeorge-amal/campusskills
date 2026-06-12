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
            .put("foreignField", "userId")
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
        JsonArray disputeStatuses = new JsonArray().add("DISPUTED").add("OPEN").add("REVIEWING").add("RESOLVED");
        if (status != null && !status.trim().isEmpty()) {
            matchStage.put("status", status.trim());
        } else {
            matchStage.put("status", new JsonObject().put("$in", disputeStatuses));
        }

        if (q != null && !q.trim().isEmpty()) {
            // Text search on sessions (disputeReason, etc.)
            matchStage.put("$text", new JsonObject().put("$search", q.trim()));
        }

        pipeline.add(new JsonObject().put("$match", matchStage));

        // 2. Lookup user_profiles for participants
        // Participants is an array of user IDs. We can lookup profiles where userId in participants.
        pipeline.add(new JsonObject().put("$lookup", new JsonObject()
            .put("from", "user_profiles")
            .put("localField", "participants")
            .put("foreignField", "userId")
            .put("as", "participantProfiles")
        ));

        // 3. Facet for pagination
        JsonArray dataFacet = new JsonArray()
            .add(new JsonObject().put("$sort", new JsonObject().put("updatedAt", -1)))
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
                    JsonArray profiles = session.getJsonArray("participantProfiles", new JsonArray());
                    
                    String participant1Name = "Unknown";
                    String participant2Name = "Unknown";
                    
                    if (profiles.size() > 0) {
                        participant1Name = profiles.getJsonObject(0).getString("name", "Unknown");
                    }
                    if (profiles.size() > 1) {
                        participant2Name = profiles.getJsonObject(1).getString("name", "Unknown");
                    }

                    formattedData.add(new JsonObject()
                        .put("id", session.getString("_id"))
                        .put("status", session.getString("status"))
                        .put("participants", participant1Name + " vs " + participant2Name)
                        .put("reason", session.getString("disputeReason", "Unknown Reason"))
                        .put("amount", session.getDouble("price", 0.0))
                        .put("currency", session.getString("currency", "INR"))
                        .put("updatedAt", session.getLong("updatedAt"))
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

    public Future<Boolean> updateDisputeStatus(String sessionId, String status, String adminNotes) {
        JsonObject query = new JsonObject().put("_id", sessionId);
        JsonObject setFields = new JsonObject()
            .put("status", status)
            .put("updatedAt", System.currentTimeMillis());
            
        if (adminNotes != null && !adminNotes.trim().isEmpty()) {
            setFields.put("adminNotes", adminNotes);
        }
        
        JsonObject update = new JsonObject().put("$set", setFields);
        return client.updateCollection("sessions", query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<Boolean> cancelSession(String sessionId) {
        JsonObject query = new JsonObject().put("_id", sessionId);
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("status", "CANCELLED")
            .put("updatedAt", System.currentTimeMillis()));
        return client.updateCollection("sessions", query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<JsonObject> searchListings(String q, String status, int page, int limit) {
        int skip = (page - 1) * limit;
        JsonArray pipeline = new JsonArray();

        // 1. Initial Match
        JsonObject matchStage = new JsonObject();
        if (status != null && !status.trim().isEmpty()) {
            matchStage.put("status", status.trim());
        }
        if (!matchStage.isEmpty()) {
            pipeline.add(new JsonObject().put("$match", matchStage));
        }

        // 2. Lookup owner details
        pipeline.add(new JsonObject().put("$lookup", new JsonObject()
            .put("from", "user_profiles")
            .put("localField", "teacherId")
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
                    JsonObject owner = listing.getJsonObject("owner", new JsonObject());

                    formattedData.add(new JsonObject()
                        .put("id", listing.getString("_id"))
                        .put("title", listing.getString("title"))
                        .put("category", listing.getString("category"))
                        .put("status", listing.getString("status", "ACTIVE"))
                        .put("active", listing.getBoolean("active", true))
                        .put("createdAt", listing.getLong("createdAt"))
                        .put("ownerName", owner.getString("name", "Unknown"))
                        .put("ownerId", listing.getString("teacherId"))
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
}
