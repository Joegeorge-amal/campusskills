import com.campusskills.core.database.MongoManager;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;

public class TestDB2 {
    public static void main(String[] args) {
        Vertx vertx = Vertx.vertx();
        JsonObject config = new JsonObject().put("connection_string", "mongodb://localhost:27017").put("db_name", "campusskills");
        MongoClient client = MongoClient.createShared(vertx, config);
        
        client.find("users", new JsonObject().put("email", "mw405807@gmail.com")).onSuccess(docs -> {
            if (docs.isEmpty()) {
                System.out.println("NO USER");
                System.exit(0);
            }
            JsonObject userDoc = docs.get(0);
            String userId = userDoc.getString("_id");
            if (userId == null) {
               JsonObject oid = userDoc.getJsonObject("_id");
               if (oid != null) userId = oid.getString("$oid");
            }
            System.out.println("USER ID: " + userId);
            
            client.findOne("user_profiles", new JsonObject().put("userId", userId), null).onSuccess(profileDoc -> {
                System.out.println("PROFILE DOC BY STRING: " + profileDoc);
                
                // Try with ObjectId if string failed
                if (profileDoc == null) {
                    client.findOne("user_profiles", new JsonObject().put("userId", new JsonObject().put("$oid", userId)), null).onSuccess(p2 -> {
                        System.out.println("PROFILE DOC BY OID: " + p2);
                        System.exit(0);
                    });
                } else {
                    System.exit(0);
                }
            });
        });
    }
}
