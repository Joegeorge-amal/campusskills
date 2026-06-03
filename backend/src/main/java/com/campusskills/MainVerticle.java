package com.campusskills;

import com.campusskills.core.database.MongoManager;
import com.campusskills.web.router.ApiRouter;
import com.campusskills.web.websockets.WebSocketHandler;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServer;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.auth.jwt.JWTAuthOptions;
import io.vertx.ext.auth.PubSecKeyOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MainVerticle extends AbstractVerticle {

    private static final Logger log = LoggerFactory.getLogger(MainVerticle.class);

    @Override
    public void start(Promise<Void> startPromise) {
        // 1. Load Configuration from Environment Variables (with fallbacks)
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));
        String host = System.getenv().getOrDefault("HOST", "0.0.0.0");
        String mongoUri = System.getenv().getOrDefault("MONGO_URI", "mongodb://localhost:27017");
        String mongoDbName = System.getenv().getOrDefault("MONGO_DB_NAME", "campusskills");
        String jwtSecret = System.getenv().getOrDefault("JWT_SECRET", "super-secret-development-key-change-in-production");
        String frontendOrigin = System.getenv().getOrDefault("FRONTEND_ORIGIN", "http://localhost:5500");

        JsonObject dbConfig = new JsonObject()
                .put("connection_string", mongoUri)
                .put("db_name", mongoDbName);

        // 2. Initialize Database Connection
        MongoManager.init(vertx, dbConfig);
        com.campusskills.core.database.DatabaseInitializer.initializeIndexes(MongoManager.getClient());
        
        // Seed Topics
        new com.campusskills.modules.topics.services.TopicService(
            new com.campusskills.modules.topics.repositories.TopicRepository()
        ).seedSystemTopics()
         .onSuccess(v -> log.info("System topics seeded successfully"))
         .onFailure(err -> log.error("Failed to seed system topics", err));

        // 3. Initialize JWT Auth
        JWTAuth jwtAuth = JWTAuth.create(vertx, new JWTAuthOptions()
            .addPubSecKey(new PubSecKeyOptions()
                .setAlgorithm("HS256")
                .setBuffer(jwtSecret)));

        // 4. Setup Router
        Router mainRouter = Router.router(vertx);
        
        // Base route for health check
        mainRouter.get("/health").handler(ctx -> {
            ctx.response().putHeader("content-type", "application/json")
               .end(new JsonObject().put("status", "UP").encode());
        });

        // 5. Mount API Routes
        mainRouter.route("/api/v1/*").subRouter(ApiRouter.create(vertx, jwtAuth, frontendOrigin));

        // 6. Start HTTP Server
        HttpServer server = vertx.createHttpServer();

        // 7. Setup WebSockets
        server.webSocketHandler(WebSocketHandler.create(vertx, jwtAuth));

        server.requestHandler(mainRouter)
              .listen(port, host)
              .onSuccess(s -> {
                  log.info("HTTP server started on port {}", port);
                  startPromise.complete();
              })
              .onFailure(err -> {
                  log.error("Failed to start HTTP server", err);
                  startPromise.fail(err);
              });
    }

    public static void main(String[] args) {
        Vertx vertx = Vertx.vertx();
        vertx.deployVerticle(new MainVerticle())
             .onFailure(err -> log.error("Failed to deploy MainVerticle", err));
    }
}
