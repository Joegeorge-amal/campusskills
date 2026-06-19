package com.campusskills.modules.users.repositories;

import com.campusskills.core.database.MongoManager;
import com.campusskills.modules.users.models.UserWallet;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

public class UserWalletRepository {
    private final MongoClient client;
    private static final String COLLECTION = "user_wallets";

    public UserWalletRepository() {
        this.client = MongoManager.getClient();
    }

    public Future<String> createWallet(UserWallet wallet) {
        long now = System.currentTimeMillis();
        wallet.setCreatedAt(now);
        wallet.setUpdatedAt(now);
        JsonObject doc = JsonObject.mapFrom(wallet);
        doc.remove("_id");
        return client.insert(COLLECTION, doc);
    }

    public Future<UserWallet> findByUserId(String userId) {
        JsonObject query = new JsonObject().put("userId", userId);
        return client.findOne(COLLECTION, query, null).map(doc -> {
            if (doc == null) return null;
            Object idObj = doc.getValue("_id");
            if (idObj instanceof JsonObject && ((JsonObject) idObj).containsKey("$oid")) {
                doc.put("_id", ((JsonObject) idObj).getString("$oid"));
            }
            return doc.mapTo(UserWallet.class);
        });
    }
}
