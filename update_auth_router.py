import re

with open('backend/src/main/java/com/campusskills/modules/users/routes/AuthRouter.java', 'r') as f:
    content = f.read()

instantiation = '''
        com.campusskills.modules.admin.repositories.AdminInvitationRepository invitationRepository = new com.campusskills.modules.admin.repositories.AdminInvitationRepository();
        com.campusskills.modules.admin.handlers.AdminInvitationAuthHandler inviteHandler = new com.campusskills.modules.admin.handlers.AdminInvitationAuthHandler(
            invitationRepository, userRepository, profileRepository, statsRepository, walletRepository, otpRepository, emailService
        );
'''

routes = '''
        router.get("/invites/:token").handler(inviteHandler::validateToken);
        router.post("/invites/:token/setup").handler(com.campusskills.web.middleware.RateLimitMiddleware.create()).handler(inviteHandler::setupAccount);
        router.post("/invites/verify").handler(com.campusskills.web.middleware.RateLimitMiddleware.create()).handler(inviteHandler::verifyAndCreate);
'''

# We need to insert instantiation before AuthHandler handler = new AuthHandler(service);
# and routes after router.post("/logout").handler(handler::logout);

content = content.replace('AuthHandler handler = new AuthHandler(service);', instantiation + '\\n        AuthHandler handler = new AuthHandler(service);')
content = content.replace('router.post("/logout").handler(handler::logout);', 'router.post("/logout").handler(handler::logout);\\n' + routes)

with open('backend/src/main/java/com/campusskills/modules/users/routes/AuthRouter.java', 'w') as f:
    f.write(content)
