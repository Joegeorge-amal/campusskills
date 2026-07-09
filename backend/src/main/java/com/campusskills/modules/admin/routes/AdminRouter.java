package com.campusskills.modules.admin.routes;

import com.campusskills.modules.admin.handlers.AdminHandler;
import com.campusskills.modules.admin.handlers.AdminManagementHandler;
import com.campusskills.modules.admin.repositories.AdminRepository;
import com.campusskills.modules.admin.services.AdminService;
import com.campusskills.web.middleware.JwtAuthMiddleware;
import io.vertx.core.Vertx;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;

public class AdminRouter {

    public static Router create(Vertx vertx, JWTAuth jwtAuth) {
        Router router = Router.router(vertx);
        
        AdminRepository repository = new AdminRepository();
        com.campusskills.modules.sessions.repositories.SessionRepository sessionRepository = new com.campusskills.modules.sessions.repositories.SessionRepository();
        com.campusskills.modules.users.repositories.UserRepository userRepository = new com.campusskills.modules.users.repositories.UserRepository();
        com.campusskills.modules.users.repositories.UserProfileRepository userProfileRepository = new com.campusskills.modules.users.repositories.UserProfileRepository();
        
        AdminService service = new AdminService(repository, sessionRepository, userRepository, userProfileRepository, vertx.eventBus());
        com.campusskills.modules.notifications.repositories.NotificationRepository notificationRepository = new com.campusskills.modules.notifications.repositories.NotificationRepository();
        AdminHandler handler = new AdminHandler(service, notificationRepository);

        com.campusskills.modules.admin.repositories.AuditLogRepository auditLogRepository = new com.campusskills.modules.admin.repositories.AuditLogRepository();
        com.campusskills.modules.admin.services.AuditLogService auditLogService = new com.campusskills.modules.admin.services.AuditLogService();
        service.setAuditLogService(auditLogService);
        AdminManagementHandler managementHandler = new AdminManagementHandler(userRepository, auditLogService);

        router.route().handler(JwtAuthMiddleware.create(jwtAuth));
        
        // Capabilities endpoint (available to any authenticated user who hits the admin panel, but mostly SUPER_ADMIN)
        // Wait, standard users shouldn't really hit this, but we'll put it under the generic auth just in case.
        // Or we can put it under RequireSuperAdminMiddleware. The requirement is for SUPER_ADMIN.
        // Let's put it under RequireSuperAdminMiddleware.
        
        // Super Admin only routes
        router.get("/management/capabilities").handler(com.campusskills.web.middleware.RequireSuperAdminMiddleware.create()).handler(managementHandler::getCapabilities);
        router.get("/management/staff").handler(com.campusskills.web.middleware.RequireSuperAdminMiddleware.create()).handler(managementHandler::getStaff);
        router.post("/management/promote").handler(com.campusskills.web.middleware.RequireSuperAdminMiddleware.create()).handler(managementHandler::promote);
        router.post("/management/demote").handler(com.campusskills.web.middleware.RequireSuperAdminMiddleware.create()).handler(managementHandler::demote);
        router.get("/management/audit").handler(com.campusskills.web.middleware.RequireSuperAdminMiddleware.create()).handler(managementHandler::getAuditLogs);
        
        router.patch("/users/:id/role").handler(com.campusskills.web.middleware.RequireSuperAdminMiddleware.create()).handler(handler::updateUserRole);

        // Admin and Super Admin routes
        router.route().handler(com.campusskills.web.middleware.RequireAdminMiddleware.create());
        
        router.get("/users").handler(handler::getUsers);
        router.patch("/users/:id/status").handler(handler::updateUserStatus);
        
        router.get("/disputes").handler(handler::getDisputes);
        router.patch("/disputes/:id").handler(handler::updateDisputeStatus);
        
        router.get("/reports").handler(handler::getReports);
        router.patch("/reports/:id").handler(handler::updateReportStatus);
        
        router.get("/sessions").handler(handler::getSessions);
        router.patch("/sessions/:id/cancel").handler(handler::cancelSession);
        router.post("/sessions/:id/force-complete").handler(handler::forceCompleteSession);

        router.get("/listings").handler(handler::getListings);
        router.patch("/listings/:id/status").handler(handler::updateListingStatus);

        router.get("/overview").handler(handler::getOverviewData);
        router.get("/analytics").handler(handler::getAnalyticsData);

        router.get("/notifications").handler(handler::getNotifications);
        router.patch("/notifications/read").handler(handler::markNotificationsRead);
        router.delete("/notifications/:id").handler(handler::deleteNotification);

        router.get("/settings").handler(handler::getSettings);
        router.put("/settings").handler(handler::updateSettings);
        return router;
    }
}
