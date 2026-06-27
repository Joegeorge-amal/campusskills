package com.campusskills.modules.admin.utils;

import com.campusskills.modules.users.models.UserRole;
import com.campusskills.modules.users.services.UserService;

public class RoleWeightUtils {

    /**
     * Get the strict integer weight of a database role.
     */
    public static int getWeight(UserRole role) {
        if (role == null) return 0;
        switch (role) {
            case USER: return 10;
            case ADMIN: return 20;
            case SUPER_ADMIN: return 30;
            default: return 0;
        }
    }

    /**
     * Check if an actor can promote a target to a new role.
     */
    public static boolean canPromote(String actorEmail, UserRole actorRole, UserRole targetCurrentRole, UserRole targetNewRole, String targetEmail) {
        boolean isActorBootstrap = UserService.isSuperAdmin(actorEmail);
        
        // A bootstrap user is effectively weight 99.
        if (isActorBootstrap) {
            return true;
        }

        int actorWeight = getWeight(actorRole);
        int targetCurrentWeight = getWeight(targetCurrentRole);
        int targetNewWeight = getWeight(targetNewRole);

        // Standard rules:
        // Actor must strictly outrank the target's current role
        if (actorWeight <= targetCurrentWeight) return false;
        
        // Actor must strictly outrank the target's NEW role
        // This prevents an ADMIN (20) from promoting a USER (10) to SUPER_ADMIN (30)
        // This also prevents a SUPER_ADMIN (30) from promoting an ADMIN (20) to SUPER_ADMIN (30)
        if (actorWeight <= targetNewWeight) return false;

        return true;
    }

    /**
     * Check if an actor can demote a target.
     */
    public static boolean canDemote(String actorEmail, UserRole actorRole, UserRole targetCurrentRole, String targetEmail) {
        boolean isActorBootstrap = UserService.isSuperAdmin(actorEmail);
        boolean isTargetBootstrap = UserService.isSuperAdmin(targetEmail);
        
        // No one can demote a Bootstrap user (not even another Bootstrap user, to prevent accidental lockout)
        if (isTargetBootstrap) {
            return false;
        }

        // Bootstrap can demote anyone else
        if (isActorBootstrap) {
            return true;
        }

        int actorWeight = getWeight(actorRole);
        int targetCurrentWeight = getWeight(targetCurrentRole);

        // Actor must strictly outrank the target
        return actorWeight > targetCurrentWeight;
    }

    /**
     * Check if an actor can suspend a target.
     * The rules for suspension are identical to demotion.
     */
    public static boolean canSuspend(String actorEmail, UserRole actorRole, UserRole targetCurrentRole, String targetEmail) {
        return canDemote(actorEmail, actorRole, targetCurrentRole, targetEmail);
    }
}
