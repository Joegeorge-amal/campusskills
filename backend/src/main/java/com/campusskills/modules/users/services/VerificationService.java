package com.campusskills.modules.users.services;

import com.campusskills.modules.users.models.SkillVerification;
import com.campusskills.modules.users.models.VerificationStatus;
import com.campusskills.modules.users.repositories.SkillVerificationRepository;
import io.vertx.core.Future;

import java.util.List;

public class VerificationService {
    private final SkillVerificationRepository repository;
    private static final long COOLDOWN_MS = 7L * 24 * 60 * 60 * 1000; // 7 days

    public VerificationService(SkillVerificationRepository repository) {
        this.repository = repository;
    }

    public Future<SkillVerification> requestVerification(String userId, String skillName) {
        if (skillName == null || skillName.trim().isEmpty()) {
            return Future.failedFuture("Skill name is required");
        }
        
        return repository.findByUserIdAndSkill(userId, skillName.trim()).compose(existing -> {
            long now = System.currentTimeMillis();
            
            for (SkillVerification req : existing) {
                if (req.getStatus() == VerificationStatus.PENDING || req.getStatus() == VerificationStatus.ASSIGNED) {
                    return Future.failedFuture("You already have a pending verification request for this skill.");
                }
                if (req.getStatus() == VerificationStatus.APPROVED) {
                    return Future.failedFuture("You are already verified in this skill.");
                }
                if (req.getStatus() == VerificationStatus.REJECTED) {
                    long diff = now - req.getEvaluatedAt();
                    if (diff < COOLDOWN_MS) {
                        return Future.failedFuture("Please wait 7 days before requesting verification for this skill again.");
                    }
                }
            }
            
            SkillVerification verification = new SkillVerification();
            verification.setUserId(userId);
            verification.setSkillName(skillName.trim());
            verification.setStatus(VerificationStatus.PENDING);
            verification.setRequestedAt(now);
            
            return repository.create(verification).map(id -> {
                verification.setId(id);
                return verification;
            });
        });
    }

    public Future<List<SkillVerification>> getMyRequests(String userId) {
        return repository.findByUserId(userId);
    }
}
