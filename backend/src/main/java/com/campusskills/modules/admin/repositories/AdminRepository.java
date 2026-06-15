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
            .add(new JsonObject().put("$group", new JsonObject().put("_id", null).put("total", new JsonObject().put("$sum", "$amount"))));
            
        Future<Long> revenueFuture = client.aggregateWithOptions("sessions", revenuePipeline, new io.vertx.ext.mongo.AggregateOptions()).collect(java.util.stream.Collectors.toList())
            .map(results -> {
                if (results.isEmpty()) return 0L;
                return results.get(0).getLong("total", 0L);
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
        FindOptions options = new FindOptions().setSort(new JsonObject().put("createdAt", -1)).setLimit(5);
        return client.findWithOptions("user_profiles", new JsonObject(), options).map(users -> {
            JsonArray arr = new JsonArray();
            for(JsonObject u : users) {
                String name = u.getString("name", "Unknown");
                
                long diff = System.currentTimeMillis() - u.getLong("createdAt", System.currentTimeMillis());
                long mins = diff / 60000;
                long hrs = mins / 60;
                long days = hrs / 24;
                String timeStr = mins < 60 ? mins + "m ago" : (hrs < 24 ? hrs + "h ago" : days + "d ago");

                arr.add(new JsonObject()
                    .put("id", u.getString("userId"))
                    .put("name", name)
                    .put("initial", name.isEmpty() ? "U" : name.substring(0, 1).toUpperCase())
                    .put("info", u.getString("department", "Unknown Dept"))
                    .put("role", "Student")
                    .put("time", timeStr)
                );
            }
            return arr;
        });
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
            .add(new JsonObject().put("$addFields", new JsonObject()
                .put("listingObjectId", new JsonObject().put("$toObjectId", "$listingId"))
            ))
            .add(new JsonObject().put("$lookup", new JsonObject()
                .put("from", "skill_listings")
                .put("localField", "listingObjectId")
                .put("foreignField", "_id")
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
            
        return client.aggregateWithOptions("sessions", pipeline, new io.vertx.ext.mongo.AggregateOptions()).collect(java.util.stream.Collectors.toList())
            .map(results -> {
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
                return new JsonObject()
                    .put("totalSessions", totalSessions)
                    .put("activeTutors", 0) 
                    .put("avgRating", 0.0)
                    .put("categories", categories);
            });
    }

    public Future<JsonArray> getTopTutors() {
        JsonArray pipeline = new JsonArray()
            .add(new JsonObject().put("$match", new JsonObject().put("status", "COMPLETED")))
            .add(new JsonObject().put("$group", new JsonObject()
                .put("_id", "$teacherId")
                .put("sessions", new JsonObject().put("$sum", 1))
                .put("earnings", new JsonObject().put("$sum", "$amount"))
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
                    arr.add(new JsonObject()
                        .put("id", r.getString("_id"))
                        .put("name", name)
                        .put("initial", name.isEmpty() ? "T" : name.substring(0, 1).toUpperCase())
                        .put("dept", profile.getString("department", "General"))
                        .put("sessions", r.getInteger("sessions", 0))
                        .put("rating", profile.getDouble("averageRating", 0.0)) 
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
                    .put("subtitle", reg.getString("department", "Student"))
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
}
