package com.campusskills.shared.services;

import io.vertx.core.Future;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class StubEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(StubEmailService.class);

    @Override
    public Future<Void> sendOtpEmail(String email, String otp) {
        log.info("STUB: Sending OTP {} to {}", otp, email);
        return Future.succeededFuture();
    }

    @Override
    public Future<Void> sendPasswordResetOtpEmail(String email, String otp) {
        log.info("STUB: Sending Password Reset OTP {} to {}", otp, email);
        return Future.succeededFuture();
    }

    @Override
    public Future<Void> sendPasswordChangeConfirmationEmail(String email) {
        log.info("STUB: Sending Password Change Confirmation to {}", email);
        return Future.succeededFuture();
    }

    @Override
    public Future<Void> sendTwoFactorOtpEmail(String email, String otp) {
        log.info("STUB: Sending 2FA OTP {} to {}", otp, email);
        return Future.succeededFuture();
    }
}
