import os

with open('backend/src/main/java/com/campusskills/shared/services/GmailEmailService.java', 'r', encoding='utf-8') as f:
    content = f.read()

import re

pattern = r'try \{\s*File logoFile = new File\("\.\./docs/assets/kju_campus_logo\.png"\);\s*if \(!logoFile\.exists\(\)\) \{\s*logoFile = new File\("docs/assets/kju_campus_logo\.png"\);\s*\}\s*if \(logoFile\.exists\(\)\) \{\s*byte\[\] logoBytes = Files\.readAllBytes\(logoFile\.toPath\(\)\);\s*MailAttachment attachment = MailAttachment\.create\(\)\s*\.setData\(Buffer\.buffer\(logoBytes\)\)\s*\.setContentType\("image/png"\)\s*\.setDisposition\("inline"\)\s*\.setContentId\("<campus_logo>"\);\s*message\.setInlineAttachment\(java\.util\.Collections\.singletonList\(attachment\)\);\s*\} else \{\s*log\.warn\("Logo file not found for email template\."\);\s*\}'

replacement = """try (java.io.InputStream is = getClass().getResourceAsStream("/assets/kju_campus_logo.png")) {
              if (is != null) {
                  byte[] logoBytes = is.readAllBytes();
                  MailAttachment attachment = MailAttachment.create()
                      .setData(Buffer.buffer(logoBytes))
                      .setContentType("image/png")
                      .setDisposition("inline")
                      .setContentId("<campus_logo>");
                  message.setInlineAttachment(java.util.Collections.singletonList(attachment));
              } else {
                  log.warn("Logo file not found for email template in classpath.");
              }"""

if re.search(pattern, content):
    content = re.sub(pattern, replacement, content)
    with open('backend/src/main/java/com/campusskills/shared/services/GmailEmailService.java', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Replaced successfully")
else:
    print("Target not found via regex")
