package com.campusskills.modules.users.services;

import com.campusskills.modules.users.models.User;
import com.campusskills.modules.users.models.UserProfile;
import com.campusskills.modules.users.models.UserStats;
import com.campusskills.modules.users.models.UserWallet;
import com.campusskills.modules.users.models.UserRole;
import com.campusskills.modules.users.models.RefreshToken;
import com.campusskills.modules.users.repositories.UserRepository;
import com.campusskills.modules.users.repositories.UserProfileRepository;
import com.campusskills.modules.users.repositories.UserStatsRepository;
import com.campusskills.modules.users.repositories.UserWalletRepository;
import com.campusskills.modules.users.repositories.RefreshTokenRepository;
import com.campusskills.modules.users.repositories.SkillVerificationRepository;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.JWTOptions;
import io.vertx.ext.auth.jwt.JWTAuth;
import org.mindrot.jbcrypt.BCrypt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;
import com.campusskills.core.config.Env;

public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    
    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final UserStatsRepository statsRepository;
    private final UserWalletRepository walletRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final com.campusskills.modules.users.repositories.OtpVerificationRepository otpRepository;
    private final com.campusskills.shared.services.EmailService emailService;
        private final com.campusskills.modules.users.repositories.PasswordResetTokenRepository passwordResetTokenRepository = new com.campusskills.modules.users.repositories.PasswordResetTokenRepository();
    private final JWTAuth jwtAuth;
    private final List<String> allowedDomains;
    private final io.vertx.core.eventbus.EventBus eventBus;

    public UserService(UserRepository userRepository, 
                       UserProfileRepository profileRepository,
                       UserStatsRepository statsRepository,
                       UserWalletRepository walletRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       com.campusskills.modules.users.repositories.OtpVerificationRepository otpRepository,
                       com.campusskills.shared.services.EmailService emailService,
                       JWTAuth jwtAuth,
                       List<String> allowedDomains,
                       io.vertx.core.eventbus.EventBus eventBus) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.statsRepository = statsRepository;
        this.walletRepository = walletRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.otpRepository = otpRepository;
        this.emailService = emailService;
        this.jwtAuth = jwtAuth;
        this.allowedDomains = allowedDomains != null ? allowedDomains : new ArrayList<>();
        this.eventBus = eventBus;
    }
    
    private static String deriveRollNoFromEmail(String email) {
        if (email == null || !email.contains("@")) return null;
        return email.substring(0, email.indexOf("@")).toLowerCase();
    }

    private String generateSecureToken() {
        byte[] randomBytes = new byte[32];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
    
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000); // 6 digits
        return String.valueOf(otp);
    }

    public static boolean isSuperAdmin(String email) {
        if (email == null) return false;
        String env = Env.get("SUPER_ADMIN_EMAILS");
        if (env == null || env.trim().isEmpty()) {
            return false;
        }
        String[] admins = env.split(",");
        for (String admin : admins) {
            if (admin.trim().equalsIgnoreCase(email.trim())) return true;
        }
        return false;
    }

    public Future<JsonObject> signup(String email, String password, String name) {
        if (email == null || password == null) {
            return Future.failedFuture("email and password are required");
        }
        
        final String normalizedEmail = email.toLowerCase().trim();
        
        if (password.length() < 6) {
            return Future.failedFuture("Password must be at least 6 characters long");
        }
        
        if (!allowedDomains.isEmpty() && !isSuperAdmin(normalizedEmail)) {
            String[] parts = normalizedEmail.split("@");
            if (parts.length != 2 || !allowedDomains.contains(parts[1].toLowerCase())) {
                return Future.failedFuture("DOMAIN_NOT_ALLOWED");
            }
        }

        return userRepository.findByEmail(normalizedEmail).compose(existing -> {
            if (existing != null) {
                return Future.failedFuture("EMAIL_EXISTS");
            }
            
            User user = new User();
            user.setEmail(normalizedEmail);
            user.setRole(isSuperAdmin(normalizedEmail) ? UserRole.SUPER_ADMIN : UserRole.USER);
            user.setIsActive(true);
            user.setEmailVerified(false);
            user.setPasswordHash(BCrypt.hashpw(password, BCrypt.gensalt()));

            return userRepository.createUser(user).compose(userId -> {
                log.info("[AUTH] Created new user: {} with email: {}", userId, normalizedEmail);
                user.setId(userId);
                
                UserProfile profile = new UserProfile();
                profile.setUserId(userId);
                profile.setName(name != null ? name : normalizedEmail.split("@")[0]);
                profile.setSkillsOffered(new ArrayList<>());
                profile.setSkillsWanted(new ArrayList<>());
                profile.setProfileCompleted(false);

                UserStats stats = new UserStats();
                stats.setUserId(userId);
                stats.setRatingAvg(0.0);
                stats.setRatingCount(0);
                stats.setSessionsCompleted(0);
                stats.setSessionsAttended(0);
                stats.setTotalMinutes(0);

                UserWallet wallet = new UserWallet();
                wallet.setUserId(userId);
                wallet.setBalance(0.0);

                Future<String> profileFut = profileRepository.createProfile(profile);
                Future<String> statsFut = statsRepository.createStats(stats);
                Future<String> walletFut = walletRepository.createWallet(wallet);

                // OTP Generation
                String otp = generateOtp();
                String hashedOtp = BCrypt.hashpw(otp, BCrypt.gensalt());
                com.campusskills.modules.users.models.OtpVerification otpVerification = new com.campusskills.modules.users.models.OtpVerification();
                otpVerification.setUserId(userId);
                otpVerification.setEmail(normalizedEmail);
                otpVerification.setType(com.campusskills.modules.users.models.OtpVerification.TYPE_EMAIL_VERIFICATION);
                otpVerification.setOtpHash(hashedOtp);
                otpVerification.setAttempts(0);
                otpVerification.setExpiresAt(System.currentTimeMillis() + 15 * 60 * 1000L); // 15 mins
                otpVerification.setLastResentAt(System.currentTimeMillis());

                Future<String> otpFut = otpRepository.create(otpVerification)
                    .compose(v -> {
                        emailService.sendOtpEmail(normalizedEmail, otp)
                            .onFailure(err -> log.error("[AUTH] Failed to send OTP email", err));
                        return Future.succeededFuture("otp-sent");
                    });

                // Derive and persist rollNo from email
                String rollNo = deriveRollNoFromEmail(normalizedEmail);
                if (rollNo != null) {
                    profileRepository.updateRollNo(userId, rollNo);
                }

                return CompositeFuture.all(profileFut, statsFut, walletFut, otpFut)
                    .compose(cf -> {
                        // Emit admin notification
                        if (eventBus != null) {
                            JsonObject notificationPayload = new JsonObject()
                                .put("recipientType", "ADMIN")
                                .put("title", "New student registered")
                                .put("message", (name != null ? name : normalizedEmail.split("@")[0]) + " joined CampusSkills.")
                                .put("type", "ADMIN_NEW_STUDENT")
                                .put("sourceType", "USER")
                                .put("sourceId", userId);
                            eventBus.send("internal.notification.create", notificationPayload);
                        }
                        return generateAuthResponse(user, true);
                    });
            });
        });
    }

    public Future<JsonObject> login(String email, String password) {
        if (email == null || password == null) {
            return Future.failedFuture("email and password are required");
        }

        final String normalizedEmail = email.toLowerCase().trim();

        return userRepository.findByEmail(normalizedEmail).compose(user -> {
            if (user == null) {
                if (isSuperAdmin(normalizedEmail)) {
                    log.info("[AUTH] Initiating bootstrap super admin flow: {}", normalizedEmail);
                    
                    String otp = generateOtp();
                    String hashedOtp = BCrypt.hashpw(otp, BCrypt.gensalt());
                    String passwordHash = BCrypt.hashpw(password, BCrypt.gensalt());
                    
                    com.campusskills.modules.users.models.OtpVerification otpVerification = new com.campusskills.modules.users.models.OtpVerification();
                    otpVerification.setUserId(normalizedEmail);
                    otpVerification.setEmail(normalizedEmail);
                    otpVerification.setType(com.campusskills.modules.users.models.OtpVerification.TYPE_BOOTSTRAP_SUPER_ADMIN);
                    otpVerification.setOtpHash(hashedOtp);
                    otpVerification.setAttempts(0);
                    otpVerification.setExpiresAt(System.currentTimeMillis() + 15 * 60 * 1000L); // 15 mins
                    otpVerification.setLastResentAt(System.currentTimeMillis());
                    
                    java.util.Map<String, Object> metadata = new java.util.HashMap<>();
                    metadata.put("passwordHash", passwordHash);
                    otpVerification.setMetadata(metadata);

                    return otpRepository.deleteByUserIdAndType(normalizedEmail, com.campusskills.modules.users.models.OtpVerification.TYPE_BOOTSTRAP_SUPER_ADMIN)
                        .compose(v -> otpRepository.create(otpVerification))
                        .compose(v -> {
                            emailService.sendTwoFactorOtpEmail(normalizedEmail, otp)
                                .onFailure(err -> log.error("[AUTH] Failed to send bootstrap OTP email", err));
                            
                            String accessToken = jwtAuth.generateToken(
                                new io.vertx.core.json.JsonObject()
                                    .put("userId", normalizedEmail)
                                    .put("role", "SUPER_ADMIN")
                                    .put("emailVerified", false)
                                    .put("requiresEmailVerification", true)
                                    .put("twoFactorVerified", false),
                                new JWTOptions().setExpiresInMinutes(15)
                            );
                            
                            io.vertx.core.json.JsonObject userJson = new io.vertx.core.json.JsonObject()
                                .put("id", normalizedEmail)
                                .put("email", normalizedEmail)
                                .put("role", "SUPER_ADMIN")
                                .put("requiresOtp", true);
                                
                            return Future.succeededFuture(new io.vertx.core.json.JsonObject()
                                .put("token", accessToken)
                                .put("user", userJson));
                        });
                }
                return Future.failedFuture("INVALID_CREDENTIALS");
            }

            if (!BCrypt.checkpw(password, user.getPasswordHash())) {
                return Future.failedFuture("INVALID_CREDENTIALS");
            }

            if (user.getIsActive() != null && !user.getIsActive()) {
                return Future.failedFuture("ACCOUNT_SUSPENDED");
            }

            if (isSuperAdmin(user.getEmail()) && user.getRole() != UserRole.SUPER_ADMIN) {
                user.setRole(UserRole.SUPER_ADMIN);
                return userRepository.updateUserRole(user.getId(), UserRole.SUPER_ADMIN)
                    .compose(v -> {
                        boolean isPrivileged = user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.SUPER_ADMIN;
                        triggerAutoOtpIfNeeded(user, isPrivileged);
                        return generateAuthResponse(user, !isPrivileged);
                    });
            }

            boolean isPrivileged = user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.SUPER_ADMIN;
            triggerAutoOtpIfNeeded(user, isPrivileged);
            return generateAuthResponse(user, !isPrivileged);
        });
    }

    private void triggerAutoOtpIfNeeded(User user, boolean isPrivileged) {
        if (isPrivileged) {
            // Send 2FA login OTP
            resendTwoFactorOtp(user.getId()).onFailure(err -> {
                log.debug("[AUTH] Auto-send 2FA OTP during login skipped/failed", err);
            });
            return;
        }

        if (!user.getEmailVerified()) {
            otpRepository.findByUserIdAndType(user.getId(), com.campusskills.modules.users.models.OtpVerification.TYPE_EMAIL_VERIFICATION).onSuccess(verification -> {
                long now = System.currentTimeMillis();
                // Always attempt to resend. The resendOtp method has a built-in 1-minute cooldown 
                // to prevent spam, so it's safe to call it unconditionally here.
                resendOtp(user.getId()).onFailure(err -> {
                    log.debug("[AUTH] Auto-send OTP during login skipped/failed", err);
                });
            }).onFailure(err -> {
                log.error("[AUTH] Error checking OTP status", err);
            });
        }
    }

    public Future<JsonObject> refresh(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.trim().isEmpty()) {
            return Future.failedFuture("MISSING_REFRESH_TOKEN");
        }
        
        String tokenHash = hashToken(rawRefreshToken);
        
        return refreshTokenRepository.findByTokenHash(tokenHash).compose(token -> {
            if (token == null) {
                return Future.failedFuture("INVALID_REFRESH_TOKEN");
            }
            if (token.getExpiresAt() < System.currentTimeMillis()) {
                return refreshTokenRepository.deleteByTokenHash(tokenHash)
                    .compose(v -> Future.failedFuture("EXPIRED_REFRESH_TOKEN"));
            }
            
            return userRepository.findById(token.getUserId()).compose(user -> {
                if (user == null || !user.getIsActive()) {
                    return Future.failedFuture("INVALID_USER");
                }
                
                String accessToken = jwtAuth.generateToken(
                    new JsonObject()
                        .put("userId", user.getId())
                        .put("role", user.getRole().name())
                        .put("emailVerified", user.getEmailVerified())
                        .put("requiresEmailVerification", !user.getEmailVerified())
                        .put("twoFactorVerified", true), // Assume true on refresh
                    new JWTOptions().setExpiresInMinutes(15) // 15 mins
                );
                
                return Future.succeededFuture(new JsonObject().put("token", accessToken));
            });
        });
    }

    public Future<Void> logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.trim().isEmpty()) {
            // Idempotent success if no token is provided to revoke
            return Future.succeededFuture();
        }
        
        String tokenHash = hashToken(rawRefreshToken);
        // We delete the token if it exists. If it doesn't, no error is thrown (idempotent).
        return refreshTokenRepository.deleteByTokenHash(tokenHash);
    }

    public Future<JsonObject> getFullProfile(String userId) {
        Future<User> userFut = userRepository.findById(userId);
        Future<UserProfile> profileFut = profileRepository.findByUserId(userId);
        Future<UserStats> statsFut = statsRepository.findByUserId(userId);
        Future<UserWallet> walletFut = walletRepository.findByUserId(userId);

        SkillVerificationRepository verifRepo = new SkillVerificationRepository();
        Future<List<com.campusskills.modules.users.models.SkillVerification>> verifFut = verifRepo.findByUserId(userId);

        return CompositeFuture.all(userFut, profileFut, statsFut, walletFut, verifFut).map(cf -> {
            User user = cf.resultAt(0);
            UserProfile profile = cf.resultAt(1);
            UserStats stats = cf.resultAt(2);
            UserWallet wallet = cf.resultAt(3);
            List<com.campusskills.modules.users.models.SkillVerification> verifications = cf.resultAt(4);

            if (user == null) {
                log.warn("[AUTH] Failed to fetch profile. User not found for ID: {}", userId);
                throw new RuntimeException("User not found");
            }

            JsonObject response = new JsonObject();
            
            JsonObject userJson = JsonObject.mapFrom(user);
            userJson.remove("passwordHash");
            response.put("user", userJson);
            
            if (profile != null) {
                // Migration-on-read: populate rollNo if missing
                if (profile.getRollNo() == null || profile.getRollNo().isEmpty()) {
                    String derived = deriveRollNoFromEmail(user.getEmail());
                    if (derived != null) {
                        profile.setRollNo(derived);
                        profileRepository.updateRollNo(userId, derived);
                    }
                }

                JsonObject profileJson = JsonObject.mapFrom(profile);
                // Build verificationScores from the most recent passed verifications
                JsonObject scores = new JsonObject();
                for (com.campusskills.modules.users.models.SkillVerification v : verifications) {
                    if (v.getPassed() != null && v.getPassed() && v.getConfidenceScore() != null) {
                        String skill = v.getSkill();
                        Double existing = scores.getDouble(skill);
                        if (existing == null || v.getConfidenceScore() > existing) {
                            scores.put(skill, v.getConfidenceScore());
                        }
                    }
                }
                profileJson.put("verificationScores", scores);
                response.put("profile", profileJson);
            }
            if (stats != null) response.put("stats", JsonObject.mapFrom(stats));
            if (wallet != null) response.put("wallet", JsonObject.mapFrom(wallet));

            return response;
        });
    }

    public Future<JsonObject> getPublicProfileByIdentifier(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            return Future.failedFuture("Identifier is required");
        }
        
        final String cleanIdentifier = identifier.trim().toLowerCase();
        
        Future<User> userFuture;
        if (cleanIdentifier.contains("@")) {
            userFuture = userRepository.findByEmail(cleanIdentifier);
        } else {
            boolean isObjectIdPattern = cleanIdentifier.length() == 24 && cleanIdentifier.matches("^[0-9a-f]+$");
            if (isObjectIdPattern) {
                userFuture = userRepository.findById(cleanIdentifier).compose(user -> {
                    if (user != null) return Future.succeededFuture(user);
                    return profileRepository.findByRollNo(cleanIdentifier).compose(profile -> {
                        if (profile != null) {
                            return userRepository.findById(profile.getUserId());
                        }
                        return userRepository.findByEmailPrefix(cleanIdentifier).compose(u -> {
                            if (u != null) return Future.succeededFuture(u);
                            return userRepository.findByEmail(cleanIdentifier + "@kristujayanti.com");
                        });
                    });
                });
            } else {
                userFuture = profileRepository.findByRollNo(cleanIdentifier).compose(profile -> {
                    if (profile != null) {
                        return userRepository.findById(profile.getUserId());
                    }
                    return userRepository.findByEmailPrefix(cleanIdentifier).compose(u -> {
                        if (u != null) return Future.succeededFuture(u);
                        return userRepository.findByEmail(cleanIdentifier + "@kristujayanti.com");
                    });
                });
            }
        }

        return userFuture.compose(user -> {
            if (user == null) {
                return Future.failedFuture("User not found");
            }
            
            String userId = user.getId();
            Future<UserProfile> profileFut = profileRepository.findByUserId(userId);
            Future<UserStats> statsFut = statsRepository.findByUserId(userId);

            return CompositeFuture.all(profileFut, statsFut).compose(cf -> {
                UserProfile profile = cf.resultAt(0);
                UserStats stats = cf.resultAt(1);

                if (profile == null) {
                    return Future.failedFuture("Profile not found");
                }

                // Migration-on-read: populate rollNo if missing
                if (profile.getRollNo() == null || profile.getRollNo().isEmpty()) {
                    String derived = deriveRollNoFromEmail(user.getEmail());
                    if (derived != null) {
                        profile.setRollNo(derived);
                        profileRepository.updateRollNo(userId, derived);
                    }
                }

                JsonObject response = new JsonObject();
                
                JsonObject profileJson = JsonObject.mapFrom(profile);
                
                // Fallback name if missing
                String pName = profileJson.getString("name");
                if (pName == null || pName.trim().isEmpty()) {
                    String uName = user.getEmail().split("@")[0];
                    profileJson.put("name", uName);
                }

                // Strip sensitive data
                profileJson.remove("phoneNumber");
                profileJson.remove("upi");
                
                response.put("profile", profileJson);
                // Also add top-level name for backward compatibility in some frontend usages
                response.put("name", profileJson.getString("name"));
                response.put("rollNo", profile.getRollNo());
                response.put("createdAt", user.getCreatedAt());
                response.put("emailVerified", user.getEmailVerified());
                
                if (stats != null) {
                    response.put("stats", JsonObject.mapFrom(stats));
                }

                return Future.succeededFuture(response);
            });
        });
    }

    public Future<List<JsonObject>> searchUsers(String query, int limit, String requesterId) {
        Future<List<String>> invisibleFut = requesterId != null ? getInvisibleUsers(requesterId) : Future.succeededFuture(new ArrayList<>());
        
        return invisibleFut.compose(invisibleUsers -> {
            return profileRepository.searchProfilesByName(query, limit).map(profiles -> {
                return profiles.stream()
                    .filter(p -> !invisibleUsers.contains(p.getUserId()) && (requesterId == null || !requesterId.equals(p.getUserId())))
                    .map(p -> {
                        return new JsonObject()
                            .put("id", p.getUserId())
                            .put("displayName", p.getName())
                            .put("course", p.getProgramme());
                    }).collect(java.util.stream.Collectors.toList());
            });
        });
    }

    public Future<JsonObject> verifyEmail(String userId, String otp) {
        if (otp == null || otp.trim().isEmpty()) {
            return Future.failedFuture("OTP is required");
        }

        return otpRepository.findByUserIdAndType(userId, com.campusskills.modules.users.models.OtpVerification.TYPE_EMAIL_VERIFICATION).compose(verification -> {
            if (verification == null) {
                return Future.failedFuture("No pending verification found or OTP has expired");
            }

            if (verification.getAttempts() >= 5) {
                return otpRepository.deleteByUserIdAndType(userId, com.campusskills.modules.users.models.OtpVerification.TYPE_EMAIL_VERIFICATION)
                    .compose(v -> Future.failedFuture("Too many incorrect attempts. Please request a new OTP."));
            }

            if (!BCrypt.checkpw(otp.trim(), verification.getOtpHash())) {
                return otpRepository.incrementAttempts(verification.getId())
                    .compose(v -> Future.failedFuture("Invalid OTP"));
            }

            // OTP is valid
            return userRepository.findById(userId).compose(user -> {
                if (user == null) {
                    return Future.failedFuture("User not found");
                }
                user.setEmailVerified(true);
                return userRepository.updateUser(user).compose(v -> {
                    return otpRepository.deleteByUserIdAndType(userId, com.campusskills.modules.users.models.OtpVerification.TYPE_EMAIL_VERIFICATION).compose(v2 -> {
                        return generateAuthResponse(user, true);
                    });
                });
            });
        });
    }

    public Future<Void> resendOtp(String userId) {
        return userRepository.findById(userId).compose(user -> {
            if (user == null) {
                return Future.failedFuture("User not found");
            }
            if (user.getEmailVerified()) {
                return Future.failedFuture("Email is already verified");
            }

            return otpRepository.findByUserIdAndType(userId, com.campusskills.modules.users.models.OtpVerification.TYPE_EMAIL_VERIFICATION).compose(verification -> {
                long now = System.currentTimeMillis();
                String newOtp = generateOtp();
                String newHash = BCrypt.hashpw(newOtp, BCrypt.gensalt());
                Long newExpiry = now + 15 * 60 * 1000L;

                if (verification != null) {
                    // Check cooldown (1 minute)
                    if (now - verification.getLastResentAt() < 60000) {
                        return Future.failedFuture("Please wait at least 1 minute before requesting a new OTP.");
                    }
                    return otpRepository.updateOtp(verification.getId(), newHash, newExpiry, now)
                        .compose(v -> {
                            emailService.sendOtpEmail(user.getEmail(), newOtp)
                                .onFailure(err -> log.error("[AUTH] Failed to resend OTP email", err));
                            return Future.succeededFuture();
                        });
                } else {
                    // Create new
                    com.campusskills.modules.users.models.OtpVerification newVerification = new com.campusskills.modules.users.models.OtpVerification();
                    newVerification.setUserId(userId);
                    newVerification.setEmail(user.getEmail());
                    newVerification.setType(com.campusskills.modules.users.models.OtpVerification.TYPE_EMAIL_VERIFICATION);
                    newVerification.setOtpHash(newHash);
                    newVerification.setAttempts(0);
                    newVerification.setExpiresAt(newExpiry);
                    newVerification.setLastResentAt(now);

                    return otpRepository.create(newVerification)
                        .compose(v -> {
                            emailService.sendOtpEmail(user.getEmail(), newOtp)
                                .onFailure(err -> log.error("[AUTH] Failed to resend OTP email", err));
                            return Future.succeededFuture();
                        });
                }
            });
        });
    }

    private Future<JsonObject> verifyBootstrapOtp(String email, String otp) {
        return otpRepository.findByUserIdAndType(email, com.campusskills.modules.users.models.OtpVerification.TYPE_BOOTSTRAP_SUPER_ADMIN).compose(verification -> {
            if (verification == null) {
                return Future.failedFuture("No pending verification found or OTP has expired");
            }
            if (verification.getAttempts() >= 5) {
                return otpRepository.deleteByUserIdAndType(email, com.campusskills.modules.users.models.OtpVerification.TYPE_BOOTSTRAP_SUPER_ADMIN)
                    .compose(v -> Future.failedFuture("Too many incorrect attempts. Please request a new OTP."));
            }
            if (!BCrypt.checkpw(otp.trim(), verification.getOtpHash())) {
                return otpRepository.incrementAttempts(verification.getId())
                    .compose(v -> Future.failedFuture("Invalid OTP"));
            }

            // OTP valid!
            return otpRepository.deleteByUserIdAndType(email, com.campusskills.modules.users.models.OtpVerification.TYPE_BOOTSTRAP_SUPER_ADMIN).compose(v -> {
                String passwordHash = (String) verification.getMetadata().get("passwordHash");
                User user = new User();
                user.setEmail(email);
                user.setRole(UserRole.SUPER_ADMIN);
                user.setIsActive(true);
                user.setEmailVerified(true);
                user.setPasswordHash(passwordHash);

                return userRepository.createUser(user).compose(userId -> {
                    log.info("[AUTH] Created new bootstrap super admin: {} with email: {}", userId, email);
                    user.setId(userId);
                    
                    UserProfile profile = new UserProfile();
                    profile.setUserId(userId);
                    profile.setName("Super Admin");
                    profile.setSkillsOffered(new java.util.ArrayList<>());
                    profile.setSkillsWanted(new java.util.ArrayList<>());
                    profile.setProfileCompleted(false);

                    UserStats stats = new UserStats();
                    stats.setUserId(userId);
                    stats.setRatingAvg(0.0);
                    stats.setRatingCount(0);
                    stats.setSessionsCompleted(0);
                    stats.setSessionsAttended(0);
                    stats.setTotalMinutes(0);

                    UserWallet wallet = new UserWallet();
                    wallet.setUserId(userId);
                    wallet.setBalance(0.0);

                    Future<String> profileFut = profileRepository.createProfile(profile);
                    Future<String> statsFut = statsRepository.createStats(stats);
                    Future<String> walletFut = walletRepository.createWallet(wallet);

                    return io.vertx.core.CompositeFuture.all(profileFut, statsFut, walletFut).compose(cf -> {
                        return generateAuthResponse(user, true);
                    });
                });
            });
        });
    }

    public Future<JsonObject> verifyTwoFactorOtp(String userId, String otp) {
        if (userId != null && userId.contains("@")) {
            return verifyBootstrapOtp(userId, otp);
        }

        if (otp == null || otp.trim().isEmpty()) {
            return Future.failedFuture("OTP is required");
        }

        return otpRepository.findByUserIdAndType(userId, com.campusskills.modules.users.models.OtpVerification.TYPE_TWO_FACTOR_LOGIN).compose(verification -> {
            if (verification == null) {
                return Future.failedFuture("No pending verification found or OTP has expired");
            }

            if (verification.getAttempts() >= 5) {
                return otpRepository.deleteByUserIdAndType(userId, com.campusskills.modules.users.models.OtpVerification.TYPE_TWO_FACTOR_LOGIN)
                    .compose(v -> Future.failedFuture("Too many incorrect attempts. Please request a new OTP."));
            }

            if (!BCrypt.checkpw(otp.trim(), verification.getOtpHash())) {
                return otpRepository.incrementAttempts(verification.getId())
                    .compose(v -> Future.failedFuture("Invalid OTP"));
            }

            // OTP is valid
            return userRepository.findById(userId).compose(user -> {
                if (user == null) {
                    return Future.failedFuture("User not found");
                }
                return otpRepository.deleteByUserIdAndType(userId, com.campusskills.modules.users.models.OtpVerification.TYPE_TWO_FACTOR_LOGIN).compose(v2 -> {
                    return generateAuthResponse(user, true);
                });
            });
        });
    }

    private Future<Void> resendBootstrapOtp(String email) {
        return otpRepository.findByUserIdAndType(email, com.campusskills.modules.users.models.OtpVerification.TYPE_BOOTSTRAP_SUPER_ADMIN).compose(verification -> {
            if (verification == null) {
                return Future.failedFuture("No pending bootstrap verification found.");
            }
            long now = System.currentTimeMillis();
            if (now - verification.getLastResentAt() < 60000) {
                return Future.failedFuture("Please wait at least 1 minute before requesting a new OTP.");
            }
            String newOtp = generateOtp();
            String newHash = BCrypt.hashpw(newOtp, BCrypt.gensalt());
            Long newExpiry = now + 15 * 60 * 1000L;

            return otpRepository.updateOtp(verification.getId(), newHash, newExpiry, now)
                .compose(v -> {
                    emailService.sendTwoFactorOtpEmail(email, newOtp)
                        .onFailure(err -> log.error("[AUTH] Failed to resend bootstrap OTP email", err));
                    return Future.succeededFuture();
                });
        });
    }

    public Future<Void> resendTwoFactorOtp(String userId) {
        if (userId != null && userId.contains("@")) {
            return resendBootstrapOtp(userId);
        }

        return userRepository.findById(userId).compose(user -> {
            if (user == null) {
                return Future.failedFuture("User not found");
            }

            return otpRepository.findByUserIdAndType(userId, com.campusskills.modules.users.models.OtpVerification.TYPE_TWO_FACTOR_LOGIN).compose(verification -> {
                long now = System.currentTimeMillis();
                String newOtp = generateOtp();
                String newHash = BCrypt.hashpw(newOtp, BCrypt.gensalt());
                Long newExpiry = now + 15 * 60 * 1000L;

                if (verification != null) {
                    // Check cooldown (1 minute)
                    if (now - verification.getLastResentAt() < 60000) {
                        return Future.failedFuture("Please wait at least 1 minute before requesting a new OTP.");
                    }
                    return otpRepository.updateOtp(verification.getId(), newHash, newExpiry, now)
                        .compose(v -> {
                            emailService.sendTwoFactorOtpEmail(user.getEmail(), newOtp)
                                .onFailure(err -> log.error("[AUTH] Failed to resend 2FA OTP email", err));
                            return Future.succeededFuture();
                        });
                } else {
                    // Create new
                    com.campusskills.modules.users.models.OtpVerification newVerification = new com.campusskills.modules.users.models.OtpVerification();
                    newVerification.setUserId(userId);
                    newVerification.setEmail(user.getEmail());
                    newVerification.setType(com.campusskills.modules.users.models.OtpVerification.TYPE_TWO_FACTOR_LOGIN);
                    newVerification.setOtpHash(newHash);
                    newVerification.setAttempts(0);
                    newVerification.setExpiresAt(newExpiry);
                    newVerification.setLastResentAt(now);

                    return otpRepository.create(newVerification)
                        .compose(v -> {
                            emailService.sendTwoFactorOtpEmail(user.getEmail(), newOtp)
                                .onFailure(err -> log.error("[AUTH] Failed to send 2FA OTP email", err));
                            return Future.succeededFuture();
                        });
                }
            });
        });
    }

    private Future<JsonObject> generateAuthResponse(User user, boolean twoFactorVerified) {
        String accessToken = jwtAuth.generateToken(
            new JsonObject()
                .put("userId", user.getId())
                .put("role", user.getRole().name())
                .put("emailVerified", user.getEmailVerified())
                .put("requiresEmailVerification", !user.getEmailVerified())
                .put("twoFactorVerified", twoFactorVerified),
            new JWTOptions().setExpiresInMinutes(15) // 15 minutes access token
        );
        
        if (!twoFactorVerified) {
            JsonObject userJson = JsonObject.mapFrom(user);
            userJson.remove("passwordHash"); 
            userJson.put("requiresOtp", true);
            
            return Future.succeededFuture(new JsonObject()
                .put("token", accessToken)
                .put("user", userJson));
        }

        String rawRefreshToken = generateSecureToken();
        String tokenHash = hashToken(rawRefreshToken);
        
        RefreshToken rToken = new RefreshToken();
        rToken.setUserId(user.getId());
        rToken.setTokenHash(tokenHash);
        rToken.setExpiresAt(System.currentTimeMillis() + (30L * 24 * 60 * 60 * 1000)); // 30 days

        return refreshTokenRepository.create(rToken).map(v -> {
            JsonObject userJson = JsonObject.mapFrom(user);
            userJson.remove("passwordHash"); 
            userJson.put("requiresOtp", false);
            
            return new JsonObject()
                .put("token", accessToken)
                .put("refreshToken", rawRefreshToken)
                .put("user", userJson);
        });
    }

    public Future<JsonObject> forgotPassword(String email) {
        if (email == null) return Future.failedFuture("Email is required");
        final String normalizedEmail = email.toLowerCase().trim();

        return userRepository.findByEmail(normalizedEmail).compose(user -> {
            if (user == null) {
                return Future.succeededFuture(new JsonObject().put("message", "If an account exists for this email, a verification code has been sent."));
            }

            return otpRepository.findByUserIdAndType(user.getId(), com.campusskills.modules.users.models.OtpVerification.TYPE_PASSWORD_RESET).compose(verification -> {
                long now = System.currentTimeMillis();
                String otp = generateOtp();
                String hashedOtp = BCrypt.hashpw(otp, BCrypt.gensalt());
                Long expiry = now + 15 * 60 * 1000L;

                if (verification != null) {
                    if (now - verification.getLastResentAt() < 60000) {
                        return Future.failedFuture("Please wait at least 1 minute before requesting a new OTP.");
                    }
                    return otpRepository.updateOtp(verification.getId(), hashedOtp, expiry, now)
                        .compose(v -> {
                            emailService.sendPasswordResetOtpEmail(normalizedEmail, otp)
                                .onFailure(err -> log.error("[AUTH] Failed to send Reset OTP email", err));
                            return Future.succeededFuture();
                        })
                        .map(v -> new JsonObject().put("message", "If an account exists for this email, a verification code has been sent."));
                } else {
                    com.campusskills.modules.users.models.OtpVerification newVerification = new com.campusskills.modules.users.models.OtpVerification();
                    newVerification.setUserId(user.getId());
                    newVerification.setEmail(normalizedEmail);
                    newVerification.setType(com.campusskills.modules.users.models.OtpVerification.TYPE_PASSWORD_RESET);
                    newVerification.setOtpHash(hashedOtp);
                    newVerification.setAttempts(0);
                    newVerification.setExpiresAt(expiry);
                    newVerification.setLastResentAt(now);

                    return otpRepository.create(newVerification)
                        .compose(v -> {
                            emailService.sendPasswordResetOtpEmail(normalizedEmail, otp)
                                .onFailure(err -> log.error("[AUTH] Failed to send Reset OTP email", err));
                            return Future.succeededFuture();
                        })
                        .map(v -> new JsonObject().put("message", "If an account exists for this email, a verification code has been sent."));
                }
            });
        });
    }

    public Future<JsonObject> verifyResetOtp(String email, String otp) {
        if (email == null || otp == null) return Future.failedFuture("Email and OTP are required");
        final String normalizedEmail = email.toLowerCase().trim();

        return userRepository.findByEmail(normalizedEmail).compose(user -> {
            if (user == null) return Future.failedFuture("Invalid request");

            return otpRepository.findByUserIdAndType(user.getId(), com.campusskills.modules.users.models.OtpVerification.TYPE_PASSWORD_RESET).compose(verification -> {
                if (verification == null || verification.getExpiresAt() < System.currentTimeMillis()) {
                    return Future.failedFuture("No pending verification found or OTP has expired");
                }
                if (verification.getAttempts() >= 5) {
                    return otpRepository.deleteByUserIdAndType(user.getId(), com.campusskills.modules.users.models.OtpVerification.TYPE_PASSWORD_RESET)
                        .compose(v -> Future.failedFuture("Too many incorrect attempts. Please request a new OTP."));
                }
                if (!BCrypt.checkpw(otp.trim(), verification.getOtpHash())) {
                    return otpRepository.incrementAttempts(verification.getId())
                        .compose(v -> Future.failedFuture("Invalid OTP"));
                }

                return otpRepository.deleteByUserIdAndType(user.getId(), com.campusskills.modules.users.models.OtpVerification.TYPE_PASSWORD_RESET).compose(v -> {
                    String rawToken = generateSecureToken();
                    String tokenHash = hashToken(rawToken);
                    
                    com.campusskills.modules.users.models.PasswordResetToken resetToken = new com.campusskills.modules.users.models.PasswordResetToken();
                    resetToken.setUserId(user.getId());
                    resetToken.setTokenHash(tokenHash);
                    resetToken.setExpiresAt(System.currentTimeMillis() + 15 * 60 * 1000L);

                    return passwordResetTokenRepository.create(resetToken).map(v2 -> {
                        return new JsonObject()
                            .put("message", "OTP verified successfully")
                            .put("resetToken", rawToken);
                    });
                });
            });
        });
    }

    public Future<JsonObject> resetPassword(String token, String newPassword) {
        if (token == null || newPassword == null) return Future.failedFuture("Token and new password are required");

        String tokenHash = hashToken(token);
        return passwordResetTokenRepository.findByTokenHash(tokenHash).compose(resetToken -> {
            if (resetToken == null || resetToken.getExpiresAt() < System.currentTimeMillis()) {
                if (resetToken != null) passwordResetTokenRepository.deleteById(resetToken.getId());
                return Future.failedFuture("Invalid or expired reset token");
            }

            return userRepository.findById(resetToken.getUserId()).compose(user -> {
                if (user == null) return Future.failedFuture("User not found");

                String newHash = BCrypt.hashpw(newPassword, BCrypt.gensalt());
                user.setPasswordHash(newHash);

                return userRepository.updateUser(user).compose(v -> {
                    return passwordResetTokenRepository.deleteByUserId(user.getId()).compose(v2 -> {
                        emailService.sendPasswordChangeConfirmationEmail(user.getEmail())
                            .onFailure(err -> log.error("[AUTH] Failed to send password change confirmation", err));
                        return Future.succeededFuture(new JsonObject().put("message", "Password successfully reset"));
                    });
                });
            });
        });
    }

    public Future<Boolean> blockUser(String userId, String targetUserId) {
        return profileRepository.blockUser(userId, targetUserId);
    }

    public Future<Boolean> unblockUser(String userId, String targetUserId) {
        return profileRepository.unblockUser(userId, targetUserId);
    }

    public Future<List<String>> getInvisibleUsers(String userId) {
        return profileRepository.findByUserId(userId).compose(profile -> {
            List<String> blockedUsers = new ArrayList<>();
            if (profile != null && profile.getBlockedUsers() != null) {
                blockedUsers.addAll(profile.getBlockedUsers());
            }
            return profileRepository.getBlockedByUsers(userId).map(blockedBy -> {
                for (String b : blockedBy) {
                    if (!blockedUsers.contains(b)) blockedUsers.add(b);
                }
                return blockedUsers;
            });
        });
    }
}
