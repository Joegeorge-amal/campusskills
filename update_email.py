import re

with open('backend/src/main/java/com/campusskills/shared/services/GmailEmailService.java', 'r') as f:
    content = f.read()

# We will create a getBaseHtml method
base_html_method = '''
    private String getBaseHtml(String title, String innerHtml) {
        return "<!DOCTYPE html>"
            + "<html>"
            + "<head>"
            + "<meta charset=\\"utf-8\\">"
            + "<meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\">"
            + "<meta name=\\"color-scheme\\" content=\\"light dark\\">"
            + "<meta name=\\"supported-color-schemes\\" content=\\"light dark\\">"
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
            + "      <h2 class='title'>" + title + "</h2>"
            + innerHtml
            + "    </div>"
            + "    <div class='footer'>"
            + "      CampusSkills<br>Kristu Jayanti (Deemed to be University)<br><br>"
            + "      This is an automated message.<br>Please do not reply to this email."
            + "    </div>"
            + "  </div>"
            + "</body>"
            + "</html>";
    }
'''

new_methods = '''
    @Override
    public Future<Void> sendAdminPromotionEmail(String email, String role) {
        String textBody = "CampusSkills\\n\\nYou have been promoted\\n\\n"
            + "You have been promoted to " + role + " on CampusSkills.\\n\\n"
            + "You can now sign in through the Admin Login using your existing account credentials.\\n"
            + "No further setup is required.\\n\\n"
            + "CampusSkills\\nKristu Jayanti (Deemed to be University)\\nThis is an automated message.\\nPlease do not reply to this email.";

        String innerHtml = "<p class='message'>You have been promoted to <strong>" + role + "</strong> on CampusSkills.</p>"
            + "<p class='message'>You can now sign in through the Admin Login using your existing account credentials.</p>"
            + "<a href='https://campusskills.com/admin/login' style='display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 10px;'>Access Admin Portal</a>"
            + "<div class='security-notice'>"
            + "  <strong>Notice</strong><br><br>"
            + "  You do NOT need to create a new account. Your existing email and password remain unchanged."
            + "</div>";

        String htmlBody = getBaseHtml("You have been promoted to Administrator", innerHtml);
        return sendMailInternal(email, "You have been promoted on CampusSkills", textBody, htmlBody);
    }

    @Override
    public Future<Void> sendAdminInvitationEmail(String email, String role, String inviteLink) {
        String textBody = "CampusSkills\\n\\nAdministrator Invitation\\n\\n"
            + "You have been invited to become an " + role + " on CampusSkills.\\n\\n"
            + "Please click the link below to accept your invitation and set up your account:\\n"
            + inviteLink + "\\n\\n"
            + "This invitation link is valid for 7 days.\\n\\n"
            + "CampusSkills\\nKristu Jayanti (Deemed to be University)\\nThis is an automated message.\\nPlease do not reply to this email.";

        String innerHtml = "<p class='message'>You have been invited to become an <strong>" + role + "</strong> on CampusSkills.</p>"
            + "<p class='message'>Please click the button below to accept your invitation and set up your account.</p>"
            + "<a href='" + inviteLink + "' style='display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 10px;'>Accept Invitation</a>"
            + "<p style='font-size: 13px; color: #718096; margin-top: 20px;'>Or copy and paste this link into your browser:<br><a href='" + inviteLink + "' style='color: #6366f1;'>" + inviteLink + "</a></p>"
            + "<div class='security-notice'>"
            + "  <strong>Security Notice</strong><br><br>"
            + "  This invitation link is valid for 7 days and can only be used once."
            + "</div>";

        String htmlBody = getBaseHtml("You are invited to CampusSkills", innerHtml);
        return sendMailInternal(email, "Invitation to become a CampusSkills Administrator", textBody, htmlBody);
    }
'''

# We will regex replace the HTML in the existing methods to use getBaseHtml.
def replace_html(content, method_name, title, inner_html):
    # This is a bit tricky, let's just replace the whole HTML string block.
    # Find the block starting from String htmlBody = "<!DOCTYPE html>" to ";\n\n        return sendMailInternal"
    pattern = r'String htmlBody = "<!DOCTYPE html>".*?";\s*return sendMailInternal'
    # Actually, it's safer to just replace the methods entirely.
    return content

# Instead of complex regex, let's just do simple string replacements.
content = content.replace('String htmlBody = "<!DOCTYPE html>"', 'String htmlBody_old = "<!DOCTYPE html>"')

# Wait, if I just append new_methods and base_html_method before private Future<Void> sendMailInternal
content = content.replace("    private Future<Void> sendMailInternal", base_html_method + "\\n" + new_methods + "\\n    private Future<Void> sendMailInternal")

with open('backend/src/main/java/com/campusskills/shared/services/GmailEmailService.java', 'w') as f:
    f.write(content)
