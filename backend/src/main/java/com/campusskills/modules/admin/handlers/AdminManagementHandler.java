package com.campusskills.modules.admin.handlers;

import com.campusskills.modules.users.models.User;
import com.campusskills.modules.users.models.UserRole;
import com.campusskills.modules.users.services.UserService;
import com.campusskills.modules.users.repositories.UserRepository;
import com.campusskills.modules.admin.services.AuditLogService;
import com.campusskills.modules.admin.utils.RoleWeightUtils;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.util.Arrays;

public class AdminManagementHandler {

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public AdminManagementHandler(UserRepository userRepository, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    /**
     * Expose frontend capabilities so React stays "dumb" regarding RBAC logic.
     */
    public void getCapabilities(RoutingContext ctx) {
        String authenticatedUserId = ctx.get("authenticatedUserId");
        String roleStr = ctx.get("authenticatedUserRole");
        
        if (authenticatedUserId == null) {
            ctx.response().setStatusCode(401).end();
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
            ctx.response().setStatusCode(401).end();
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

        ctx.response()
            .putHeader("content-type", "application/json")
            .end(capabilities.encode());
    }

    public void getStaff(RoutingContext ctx) {
        userRepository.findUsersByRoles(Arrays.asList(UserRole.ADMIN.name(), UserRole.SUPER_ADMIN.name()))
            .onSuccess(users -> {
                JsonArray arr = new JsonArray();
                for (User u : users) {
                    JsonObject json = JsonObject.mapFrom(u);
                    json.remove("passwordHash");
                    json.put("isBootstrap", UserService.isSuperAdmin(u.getEmail()));
                    arr.add(json);
                }
                ctx.response().putHeader("content-type", "application/json").end(arr.encode());
            })
            .onFailure(err -> {
                ctx.response().setStatusCode(500).end();
            });
    }

    public void promote(RoutingContext ctx) {
        User actor = ctx.get("user");
        String actorRoleStr = ctx.get("authenticatedUserRole");
        UserRole actorRole = actorRoleStr != null ? UserRole.fromString(actorRoleStr) : UserRole.USER;
        
        JsonObject body = ctx.body().asJsonObject();
        if (body == null || !body.containsKey("targetUserId") || !body.containsKey("targetRole")) {
            ctx.response().setStatusCode(400).end(new JsonObject().put("error", "Missing required fields").encode());
            return;
        }
        
        String targetId = body.getString("targetUserId");
        UserRole targetNewRole = UserRole.fromString(body.getString("targetRole"));
        String reason = body.getString("reason", "No reason provided");
        
        userRepository.findById(targetId).onSuccess(target -> {
            if (target == null) {
                ctx.response().setStatusCode(404).end(new JsonObject().put("error", "Target not found").encode());
                return;
            }
            
            if (!RoleWeightUtils.canPromote(actor.getEmail(), actorRole, target.getRole(), targetNewRole, target.getEmail())) {
                ctx.response().setStatusCode(403).end(new JsonObject().put("error", "You do not have permission to promote to this role").encode());
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
                ctx.response().setStatusCode(200).end(new JsonObject().put("success", true).encode());
            }).onFailure(err -> {
                ctx.response().setStatusCode(500).end();
            });
        });
    }

    public void demote(RoutingContext ctx) {
        User actor = ctx.get("user");
        String actorRoleStr = ctx.get("authenticatedUserRole");
        UserRole actorRole = actorRoleStr != null ? UserRole.fromString(actorRoleStr) : UserRole.USER;
        
        JsonObject body = ctx.body().asJsonObject();
        if (body == null || !body.containsKey("targetUserId")) {
            ctx.response().setStatusCode(400).end(new JsonObject().put("error", "Missing required fields").encode());
            return;
        }
        
        String targetId = body.getString("targetUserId");
        String reason = body.getString("reason", "No reason provided");
        
        if (actor.getId() != null && actor.getId().equals(targetId)) {
            ctx.response().setStatusCode(400).end(new JsonObject().put("error", "You cannot demote yourself").encode());
            return;
        }
        
        userRepository.findById(targetId).onSuccess(target -> {
            if (target == null) {
                ctx.response().setStatusCode(404).end(new JsonObject().put("error", "Target not found").encode());
                return;
            }
            
            if (!RoleWeightUtils.canDemote(actor.getEmail(), actorRole, target.getRole(), target.getEmail())) {
                ctx.response().setStatusCode(403).end(new JsonObject().put("error", "You do not have permission to demote this user").encode());
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
                    ctx.response().setStatusCode(200).end(new JsonObject().put("success", true).encode());
                }).onFailure(err -> {
                    ctx.response().setStatusCode(500).end();
                });
            };
            
            if (target.getRole() == UserRole.SUPER_ADMIN) {
                userRepository.countUsersByRole(UserRole.SUPER_ADMIN).onSuccess(count -> {
                    if (count <= 1 && !UserService.isSuperAdmin(target.getEmail())) {
                        ctx.response().setStatusCode(400).end(new JsonObject().put("error", "Cannot demote the last Super Admin in the database").encode());
                        return;
                    }
                    executeDemotion.run();
                }).onFailure(err -> {
                    ctx.response().setStatusCode(500).end();
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
                
                ctx.response().putHeader("content-type", "application/json").end(response.encode());
            }).onFailure(err -> {
                ctx.response().setStatusCode(500).end();
            });
        }).onFailure(err -> {
            ctx.response().setStatusCode(500).end();
        });
    }
}
