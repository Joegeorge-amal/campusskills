package com.campusskills.shared.services;

import io.vertx.core.Future;

public class StubEmailService implements EmailService {

    @Override
    public Future<Void> sendOtpEmail(String email, String otp) {
        System.out.println("STUB: Sending OTP " + otp + " to " + email);
        return Future.succeededFuture();
    }

    @Override
    public Future<Void> sendPasswordResetOtpEmail(String email, String otp) {
        System.out.println("STUB: Sending Password Reset OTP " + otp + " to " + email);
        return Future.succeededFuture();
    }

    @Override
    public Future<Void> sendPasswordChangeConfirmationEmail(String email) {
        System.out.println("STUB: Sending Password Change Confirmation to " + email);
        return Future.succeededFuture();
    }

    @Override
    public Future<Void> sendTwoFactorOtpEmail(String email, String otp) {
        System.out.println("STUB: Sending 2FA OTP " + otp + " to " + email);
        return Future.succeededFuture();
    }
}
