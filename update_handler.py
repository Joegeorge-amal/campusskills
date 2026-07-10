import re

with open('backend/src/main/java/com/campusskills/modules/admin/handlers/AdminManagementHandler.java', 'r') as f:
    content = f.read()

# Add imports
imports = '''import com.campusskills.modules.admin.models.AdminInvitation;
import com.campusskills.modules.admin.repositories.AdminInvitationRepository;
import com.campusskills.shared.services.EmailService;
import java.util.UUID;'''
content = content.replace('import java.util.Arrays;', 'import java.util.Arrays;\\n' + imports)

# Update constructor
old_constructor = '''    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public AdminManagementHandler(UserRepository userRepository, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }'''

new_constructor = '''    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final AdminInvitationRepository invitationRepository;
    private final EmailService emailService;

    public AdminManagementHandler(UserRepository userRepository, AuditLogService auditLogService, AdminInvitationRepository invitationRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
        this.invitationRepository = invitationRepository;
        this.emailService = emailService;
    }'''
content = content.replace(old_constructor, new_constructor)

# Update promote method to send email
promote_success = '''                auditLogService.logAction(
                    "PROMOTE_USER", 
                    actor.getId(), actor.getEmail().split("@")[0], actor.getEmail(),
                    target.getId(), target.getEmail().split("@")[0], target.getEmail(),
                    previousState, targetNewRole.name(), 
                    reason, ctx.request().remoteAddress().host()
                );
                emailService.sendAdminPromotionEmail(target.getEmail(), targetNewRole.name());
                ApiResponse.ok(ctx, new JsonObject().put("success", true));'''

content = re.sub(r'auditLogService\.logAction\(.*?reason, ctx\.request\(\)\.remoteAddress\(\)\.host\(\)\s*\);\s*ApiResponse\.ok\(ctx, new JsonObject\(\)\.put\("success", true\)\);', promote_success, content, flags=re.DOTALL)

# Add inviteUser method
invite_method = '''
    public void inviteUser(RoutingContext ctx) {
        User actor = ctx.get("user");
        String actorRoleStr = ctx.get("authenticatedUserRole");
        UserRole actorRole = actorRoleStr != null ? UserRole.fromString(actorRoleStr) : UserRole.USER;
        
        JsonObject body = ctx.body().asJsonObject();
        if (body == null || !body.containsKey("email")) {
            ApiResponse.badRequest(ctx, "Target email is required");
            return;
        }
        
        String targetEmail = body.getString("email").trim().toLowerCase();
        UserRole targetNewRole = UserRole.fromString(body.getString("targetRole", "ADMIN"));
        
        if (!RoleWeightUtils.canPromote(actor.getEmail(), actorRole, UserRole.USER, targetNewRole, targetEmail)) {
            ApiResponse.forbidden(ctx, "You do not have permission to invite to this role");
            return;
        }

        userRepository.findByEmail(targetEmail).onSuccess(existing -> {
            if (existing != null) {
                ApiResponse.badRequest(ctx, "User already exists. Please use the promote feature instead.");
                return;
            }

            // Revoke any previous pending invitations
            invitationRepository.revokeAllPendingForEmail(targetEmail).onSuccess(v -> {
                String token = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
                
                AdminInvitation invitation = new AdminInvitation();
                invitation.setEmail(targetEmail);
                invitation.setRole(targetNewRole.name());
                invitation.setToken(token);
                invitation.setStatus(AdminInvitation.STATUS_PENDING);
                invitation.setInvitedBy(actor.getId());
                invitation.setCreatedAt(System.currentTimeMillis());
                invitation.setExpiresAt(System.currentTimeMillis() + 7L * 24 * 60 * 60 * 1000); // 7 days
                
                invitationRepository.create(invitation).onSuccess(inviteId -> {
                    String inviteLink = "https://campusskills.com/invite/" + token;
                    emailService.sendAdminInvitationEmail(targetEmail, targetNewRole.name(), inviteLink);
                    
                    auditLogService.logAction(
                        "INVITE_ADMIN", 
                        actor.getId(), actor.getEmail().split("@")[0], actor.getEmail(),
                        null, targetEmail.split("@")[0], targetEmail,
                        "NONE", targetNewRole.name(), 
                        "Invited external user to be admin", ctx.request().remoteAddress().host()
                    );
                    
                    ApiResponse.ok(ctx, new JsonObject().put("success", true).put("message", "Invitation sent successfully"));
                }).onFailure(err -> {
                    ApiResponse.internalError(ctx, "Failed to create invitation");
                });
            }).onFailure(err -> {
                ApiResponse.internalError(ctx, "Failed to revoke previous invitations");
            });
        }).onFailure(err -> {
            ApiResponse.internalError(ctx, "Failed to check existing user");
        });
    }
'''
content = content.replace('    public void demote(RoutingContext ctx) {', invite_method + '\\n    public void demote(RoutingContext ctx) {')

with open('backend/src/main/java/com/campusskills/modules/admin/handlers/AdminManagementHandler.java', 'w') as f:
    f.write(content)
