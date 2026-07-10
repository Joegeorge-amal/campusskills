package com.campusskills.modules.admin.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.admin.models.AdminInvitation;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Updates;
import io.vertx.core.Future;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.core.json.JsonObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class AdminInvitationRepository {
    private static final Logger log = LoggerFactory.getLogger(AdminInvitationRepository.class);
    private static final String COLLECTION = "admin_invitations";
    private final MongoClient mongoClient;

    public AdminInvitationRepository() {
        this.mongoClient = MongoManager.getClient();
    }

    public Future<String> create(AdminInvitation invitation) {
        JsonObject doc = JsonObject.mapFrom(invitation);
        doc.remove("_id"); // Let Mongo generate the ID
        
        return mongoClient.insert(COLLECTION, doc).map(id -> {
            invitation.setId(id);
            return id;
        });
    }

    public Future<AdminInvitation> findByToken(String token) {
        JsonObject query = new JsonObject().put("token", token);
        return mongoClient.findOne(COLLECTION, query, null)
                .map(json -> json != null ? json.mapTo(AdminInvitation.class) : null);
    }

    public Future<AdminInvitation> findPendingByEmail(String email) {
        JsonObject query = new JsonObject()
            .put("email", email)
            .put("status", AdminInvitation.STATUS_PENDING);
            
        return mongoClient.findOne(COLLECTION, query, null)
                .map(json -> json != null ? json.mapTo(AdminInvitation.class) : null);
    }

    public Future<List<AdminInvitation>> findAllPendingByEmail(String email) {
        JsonObject query = new JsonObject()
            .put("email", email)
            .put("status", AdminInvitation.STATUS_PENDING);
            
        return mongoClient.find(COLLECTION, query)
                .map(list -> list.stream()
                        .map(json -> json.mapTo(AdminInvitation.class))
                        .collect(Collectors.toList()));
    }

    public Future<Void> updateStatus(String id, String status) {
        JsonObject query = new JsonObject().put("_id", id);
        JsonObject update = new JsonObject().put("$set", new JsonObject().put("status", status));
        
        return mongoClient.updateCollection(COLLECTION, query, update)
                .mapEmpty();
    }
    
    public Future<Void> revokeAllPendingForEmail(String email) {
        JsonObject query = new JsonObject()
            .put("email", email)
            .put("status", AdminInvitation.STATUS_PENDING);
            
        JsonObject update = new JsonObject()
            .put("$set", new JsonObject().put("status", AdminInvitation.STATUS_REVOKED));
            
        return mongoClient.updateCollection(COLLECTION, query, update)
                .mapEmpty();
    }
}
