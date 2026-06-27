package com.campusskills.modules.users.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.users.models.User;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

public class UserRepository {
    
    private final MongoClient client;
    private static final String COLLECTION = "users";

    public UserRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<String> createUser(User user) {
        user.setCreatedAt(System.currentTimeMillis());
        user.setUpdatedAt(System.currentTimeMillis());
        JsonObject doc = JsonObject.mapFrom(user);
        doc.remove("_id"); // let mongo generate
        return client.insert(COLLECTION, doc);
    }

    public Future<User> findByEmail(String email) {
        JsonObject query = new JsonObject().put("email", email);
        return client.findOne(COLLECTION, query, null).map(doc -> {
            if (doc == null) return null;
            Object idObj = doc.getValue("_id");
            if (idObj instanceof JsonObject && ((JsonObject) idObj).containsKey("$oid")) {
                doc.put("_id", ((JsonObject) idObj).getString("$oid"));
            }
            return doc.mapTo(User.class);
        });
    }

    public Future<User> findById(String id) {
        if (id == null || id.trim().isEmpty()) {
            return Future.succeededFuture(null);
        }
        JsonObject query;
        if (id.length() == 24 && id.matches("^[0-9a-fA-F]+$")) {
            query = new JsonObject().put("$or", new io.vertx.core.json.JsonArray()
                .add(new JsonObject().put("_id", id))
                .add(new JsonObject().put("_id", new JsonObject().put("$oid", id)))
            );
        } else {
            query = new JsonObject().put("_id", id);
        }
        return client.findOne(COLLECTION, query, null).map(doc -> {
            if (doc == null) return null;
            Object idObj = doc.getValue("_id");
            if (idObj instanceof JsonObject && ((JsonObject) idObj).containsKey("$oid")) {
                doc.put("_id", ((JsonObject) idObj).getString("$oid"));
            }
            return doc.mapTo(User.class);
        });
    }

    public Future<java.util.List<User>> findUsersByRoles(java.util.List<String> roles) {
        JsonObject query = new JsonObject().put("role", new JsonObject().put("$in", new io.vertx.core.json.JsonArray(roles)));
        return client.find(COLLECTION, query).map(list -> 
            list.stream().map(doc -> {
                Object idObj = doc.getValue("_id");
                if (idObj instanceof JsonObject && ((JsonObject) idObj).containsKey("$oid")) {
                    doc.put("_id", ((JsonObject) idObj).getString("$oid"));
                }
                return doc.mapTo(User.class);
            }).collect(java.util.stream.Collectors.toList())
        );
    }

    public Future<User> findByEmailPrefix(String prefix) {
        if (prefix == null || prefix.trim().isEmpty()) {
            return Future.succeededFuture(null);
        }
        JsonObject query = new JsonObject().put("email", new JsonObject()
            .put("$regex", "^" + java.util.regex.Pattern.quote(prefix.trim().toLowerCase()) + "@")
            .put("$options", "i")
        );
        return client.findOne(COLLECTION, query, null).map(doc -> {
            if (doc == null) return null;
            Object idObj = doc.getValue("_id");
            if (idObj instanceof JsonObject && ((JsonObject) idObj).containsKey("$oid")) {
                doc.put("_id", ((JsonObject) idObj).getString("$oid"));
            }
            return doc.mapTo(User.class);
        });
    }

    public Future<Boolean> updateUserRole(String id, com.campusskills.modules.users.models.UserRole role) {
        JsonObject query;
        if (id != null && id.length() == 24 && id.matches("^[0-9a-fA-F]+$")) {
            query = new JsonObject().put("$or", new io.vertx.core.json.JsonArray()
                .add(new JsonObject().put("_id", id))
                .add(new JsonObject().put("_id", new JsonObject().put("$oid", id)))
            );
        } else {
            query = new JsonObject().put("_id", id);
        }
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("role", role.name())
            .put("updatedAt", System.currentTimeMillis()));
        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<Boolean> promoteUser(String id, com.campusskills.modules.users.models.UserRole role, String promotedBy) {
        JsonObject query;
        if (id != null && id.length() == 24 && id.matches("^[0-9a-fA-F]+$")) {
            query = new JsonObject().put("$or", new io.vertx.core.json.JsonArray()
                .add(new JsonObject().put("_id", id))
                .add(new JsonObject().put("_id", new JsonObject().put("$oid", id)))
            );
        } else {
            query = new JsonObject().put("_id", id);
        }
        JsonObject update = new JsonObject().put("$set", new JsonObject()
            .put("role", role.name())
            .put("promotedBy", promotedBy)
            .put("promotedAt", System.currentTimeMillis())
            .put("updatedAt", System.currentTimeMillis()));
        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified() > 0);
    }

    public Future<Long> countUsersByRole(com.campusskills.modules.users.models.UserRole role) {
        JsonObject query = new JsonObject().put("role", role.name());
        return client.count(COLLECTION, query);
    }

    public Future<java.util.List<String>> searchUserIdsByName(String q) {
        if (q == null || q.trim().isEmpty()) {
            return Future.succeededFuture(java.util.Collections.emptyList());
        }
        JsonObject query = new JsonObject().put("$or", new io.vertx.core.json.JsonArray()
            .add(new JsonObject().put("firstName", new JsonObject().put("$regex", q.trim()).put("$options", "i")))
            .add(new JsonObject().put("lastName", new JsonObject().put("$regex", q.trim()).put("$options", "i")))
        );
        return client.find(COLLECTION, query).map(docs -> 
            docs.stream().map(doc -> {
                Object idObj = doc.getValue("_id");
                if (idObj instanceof JsonObject && ((JsonObject) idObj).containsKey("$oid")) {
                    return ((JsonObject) idObj).getString("$oid");
                }
                return doc.getString("_id");
            }).collect(java.util.stream.Collectors.toList())
        );
    }

    public Future<Boolean> updateUser(User user) {
        String id = user.getId();
        JsonObject query;
        if (id != null && id.length() == 24 && id.matches("^[0-9a-fA-F]+$")) {
            query = new JsonObject().put("$or", new io.vertx.core.json.JsonArray()
                .add(new JsonObject().put("_id", id))
                .add(new JsonObject().put("_id", new JsonObject().put("$oid", id)))
            );
        } else {
            query = new JsonObject().put("_id", id);
        }
        user.setUpdatedAt(System.currentTimeMillis());
        JsonObject update = new JsonObject().put("$set", JsonObject.mapFrom(user));
        update.getJsonObject("$set").remove("_id"); // Don't update the ID
        return client.updateCollection(COLLECTION, query, update).map(res -> res.getDocModified() > 0);
    }
}
