package com.campusskills.shared.services;

import io.vertx.core.Future;

public interface EmailService {
    Future<Void> sendOtpEmail(String email, String otp);
    Future<Void> sendPasswordResetOtpEmail(String email, String otp);
    Future<Void> sendPasswordChangeConfirmationEmail(String email);
}
