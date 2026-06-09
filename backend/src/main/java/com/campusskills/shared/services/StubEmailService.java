package com.campusskills.shared.services;

import io.vertx.core.Future;

public class StubEmailService implements EmailService {

    @Override
    public Future<Void> sendOtpEmail(String email, String otp) {
        System.out.println("----------------------------------------");
        System.out.println("EMAIL DELIVERY STUB");
        System.out.println("To: " + email);
        System.out.println("Subject: Your CampusSkills Verification Code");
        System.out.println("Body:");
        System.out.println("OTP for " + email + ": " + otp);
        System.out.println("This code will expire in 15 minutes.");
        System.out.println("----------------------------------------");
        
        return Future.succeededFuture();
    }
}
