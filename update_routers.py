import re

# Update ApiRouter
with open('backend/src/main/java/com/campusskills/web/router/ApiRouter.java', 'r') as f:
    content = f.read()

content = content.replace('com.campusskills.modules.admin.routes.AdminRouter.create(vertx, jwtAuth)', 'com.campusskills.modules.admin.routes.AdminRouter.create(vertx, jwtAuth, emailService)')

with open('backend/src/main/java/com/campusskills/web/router/ApiRouter.java', 'w') as f:
    f.write(content)

# Update AdminRouter
with open('backend/src/main/java/com/campusskills/modules/admin/routes/AdminRouter.java', 'r') as f:
    content = f.read()

content = content.replace('public static Router create(Vertx vertx, JWTAuth jwtAuth) {', 'public static Router create(Vertx vertx, JWTAuth jwtAuth, com.campusskills.shared.services.EmailService emailService) {')
content = content.replace('AdminManagementHandler managementHandler = new AdminManagementHandler(userRepository, auditLogService);', 'com.campusskills.modules.admin.repositories.AdminInvitationRepository invitationRepository = new com.campusskills.modules.admin.repositories.AdminInvitationRepository();\\n        AdminManagementHandler managementHandler = new AdminManagementHandler(userRepository, auditLogService, invitationRepository, emailService);')
content = content.replace('router.post("/management/demote").handler(com.campusskills.web.middleware.RequireSuperAdminMiddleware.create()).handler(managementHandler::demote);', 'router.post("/management/demote").handler(com.campusskills.web.middleware.RequireSuperAdminMiddleware.create()).handler(managementHandler::demote);\\n        router.post("/management/invite").handler(com.campusskills.web.middleware.RequireSuperAdminMiddleware.create()).handler(managementHandler::inviteUser);')

with open('backend/src/main/java/com/campusskills/modules/admin/routes/AdminRouter.java', 'w') as f:
    f.write(content)

