package com.campusskills.modules.admin.handlers;

import com.campusskills.modules.admin.models.AdminInvitation;
import com.campusskills.modules.admin.repositories.AdminInvitationRepository;
import com.campusskills.modules.users.models.OtpVerification;
import com.campusskills.modules.users.models.User;
import com.campusskills.modules.users.models.UserProfile;
import com.campusskills.modules.users.models.UserRole;
import com.campusskills.modules.users.models.UserStats;
import com.campusskills.modules.users.models.UserWallet;
import com.campusskills.modules.users.repositories.OtpVerificationRepository;
import com.campusskills.modules.users.repositories.UserProfileRepository;
import com.campusskills.modules.users.repositories.UserRepository;
import com.campusskills.modules.users.repositories.UserStatsRepository;
import com.campusskills.modules.users.repositories.UserWalletRepository;
import com.campusskills.shared.services.EmailService;
import com.campusskills.web.response.ApiResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.util.Random;
import org.mindrot.jbcrypt.BCrypt;

public class AdminInvitationAuthHandler {

    private final AdminInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final UserStatsRepository statsRepository;
    private final UserWalletRepository walletRepository;
    private final OtpVerificationRepository otpRepository;
    private final EmailService emailService;

    public AdminInvitationAuthHandler(
            AdminInvitationRepository invitationRepository,
            UserRepository userRepository,
            UserProfileRepository profileRepository,
            UserStatsRepository statsRepository,
            UserWalletRepository walletRepository,
            OtpVerificationRepository otpRepository,
            EmailService emailService) {
        this.invitationRepository = invitationRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.statsRepository = statsRepository;
        this.walletRepository = walletRepository;
        this.otpRepository = otpRepository;
        this.emailService = emailService;
    }

    public void validateToken(RoutingContext ctx) {
        String token = ctx.pathParam("token");
        if (token == null || token.isEmpty()) {
            ApiResponse.badRequest(ctx, "Token is required");
            return;
        }

        invitationRepository.findByToken(token).onSuccess(invitation -> {
            if (invitation == null) {
                ApiResponse.notFound(ctx, "Invalid or expired invitation");
                return;
            }

            if (!AdminInvitation.STATUS_PENDING.equals(invitation.getStatus())) {
                ApiResponse.badRequest(ctx, "This invitation has already been " + invitation.getStatus().toLowerCase());
                return;
            }

            if (System.currentTimeMillis() > invitation.getExpiresAt()) {
                invitationRepository.updateStatus(invitation.getId(), AdminInvitation.STATUS_EXPIRED);
                ApiResponse.badRequest(ctx, "This invitation has expired");
                return;
            }

            // Return safe metadata (e.g., email to show the user)
            ApiResponse.ok(ctx, new JsonObject()
                    .put("email", invitation.getEmail())
                    .put("role", invitation.getRole()));
        }).onFailure(err -> ApiResponse.internalError(ctx, "Failed to validate invitation"));
    }

    public void setupAccount(RoutingContext ctx) {
        String token = ctx.pathParam("token");
        JsonObject body = ctx.body().asJsonObject();
        
        if (body == null || !body.containsKey("fullName") || !body.containsKey("password")) {
            ApiResponse.badRequest(ctx, "Full name and password are required");
            return;
        }

        invitationRepository.findByToken(token).onSuccess(invitation -> {
            if (invitation == null || !AdminInvitation.STATUS_PENDING.equals(invitation.getStatus())) {
                ApiResponse.badRequest(ctx, "Invalid invitation");
                return;
            }
            if (System.currentTimeMillis() > invitation.getExpiresAt()) {
                ApiResponse.badRequest(ctx, "This invitation has expired");
                return;
            }

            // Generate OTP
            String otp = String.format("%06d", new Random().nextInt(999999));
            long expiresAt = System.currentTimeMillis() + (15 * 60 * 1000); // 15 mins

            // Delete existing OTPs
            otpRepository.deleteByEmailAndType(invitation.getEmail(), OtpVerification.TYPE_ADMIN_INVITATION)
                .compose(v -> {
                    OtpVerification otpDoc = new OtpVerification();
                    otpDoc.setEmail(invitation.getEmail());
                    otpDoc.setOtpHash(BCrypt.hashpw(otp, BCrypt.gensalt())); // Hash the OTP
                    otpDoc.setType(OtpVerification.TYPE_ADMIN_INVITATION);
                    otpDoc.setExpiresAt(expiresAt);
                    // Store the setup payload in metadata so we can create the user upon verification
                    JsonObject metadata = new JsonObject()
                            .put("fullName", body.getString("fullName"))
                            .put("password", BCrypt.hashpw(body.getString("password"), BCrypt.gensalt()))
                            .put("token", token);
                    otpDoc.setMetadata(metadata.getMap());
                    
                    return otpRepository.create(otpDoc);
                })
                .compose(v -> emailService.sendOtpEmail(invitation.getEmail(), otp))
                .onSuccess(v -> ApiResponse.ok(ctx, new JsonObject().put("success", true).put("message", "OTP sent to email")))
                .onFailure(err -> ApiResponse.internalError(ctx, "Failed to send OTP"));

        }).onFailure(err -> ApiResponse.internalError(ctx, "Failed to process request"));
    }

    public void verifyAndCreate(RoutingContext ctx) {
        JsonObject body = ctx.body().asJsonObject();
        String token = body.getString("token");
        String otp = body.getString("otp");

        if (token == null || otp == null) {
            ApiResponse.badRequest(ctx, "Token and OTP are required");
            return;
        }

        invitationRepository.findByToken(token).onSuccess(invitation -> {
            if (invitation == null || !AdminInvitation.STATUS_PENDING.equals(invitation.getStatus())) {
                ApiResponse.badRequest(ctx, "Invalid invitation");
                return;
            }

            otpRepository.findByEmailAndType(invitation.getEmail(), OtpVerification.TYPE_ADMIN_INVITATION)
                .onSuccess(otpDoc -> {
                    if (otpDoc == null || otpDoc.getExpiresAt() < System.currentTimeMillis()) {
                        ApiResponse.badRequest(ctx, "OTP has expired or is invalid");
                        return;
                    }

                    if (!BCrypt.checkpw(otp, otpDoc.getOtpHash())) {
                        ApiResponse.badRequest(ctx, "Invalid OTP");
                        return;
                    }
                    
                    JsonObject metadata = new JsonObject((java.util.Map<String, Object>) otpDoc.getMetadata());
                    if (metadata == null || !token.equals(metadata.getString("token"))) {
                        ApiResponse.badRequest(ctx, "Invalid metadata");
                        return;
                    }

                    // Proceed to create user
                    String hashedPassword = metadata.getString("password");
                    String fullName = metadata.getString("fullName");
                    UserRole role = UserRole.fromString(invitation.getRole());

                    User user = new User();
                    user.setEmail(invitation.getEmail());
                    user.setPasswordHash(hashedPassword);
                    user.setRole(role);
                    user.setEmailVerified(true);
                    user.setCreatedAt(System.currentTimeMillis());
                    user.setUpdatedAt(System.currentTimeMillis());
                    // user.setReputation(0);
                    // user.setStrikes(0);

                    userRepository.createUser(user).compose(userId -> {
                        // Create related docs
                        UserProfile profile = new UserProfile();
                        profile.setUserId(userId);
                        profile.setName(fullName);
                        profile.setBio("CampusSkills Administrator");
                        
                        UserStats stats = new UserStats();
                        stats.setUserId(userId);

                        UserWallet wallet = new UserWallet();
                        wallet.setUserId(userId);
                        wallet.setBalance(100.0); // Start with 100 points
                        
                        // Mark invitation as USED
                        invitationRepository.updateStatus(invitation.getId(), AdminInvitation.STATUS_USED);
                        // Delete OTP
                        otpRepository.deleteByEmailAndType(invitation.getEmail(), OtpVerification.TYPE_ADMIN_INVITATION);

                        return profileRepository.createProfile(profile)
                                .compose(v -> statsRepository.createStats(stats))
                                .compose(v -> walletRepository.createWallet(wallet));
                    }).onSuccess(v -> {
                        ApiResponse.ok(ctx, new JsonObject().put("success", true).put("message", "Account created successfully"));
                    }).onFailure(err -> {
                        ApiResponse.internalError(ctx, "Failed to create account");
                    });

                }).onFailure(err -> ApiResponse.internalError(ctx, "Failed to verify OTP"));
        }).onFailure(err -> ApiResponse.internalError(ctx, "Failed to validate invitation"));
    }
}
