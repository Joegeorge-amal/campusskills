package com.campusskills.modules.admin.handlers;

import com.campusskills.modules.users.models.User;
import com.campusskills.modules.users.models.UserRole;
import com.campusskills.modules.users.services.UserService;
import com.campusskills.modules.users.repositories.UserRepository;
import com.campusskills.modules.users.repositories.UserProfileRepository;
import io.vertx.core.Future;
import java.util.ArrayList;
import java.util.List;

import com.campusskills.modules.admin.services.AuditLogService;
import com.campusskills.modules.admin.utils.RoleWeightUtils;
import com.campusskills.web.response.ApiResponse;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.util.Arrays;
import com.campusskills.modules.admin.models.AdminInvitation;
import com.campusskills.modules.admin.repositories.AdminInvitationRepository;
import com.campusskills.shared.services.EmailService;
import java.util.UUID;

public class AdminManagementHandler {

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final AdminInvitationRepository invitationRepository;
    private final EmailService emailService;
    private final UserProfileRepository userProfileRepository;


    public AdminManagementHandler(UserRepository userRepository, AuditLogService auditLogService, AdminInvitationRepository invitationRepository, EmailService emailService, UserProfileRepository userProfileRepository) {
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
        this.invitationRepository = invitationRepository;
        this.emailService = emailService;
        this.userProfileRepository = userProfileRepository;
    }

    /**
     * Expose frontend capabilities so React stays "dumb" regarding RBAC logic.
     */
    public void getCapabilities(RoutingContext ctx) {
        String authenticatedUserId = ctx.get("authenticatedUserId");
        String roleStr = ctx.get("authenticatedUserRole");
        
        if (authenticatedUserId == null) {
            ApiResponse.unauthorized(ctx, "Access denied");
            return;
        }

        String email;
        User user = ctx.get("user");
        if (user != null) {
            email = user.getEmail();
        } else if (authenticatedUserId.contains("@")) {
            // Bootstrap admin uses email as their userId in the token
            email = authenticatedUserId;
        } else {
            ApiResponse.unauthorized(ctx, "Access denied");
            return;
        }

        boolean isBootstrap = UserService.isSuperAdmin(email);
        UserRole role = roleStr != null ? UserRole.fromString(roleStr) : UserRole.USER;

        JsonObject capabilities = new JsonObject()
            .put("isBootstrap", isBootstrap)
            .put("canPromoteAdmins", isBootstrap || role == UserRole.SUPER_ADMIN)
            .put("canPromoteSuperAdmins", isBootstrap)
            .put("canDemoteSuperAdmins", isBootstrap)
            .put("canSuspendAdmins", isBootstrap || role == UserRole.SUPER_ADMIN)
            .put("canAccessPlatformSettings", isBootstrap || role == UserRole.SUPER_ADMIN);

        ApiResponse.ok(ctx, capabilities);
    }

    public void getStaff(RoutingContext ctx) {
        userRepository.findUsersByRoles(Arrays.asList(UserRole.ADMIN.name(), UserRole.SUPER_ADMIN.name()))
            .onSuccess(users -> {
                JsonArray arr = new JsonArray();
                List<Future> futures = new ArrayList<>();
                for (User u : users) {
                    JsonObject json = JsonObject.mapFrom(u);
                    json.remove("passwordHash");
                    json.put("id", u.getId()); // ensure frontend has .id
                    json.put("isBootstrap", UserService.isSuperAdmin(u.getEmail()));
                    io.vertx.core.json.JsonObject query = new io.vertx.core.json.JsonObject()
                        .put("$or", new io.vertx.core.json.JsonArray()
                            .add(new io.vertx.core.json.JsonObject().put("userId", u.getId()))
                            .add(new io.vertx.core.json.JsonObject().put("userId", new io.vertx.core.json.JsonObject().put("$oid", u.getId())))
                        );
                    Future<Void> fut = com.campusskills.core.database.MongoManager.getClient().findOne("user_profiles", query, null).map(doc -> {
                          if (doc != null) {
                            String n = doc.getString("name");
                            if (n == null || n.trim().isEmpty()) n = doc.getString("displayName");
                            if (n == null || n.trim().isEmpty()) n = doc.getString("fullName");
                            if (n == null || n.trim().isEmpty()) n = doc.getString("firstName");
                            if (n == null) n = "";
                            
                            json.put("firstName", n);
                            json.put("name", n);
                        }
                          arr.add(json);
                          return (Void) null;
                      }).recover(err -> {
                          arr.add(json);
                          return Future.<Void>succeededFuture();
                      });
                    futures.add(fut);
                }
                io.vertx.core.CompositeFuture.all(futures).onComplete(res -> {
                    ApiResponse.ok(ctx, arr);
                });
            })
            .onFailure(err -> {
                ApiResponse.internalError(ctx, "Failed to load staff");
            });
    }

    public void promote(RoutingContext ctx) {
        User actor = ctx.get("user");
        String actorRoleStr = ctx.get("authenticatedUserRole");
        UserRole actorRole = actorRoleStr != null ? UserRole.fromString(actorRoleStr) : UserRole.USER;
        
        JsonObject body = ctx.body().asJsonObject();
        if (body == null || !body.containsKey("targetUserId") || !body.containsKey("targetRole")) {
            ApiResponse.badRequest(ctx, "Missing required fields");
            return;
        }
        
        String targetId = body.getString("targetUserId");
        UserRole targetNewRole = UserRole.fromString(body.getString("targetRole"));
        String reason = body.getString("reason", "No reason provided");
        
        userRepository.findById(targetId).onSuccess(target -> {
            if (target == null) {
                ApiResponse.notFound(ctx, "Target not found");
                return;
            }
            
            if (!RoleWeightUtils.canPromote(actor.getEmail(), actorRole, target.getRole(), targetNewRole, target.getEmail())) {
                ApiResponse.forbidden(ctx, "You do not have permission to promote to this role");
                return;
            }
            
            String previousState = target.getRole() != null ? target.getRole().name() : "USER";
            
            userRepository.promoteUser(targetId, targetNewRole, actor.getId()).onSuccess(updated -> {
                                auditLogService.logAction(
                    "PROMOTE_USER", 
                    actor.getId(), actor.getEmail().split("@")[0], actor.getEmail(),
                    target.getId(), target.getEmail().split("@")[0], target.getEmail(),
                    previousState, targetNewRole.name(), 
                    reason, ctx.request().remoteAddress().host()
                );
                emailService.sendAdminPromotionEmail(target.getEmail(), targetNewRole.name());
                ApiResponse.ok(ctx, new JsonObject().put("success", true));
            }).onFailure(err -> {
                ApiResponse.internalError(ctx, "Failed to promote user");
            });
        });
    }


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
                    String inviteLink = com.campusskills.core.config.Env.getOrDefault("FRONTEND_ORIGIN", "https://campusskills.vercel.app") + "/invite/" + token;
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

    public void demote(RoutingContext ctx) {
        User actor = ctx.get("user");
        String actorRoleStr = ctx.get("authenticatedUserRole");
        UserRole actorRole = actorRoleStr != null ? UserRole.fromString(actorRoleStr) : UserRole.USER;
        
        JsonObject body = ctx.body().asJsonObject();
        if (body == null || !body.containsKey("targetUserId")) {
            ApiResponse.badRequest(ctx, "Missing required fields");
            return;
        }
        
        String targetId = body.getString("targetUserId");
        String reason = body.getString("reason", "No reason provided");
        
        if (actor.getId() != null && actor.getId().equals(targetId)) {
            ApiResponse.badRequest(ctx, "You cannot demote yourself");
            return;
        }
        
        userRepository.findById(targetId).onSuccess(target -> {
            if (target == null) {
                ApiResponse.notFound(ctx, "Target not found");
                return;
            }
            
            if (!RoleWeightUtils.canDemote(actor.getEmail(), actorRole, target.getRole(), target.getEmail())) {
                ApiResponse.forbidden(ctx, "You do not have permission to demote this user");
                return;
            }
            
            String previousState = target.getRole() != null ? target.getRole().name() : "USER";
            UserRole newRole = (target.getRole() == UserRole.SUPER_ADMIN) ? UserRole.ADMIN : UserRole.USER;
            
            Runnable executeDemotion = () -> {
                userRepository.updateUserRole(targetId, newRole).onSuccess(updated -> {
                    auditLogService.logAction(
                        "DEMOTE_USER", 
                        actor.getId(), actor.getEmail().split("@")[0], actor.getEmail(),
                        target.getId(), target.getEmail().split("@")[0], target.getEmail(),
                        previousState, newRole.name(), 
                        reason, ctx.request().remoteAddress().host()
                    );
                    ApiResponse.ok(ctx, new JsonObject().put("success", true));
                }).onFailure(err -> {
                    ApiResponse.internalError(ctx, "Failed to demote user");
                });
            };
            
            if (target.getRole() == UserRole.SUPER_ADMIN) {
                userRepository.countUsersByRole(UserRole.SUPER_ADMIN).onSuccess(count -> {
                    if (count <= 1 && !UserService.isSuperAdmin(target.getEmail())) {
                        ApiResponse.badRequest(ctx, "Cannot demote the last Super Admin in the database");
                        return;
                    }
                    executeDemotion.run();
                }).onFailure(err -> {
                    ApiResponse.internalError(ctx, "Failed to count super admins");
                });
            } else {
                executeDemotion.run();
            }
        });
    }

    public void getAuditLogs(RoutingContext ctx) {
        String q = ctx.request().getParam("q");
        String action = ctx.request().getParam("action");
        String actorId = ctx.request().getParam("actorId");
        String targetId = ctx.request().getParam("targetId");
        
        String startDateStr = ctx.request().getParam("startDate");
        String endDateStr = ctx.request().getParam("endDate");
        Long startDate = startDateStr != null ? Long.parseLong(startDateStr) : null;
        Long endDate = endDateStr != null ? Long.parseLong(endDateStr) : null;
        
        String pageStr = ctx.request().getParam("page");
        String limitStr = ctx.request().getParam("limit");
        int page = pageStr != null ? Integer.parseInt(pageStr) : 1;
        int limit = limitStr != null ? Integer.parseInt(limitStr) : 25; // Default 25

        auditLogService.searchLogs(q, action, actorId, targetId, startDate, endDate, page, limit).onSuccess(logs -> {
            auditLogService.countLogs(q, action, actorId, targetId, startDate, endDate).onSuccess(total -> {
                JsonObject pagination = new JsonObject()
                        .put("total", total)
                        .put("page", page)
                        .put("limit", limit)
                        .put("pages", (int) Math.ceil((double) total / limit));
                
                JsonObject response = new JsonObject()
                        .put("data", new JsonArray(logs.stream().map(JsonObject::mapFrom).toList()))
                        .put("pagination", pagination);
                
                ApiResponse.ok(ctx, response);
            }).onFailure(err -> {
                ApiResponse.internalError(ctx, "Failed to count logs");
            });
        }).onFailure(err -> {
            ApiResponse.internalError(ctx, "Failed to fetch logs");
        });
    }
}
