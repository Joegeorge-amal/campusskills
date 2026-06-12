package com.campusskills.shared.services;

import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.ext.mail.LoginOption;
import io.vertx.ext.mail.MailClient;
import io.vertx.ext.mail.MailConfig;
import io.vertx.ext.mail.MailMessage;
import io.vertx.ext.mail.MailAttachment;
import io.vertx.core.buffer.Buffer;
import io.vertx.ext.mail.StartTLSOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.campusskills.core.config.Env;

import java.io.File;
import java.nio.file.Files;

public class GmailEmailService implements EmailService {
    private static final Logger log = LoggerFactory.getLogger(GmailEmailService.class);
    private final MailClient mailClient;
    private final String fromName;
    private final String fromAddress;

    public GmailEmailService(Vertx vertx) {
        String host = Env.getOrDefault("SMTP_HOST", "smtp.gmail.com");
        int port = Integer.parseInt(Env.getOrDefault("SMTP_PORT", "587"));
        
        String username = Env.get("SMTP_USERNAME");
        String password = Env.get("SMTP_PASSWORD");
        
        if (username == null || password == null) {
            log.error("CRITICAL: SMTP_USERNAME or SMTP_PASSWORD environment variables are not set.");
        }
        
        this.fromName = Env.getOrDefault("MAIL_FROM_NAME", "CampusSkills");
        this.fromAddress = Env.getOrDefault("MAIL_FROM_ADDRESS", username);

        MailConfig config = new MailConfig()
            .setHostname(host)
            .setPort(port)
            .setStarttls(StartTLSOptions.REQUIRED)
            .setLogin(LoginOption.REQUIRED)
            .setAuthMethods("PLAIN LOGIN")
            .setUsername(username)
            .setPassword(password);

        this.mailClient = MailClient.createShared(vertx, config);
    }

    @Override
    public Future<Void> sendOtpEmail(String email, String otp) {
        String textBody = "CampusSkills\n\nVerify Your Email Address\n\n"
            + "Welcome to CampusSkills. Please use the verification code below to verify ownership of your college email account.\n\n"
            + "Verification Code: " + otp + "\n\n"
            + "Expires in 15 minutes.\n\n"
            + "Security Notice: Never share this verification code with anyone. CampusSkills staff, administrators, evaluators, and support personnel will never ask for your OTP. If you did not request this code, you may safely ignore this email.\n\n"
            + "CampusSkills\nKristu Jayanti (Deemed to be University)\nThis is an automated message.\nPlease do not reply to this email.";

        String htmlBody = "<!DOCTYPE html>"
            + "<html>"
            + "<head>"
            + "<meta charset=\"utf-8\">"
            + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
            + "<meta name=\"color-scheme\" content=\"light dark\">"
            + "<meta name=\"supported-color-schemes\" content=\"light dark\">"
            + "<style>"
            + "  :root { color-scheme: light dark; }"
            + "  body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 25px 0; color: #333; }"
            + "  .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2); border: 1px solid #e0e5e9; }"
            + "  .header { background-color: #f8fafc; background-image: linear-gradient(135deg, rgba(33, 59, 138, 0.04) 0%, rgba(99, 102, 241, 0.08) 100%); padding: 25px 20px; text-align: center; border-bottom: 1px solid rgba(99, 102, 241, 0.1); }"
            + "  .header-table { margin: 0 auto; }"
            + "  .header img { max-height: 44px; display: block; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05)); }"
            + "  .brand-name { font-weight: 800; font-size: 24px; color: #213B8A; letter-spacing: -0.5px; margin: 0; }"
            + "  .brand-accent { color: #6366f1; }"
            + "  .content { padding: 30px 25px; text-align: center; }"
            + "  .title { color: #1a1a1a; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 12px; }"
            + "  .message { font-size: 15px; line-height: 1.5; color: #4a5568; margin-bottom: 25px; }"
            + "  .otp-card { background-color: #f3f4f6; background-image: linear-gradient(135deg, #ebf4ff 0%, #faf5ff 100%); border: 1px dashed #6b46c1; padding: 25px; border-radius: 10px; margin: 0 auto; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1); }"
            + "  .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 6px; color: #213B8A; margin: 0; }"
            + "  .otp-expiry { font-size: 13px; color: #6366f1; margin-top: 10px; font-weight: 600; }"
            + "  .security-notice { background-color: #fffaf0; border-left: 4px solid #dd6b20; padding: 12px; margin-top: 35px; text-align: left; font-size: 12px; color: #652b19; line-height: 1.5; border-radius: 0 8px 8px 0; }"
            + "  .security-notice strong { color: #dd6b20; }"
            + "  .footer { background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #718096; border-top: 1px solid #e2e8f0; }"
            + "  @media (prefers-color-scheme: dark) {"
            + "    body { background-color: #121212 !important; color: #e2e8f0 !important; }"
            + "    .container { background-color: #1e1e1e !important; border-color: #333333 !important; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5) !important; }"
            + "    .header { background-color: #18181b !important; background-image: linear-gradient(135deg, rgba(33, 59, 138, 0.2) 0%, rgba(99, 102, 241, 0.15) 100%) !important; border-bottom-color: #333333 !important; }"
            + "    .header img { filter: drop-shadow(0 0 8px rgba(255,255,255,0.8)) !important; }"
            + "    .brand-name { color: #f8fafc !important; }"
            + "    .brand-accent { color: #818cf8 !important; }"
            + "    .title { color: #f8fafc !important; }"
            + "    .message { color: #cbd5e1 !important; }"
            + "    .otp-card { background-color: #1e1b4b !important; background-image: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%) !important; border-color: #6366f1 !important; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important; }"
            + "    .otp-code { color: #e0e7ff !important; }"
            + "    .otp-expiry { color: #a5b4fc !important; }"
            + "    .security-notice { background-color: rgba(221, 107, 32, 0.1) !important; color: #fed7aa !important; border-left-color: #ea580c !important; }"
            + "    .security-notice strong { color: #fdba74 !important; }"
            + "    .footer { background-color: #18181b !important; border-top-color: #333333 !important; color: #94a3b8 !important; }"
            + "  }"
            + "  [data-ogsc] .container { background-color: #1e1e1e !important; }"
            + "</style>"
            + "</head>"
            + "<body>"
            + "  <div class='container'>"
            + "    <div class='header'>"
            + "      <table class='header-table' role='presentation' border='0' cellpadding='0' cellspacing='0'>"
            + "        <tr>"
            + "          <td style='padding-right: 10px; vertical-align: middle;'>"
            + "            <img src='cid:campus_logo' alt='Logo' />"
            + "          </td>"
            + "          <td style='vertical-align: middle;'>"
            + "            <span class='brand-name'>Campus<span class='brand-accent'>Skills</span></span>"
            + "          </td>"
            + "        </tr>"
            + "      </table>"
            + "    </div>"
            + "    <div class='content'>"
            + "      <h2 class='title'>Verify Your Email Address</h2>"
            + "      <p class='message'>Welcome to CampusSkills. Please use the verification code below to verify ownership of your college email account.</p>"
            + "      <div class='otp-card'>"
            + "        <p class='otp-code'>" + otp + "</p>"
            + "        <p class='otp-expiry'>Expires in 15 minutes</p>"
            + "      </div>"
            + "      <div class='security-notice'>"
            + "        <strong>Security Notice</strong><br><br>"
            + "        Never share this verification code with anyone.<br>"
            + "        CampusSkills staff, administrators, evaluators, and support personnel will never ask for your OTP.<br><br>"
            + "        If you did not request this code, you may safely ignore this email."
            + "      </div>"
            + "    </div>"
            + "    <div class='footer'>"
            + "      CampusSkills<br>Kristu Jayanti (Deemed to be University)<br><br>"
            + "      This is an automated message.<br>Please do not reply to this email."
            + "    </div>"
            + "  </div>"
            + "</body>"
            + "</html>";

        return sendMailInternal(email, "Your CampusSkills Verification Code", textBody, htmlBody);
    }

    @Override
    public Future<Void> sendPasswordResetOtpEmail(String email, String otp) {
        String textBody = "CampusSkills\n\nPassword Reset Request\n\n"
            + "Use the verification code below to reset your password.\n\n"
            + "Verification Code: " + otp + "\n\n"
            + "Expires in 15 minutes.\n\n"
            + "Security Notice: Never share this code with anyone. If you did not request a password reset, you may safely ignore this email.\n\n"
            + "CampusSkills\nKristu Jayanti (Deemed to be University)\nThis is an automated message.\nPlease do not reply to this email.";

        String htmlBody = "<!DOCTYPE html>"
            + "<html>"
            + "<head>"
            + "<meta charset=\"utf-8\">"
            + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
            + "<meta name=\"color-scheme\" content=\"light dark\">"
            + "<meta name=\"supported-color-schemes\" content=\"light dark\">"
            + "<style>"
            + "  :root { color-scheme: light dark; }"
            + "  body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 25px 0; color: #333; }"
            + "  .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2); border: 1px solid #e0e5e9; }"
            + "  .header { background-color: #f8fafc; background-image: linear-gradient(135deg, rgba(33, 59, 138, 0.04) 0%, rgba(99, 102, 241, 0.08) 100%); padding: 25px 20px; text-align: center; border-bottom: 1px solid rgba(99, 102, 241, 0.1); }"
            + "  .header-table { margin: 0 auto; }"
            + "  .header img { max-height: 44px; display: block; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05)); }"
            + "  .brand-name { font-weight: 800; font-size: 24px; color: #213B8A; letter-spacing: -0.5px; margin: 0; }"
            + "  .brand-accent { color: #6366f1; }"
            + "  .content { padding: 30px 25px; text-align: center; }"
            + "  .title { color: #1a1a1a; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 12px; }"
            + "  .message { font-size: 15px; line-height: 1.5; color: #4a5568; margin-bottom: 25px; }"
            + "  .otp-card { background-color: #f3f4f6; background-image: linear-gradient(135deg, #ebf4ff 0%, #faf5ff 100%); border: 1px dashed #6b46c1; padding: 25px; border-radius: 10px; margin: 0 auto; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1); }"
            + "  .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 6px; color: #213B8A; margin: 0; }"
            + "  .otp-expiry { font-size: 13px; color: #6366f1; margin-top: 10px; font-weight: 600; }"
            + "  .security-notice { background-color: #fffaf0; border-left: 4px solid #dd6b20; padding: 12px; margin-top: 35px; text-align: left; font-size: 12px; color: #652b19; line-height: 1.5; border-radius: 0 8px 8px 0; }"
            + "  .security-notice strong { color: #dd6b20; }"
            + "  .footer { background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #718096; border-top: 1px solid #e2e8f0; }"
            + "  @media (prefers-color-scheme: dark) {"
            + "    body { background-color: #121212 !important; color: #e2e8f0 !important; }"
            + "    .container { background-color: #1e1e1e !important; border-color: #333333 !important; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5) !important; }"
            + "    .header { background-color: #18181b !important; background-image: linear-gradient(135deg, rgba(33, 59, 138, 0.2) 0%, rgba(99, 102, 241, 0.15) 100%) !important; border-bottom-color: #333333 !important; }"
            + "    .header img { filter: drop-shadow(0 0 8px rgba(255,255,255,0.8)) !important; }"
            + "    .brand-name { color: #f8fafc !important; }"
            + "    .brand-accent { color: #818cf8 !important; }"
            + "    .title { color: #f8fafc !important; }"
            + "    .message { color: #cbd5e1 !important; }"
            + "    .otp-card { background-color: #1e1b4b !important; background-image: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%) !important; border-color: #6366f1 !important; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important; }"
            + "    .otp-code { color: #e0e7ff !important; }"
            + "    .otp-expiry { color: #a5b4fc !important; }"
            + "    .security-notice { background-color: rgba(221, 107, 32, 0.1) !important; color: #fed7aa !important; border-left-color: #ea580c !important; }"
            + "    .security-notice strong { color: #fdba74 !important; }"
            + "    .footer { background-color: #18181b !important; border-top-color: #333333 !important; color: #94a3b8 !important; }"
            + "  }"
            + "  [data-ogsc] .container { background-color: #1e1e1e !important; }"
            + "</style>"
            + "</head>"
            + "<body>"
            + "  <div class='container'>"
            + "    <div class='header'>"
            + "      <table class='header-table' role='presentation' border='0' cellpadding='0' cellspacing='0'>"
            + "        <tr>"
            + "          <td style='padding-right: 10px; vertical-align: middle;'>"
            + "            <img src='cid:campus_logo' alt='Logo' />"
            + "          </td>"
            + "          <td style='vertical-align: middle;'>"
            + "            <span class='brand-name'>Campus<span class='brand-accent'>Skills</span></span>"
            + "          </td>"
            + "        </tr>"
            + "      </table>"
            + "    </div>"
            + "    <div class='content'>"
            + "      <h2 class='title'>Password Reset Request</h2>"
            + "      <p class='message'>Use the verification code below to reset your password.</p>"
            + "      <div class='otp-card'>"
            + "        <p class='otp-code'>" + otp + "</p>"
            + "        <p class='otp-expiry'>Expires in 15 minutes</p>"
            + "      </div>"
            + "      <div class='security-notice'>"
            + "        <strong>Security Notice</strong><br><br>"
            + "        Never share this code with anyone.<br>"
            + "        If you did not request a password reset, you may safely ignore this email."
            + "      </div>"
            + "    </div>"
            + "    <div class='footer'>"
            + "      CampusSkills<br>Kristu Jayanti (Deemed to be University)<br><br>"
            + "      This is an automated message.<br>Please do not reply to this email."
            + "    </div>"
            + "  </div>"
            + "</body>"
            + "</html>";

        return sendMailInternal(email, "Your CampusSkills Password Reset Code", textBody, htmlBody);
    }

    @Override
    public Future<Void> sendPasswordChangeConfirmationEmail(String email) {
        String textBody = "CampusSkills\n\nYour CampusSkills Password Was Changed\n\n"
            + "Your CampusSkills account password was successfully changed.\n\n"
            + "If you made this change, no action is required.\n\n"
            + "If you did NOT change your password, please contact support immediately and secure your account.\n\n"
            + "CampusSkills\nKristu Jayanti (Deemed to be University)\nThis is an automated message.\nPlease do not reply to this email.";

        String htmlBody = "<!DOCTYPE html>"
            + "<html>"
            + "<head>"
            + "<meta charset=\"utf-8\">"
            + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
            + "<meta name=\"color-scheme\" content=\"light dark\">"
            + "<meta name=\"supported-color-schemes\" content=\"light dark\">"
            + "<style>"
            + "  :root { color-scheme: light dark; }"
            + "  body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 25px 0; color: #333; }"
            + "  .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2); border: 1px solid #e0e5e9; }"
            + "  .header { background-color: #f8fafc; background-image: linear-gradient(135deg, rgba(33, 59, 138, 0.04) 0%, rgba(99, 102, 241, 0.08) 100%); padding: 25px 20px; text-align: center; border-bottom: 1px solid rgba(99, 102, 241, 0.1); }"
            + "  .header-table { margin: 0 auto; }"
            + "  .header img { max-height: 44px; display: block; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05)); }"
            + "  .brand-name { font-weight: 800; font-size: 24px; color: #213B8A; letter-spacing: -0.5px; margin: 0; }"
            + "  .brand-accent { color: #6366f1; }"
            + "  .content { padding: 30px 25px; text-align: center; }"
            + "  .title { color: #1a1a1a; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 12px; }"
            + "  .message { font-size: 15px; line-height: 1.5; color: #4a5568; margin-bottom: 25px; }"
            + "  .security-notice { background-color: #fffaf0; border-left: 4px solid #dd6b20; padding: 12px; margin-top: 35px; text-align: left; font-size: 12px; color: #652b19; line-height: 1.5; border-radius: 0 8px 8px 0; }"
            + "  .security-notice strong { color: #dd6b20; }"
            + "  .footer { background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #718096; border-top: 1px solid #e2e8f0; }"
            + "  @media (prefers-color-scheme: dark) {"
            + "    body { background-color: #121212 !important; color: #e2e8f0 !important; }"
            + "    .container { background-color: #1e1e1e !important; border-color: #333333 !important; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5) !important; }"
            + "    .header { background-color: #18181b !important; background-image: linear-gradient(135deg, rgba(33, 59, 138, 0.2) 0%, rgba(99, 102, 241, 0.15) 100%) !important; border-bottom-color: #333333 !important; }"
            + "    .header img { filter: drop-shadow(0 0 8px rgba(255,255,255,0.8)) !important; }"
            + "    .brand-name { color: #f8fafc !important; }"
            + "    .brand-accent { color: #818cf8 !important; }"
            + "    .title { color: #f8fafc !important; }"
            + "    .message { color: #cbd5e1 !important; }"
            + "    .security-notice { background-color: rgba(221, 107, 32, 0.1) !important; color: #fed7aa !important; border-left-color: #ea580c !important; }"
            + "    .security-notice strong { color: #fdba74 !important; }"
            + "    .footer { background-color: #18181b !important; border-top-color: #333333 !important; color: #94a3b8 !important; }"
            + "  }"
            + "  [data-ogsc] .container { background-color: #1e1e1e !important; }"
            + "</style>"
            + "</head>"
            + "<body>"
            + "  <div class='container'>"
            + "    <div class='header'>"
            + "      <table class='header-table' role='presentation' border='0' cellpadding='0' cellspacing='0'>"
            + "        <tr>"
            + "          <td style='padding-right: 10px; vertical-align: middle;'>"
            + "            <img src='cid:campus_logo' alt='Logo' />"
            + "          </td>"
            + "          <td style='vertical-align: middle;'>"
            + "            <span class='brand-name'>Campus<span class='brand-accent'>Skills</span></span>"
            + "          </td>"
            + "        </tr>"
            + "      </table>"
            + "    </div>"
            + "    <div class='content'>"
            + "      <h2 class='title'>Your CampusSkills Password Was Changed</h2>"
            + "      <p class='message'>Your CampusSkills account password was successfully changed.</p>"
            + "      <p class='message'>If you made this change, no action is required.</p>"
            + "      <div class='security-notice'>"
            + "        <strong>Security Notice</strong><br><br>"
            + "        If you did NOT change your password, please contact support immediately and secure your account."
            + "      </div>"
            + "    </div>"
            + "    <div class='footer'>"
            + "      CampusSkills<br>Kristu Jayanti (Deemed to be University)<br><br>"
            + "      This is an automated message.<br>Please do not reply to this email."
            + "    </div>"
            + "  </div>"
            + "</body>"
            + "</html>";

        return sendMailInternal(email, "Your CampusSkills Password Was Changed", textBody, htmlBody);
    }

    @Override
    public Future<Void> sendTwoFactorOtpEmail(String email, String otp) {
        String textBody = "CampusSkills\n\nAdmin Two-Factor Authentication\n\n"
            + "Please use the verification code below to log in to your admin account.\n\n"
            + "Verification Code: " + otp + "\n\n"
            + "Expires in 15 minutes.\n\n"
            + "Security Notice: Never share this verification code with anyone.\n\n"
            + "CampusSkills\nKristu Jayanti (Deemed to be University)\nThis is an automated message.\nPlease do not reply to this email.";

        String htmlBody = "<!DOCTYPE html>"
            + "<html>"
            + "<head>"
            + "<meta charset=\"utf-8\">"
            + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
            + "<meta name=\"color-scheme\" content=\"light dark\">"
            + "<meta name=\"supported-color-schemes\" content=\"light dark\">"
            + "<style>"
            + "  :root { color-scheme: light dark; }"
            + "  body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 25px 0; color: #333; }"
            + "  .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2); border: 1px solid #e0e5e9; }"
            + "  .header { background-color: #f8fafc; background-image: linear-gradient(135deg, rgba(33, 59, 138, 0.04) 0%, rgba(99, 102, 241, 0.08) 100%); padding: 25px 20px; text-align: center; border-bottom: 1px solid rgba(99, 102, 241, 0.1); }"
            + "  .header-table { margin: 0 auto; }"
            + "  .header img { max-height: 44px; display: block; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05)); }"
            + "  .brand-name { font-weight: 800; font-size: 24px; color: #213B8A; letter-spacing: -0.5px; margin: 0; }"
            + "  .brand-accent { color: #6366f1; }"
            + "  .content { padding: 30px 25px; text-align: center; }"
            + "  .title { color: #1a1a1a; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 12px; }"
            + "  .message { font-size: 15px; line-height: 1.5; color: #4a5568; margin-bottom: 25px; }"
            + "  .otp-card { background-color: #f3f4f6; background-image: linear-gradient(135deg, #ebf4ff 0%, #faf5ff 100%); border: 1px dashed #6b46c1; padding: 25px; border-radius: 10px; margin: 0 auto; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1); }"
            + "  .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 6px; color: #213B8A; margin: 0; }"
            + "  .otp-expiry { font-size: 13px; color: #6366f1; margin-top: 10px; font-weight: 600; }"
            + "  .security-notice { background-color: #fffaf0; border-left: 4px solid #dd6b20; padding: 12px; margin-top: 35px; text-align: left; font-size: 12px; color: #652b19; line-height: 1.5; border-radius: 0 8px 8px 0; }"
            + "  .security-notice strong { color: #dd6b20; }"
            + "  .footer { background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #718096; border-top: 1px solid #e2e8f0; }"
            + "  @media (prefers-color-scheme: dark) {"
            + "    body { background-color: #121212 !important; color: #e2e8f0 !important; }"
            + "    .container { background-color: #1e1e1e !important; border-color: #333333 !important; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5) !important; }"
            + "    .header { background-color: #18181b !important; background-image: linear-gradient(135deg, rgba(33, 59, 138, 0.2) 0%, rgba(99, 102, 241, 0.15) 100%) !important; border-bottom-color: #333333 !important; }"
            + "    .header img { filter: drop-shadow(0 0 8px rgba(255,255,255,0.8)) !important; }"
            + "    .brand-name { color: #f8fafc !important; }"
            + "    .brand-accent { color: #818cf8 !important; }"
            + "    .title { color: #f8fafc !important; }"
            + "    .message { color: #cbd5e1 !important; }"
            + "    .otp-card { background-color: #1e1b4b !important; background-image: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%) !important; border-color: #6366f1 !important; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important; }"
            + "    .otp-code { color: #e0e7ff !important; }"
            + "    .otp-expiry { color: #a5b4fc !important; }"
            + "    .security-notice { background-color: rgba(221, 107, 32, 0.1) !important; color: #fed7aa !important; border-left-color: #ea580c !important; }"
            + "    .security-notice strong { color: #fdba74 !important; }"
            + "    .footer { background-color: #18181b !important; border-top-color: #333333 !important; color: #94a3b8 !important; }"
            + "  }"
            + "  [data-ogsc] .container { background-color: #1e1e1e !important; }"
            + "</style>"
            + "</head>"
            + "<body>"
            + "  <div class='container'>"
            + "    <div class='header'>"
            + "      <table class='header-table' role='presentation' border='0' cellpadding='0' cellspacing='0'>"
            + "        <tr>"
            + "          <td style='padding-right: 10px; vertical-align: middle;'>"
            + "            <img src='cid:campus_logo' alt='Logo' />"
            + "          </td>"
            + "          <td style='vertical-align: middle;'>"
            + "            <span class='brand-name'>Campus<span class='brand-accent'>Skills</span></span>"
            + "          </td>"
            + "        </tr>"
            + "      </table>"
            + "    </div>"
            + "    <div class='content'>"
            + "      <h2 class='title'>Admin Login Verification</h2>"
            + "      <p class='message'>Please use the verification code below to log in to your admin account.</p>"
            + "      <div class='otp-card'>"
            + "        <p class='otp-code'>" + otp + "</p>"
            + "        <p class='otp-expiry'>Expires in 15 minutes</p>"
            + "      </div>"
            + "      <div class='security-notice'>"
            + "        <strong>Security Notice</strong><br><br>"
            + "        Never share this verification code with anyone.<br>"
            + "      </div>"
            + "    </div>"
            + "    <div class='footer'>"
            + "      CampusSkills<br>Kristu Jayanti (Deemed to be University)<br><br>"
            + "      This is an automated message.<br>Please do not reply to this email."
            + "    </div>"
            + "  </div>"
            + "</body>"
            + "</html>";

        return sendMailInternal(email, "Your Admin Login Code", textBody, htmlBody);
    }

    private Future<Void> sendMailInternal(String email, String subject, String textBody, String htmlBody) {
        MailMessage message = new MailMessage()
            .setFrom(fromName + " <" + fromAddress + ">")
            .setTo(email)
            .setSubject(subject)
            .setText(textBody)
            .setHtml(htmlBody);

        try {
            File logoFile = new File("../docs/assets/kju_campus_logo.png");
            if (!logoFile.exists()) {
                logoFile = new File("docs/assets/kju_campus_logo.png");
            }
            if (logoFile.exists()) {
                byte[] logoBytes = Files.readAllBytes(logoFile.toPath());
                MailAttachment attachment = MailAttachment.create()
                    .setData(Buffer.buffer(logoBytes))
                    .setContentType("image/png")
                    .setDisposition("inline")
                    .setContentId("<campus_logo>");
                message.setInlineAttachment(java.util.Collections.singletonList(attachment));
            } else {
                log.warn("Logo file not found for email template.");
            }
        } catch (Exception e) {
            log.error("Failed to attach logo to email", e);
        }

        return mailClient.sendMail(message)
            .onSuccess(result -> {
                System.out.println("=================================================");
                System.out.println("[SMTP SUCCESS] Email successfully accepted by Gmail!");
                System.out.println("Message ID: " + result.getMessageID());
                System.out.println("Recipients: " + result.getRecipients());
                System.out.println("=================================================");
            })
            .onFailure(err -> {
                System.err.println("=================================================");
                System.err.println("[SMTP FATAL ERROR] Failed to send email!");
                System.err.println("Error details: " + err.getMessage());
                System.err.println("Please check your SMTP_USERNAME and App Password!");
                System.err.println("=================================================");
                err.printStackTrace();
            })
            .mapEmpty();
    }
}
