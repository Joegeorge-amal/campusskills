import os

with open('backend/src/main/java/com/campusskills/shared/services/GmailEmailService.java', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('String htmlBody_old', 'String htmlBody')

with open('backend/src/main/java/com/campusskills/shared/services/GmailEmailService.java', 'w', encoding='utf-8') as f:
    f.write(content)
