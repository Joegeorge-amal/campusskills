import os
import re

files = [
    'backend/src/main/java/com/campusskills/modules/users/routes/AuthRouter.java',
    'backend/src/main/java/com/campusskills/modules/admin/handlers/AdminManagementHandler.java',
    'backend/src/main/java/com/campusskills/modules/admin/routes/AdminRouter.java',
    'backend/src/main/java/com/campusskills/shared/services/GmailEmailService.java'
]

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Remove literal "\n" that are by themselves on a line or just dangling
    content = content.replace('\\n\\n', '\\n')
    content = content.replace('\\n        AuthHandler', '        AuthHandler')
    content = content.replace('logout());\\n', 'logout());\\n')
    # Actually just regex replace literal \n outside of strings
    content = re.sub(r'(?m)^\\\\n$', '', content)
    content = re.sub(r'(?m)^\\\\n', '', content)
    content = content.replace('\\n', '\\n') # This might be risky if we have actual literal \n strings, let's just do targeted replace

    with open(file_path, 'w') as f:
        f.write(content)
