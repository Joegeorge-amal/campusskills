import os

files = [
    'backend/src/main/java/com/campusskills/modules/users/routes/AuthRouter.java',
    'backend/src/main/java/com/campusskills/modules/admin/handlers/AdminManagementHandler.java',
    'backend/src/main/java/com/campusskills/modules/admin/routes/AdminRouter.java',
    'backend/src/main/java/com/campusskills/shared/services/GmailEmailService.java'
]

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    with open(file_path, 'w', encoding='utf-8') as f:
        for line in lines:
            # If the line contains an unescaped backslash that is not inside quotes
            # Wait, it's simpler to just look for literal "\n" at the end of the string or beginning and replace them.
            # Actually, the error says: illegal character: '\'
            # Let's just strip any literal backslashes if they are followed by 'n' and not part of a Java string.
            if line.strip() == '\\n' or line.strip() == '\\':
                continue
            if line.startswith('\\n'):
                line = line[2:]
            
            # The errors tell us the exact line numbers:
            # AuthRouter.java:[54,57] 
            # AdminManagementHandler.java:[14,25] 
            # AdminManagementHandler.java:[194,1]
            # GmailEmailService.java:[480,1]
            # GmailEmailService.java:[522,1]
            # AdminRouter.java:[29,178]
            # AdminRouter.java:[42,156]
            
            # Since line numbers can shift, let's just do a blind replace of literal backslash-n IF it's not in a string.
            # Actually, content.replace("\\n", "\n") would replace ALL of them. But we want to KEEP the ones inside strings like "Hello\\nWorld".
            # Let's just use regex to remove \ that is followed by 
 but outside of quotes. No, that's hard.
            pass

        # Since it's only a few lines, let's just do a naive replace:
        text = "".join(lines)
        # AuthRouter
        text = text.replace('logout());\\n\\n', 'logout());\\n')
        text = text.replace('logout());\\n', 'logout());\n')
        
        # AdminManagementHandler
        text = text.replace('import java.util.UUID;\\n', 'import java.util.UUID;\n')
        text = text.replace('}\\n\\n    public void demote', '}\n\n    public void demote')
        
        # AdminRouter
        text = text.replace('invitationRepository;\\n        AdminManagementHandler', 'invitationRepository;\n        AdminManagementHandler')
        text = text.replace('demote);\\n        router.post', 'demote);\n        router.post')

        # GmailEmailService
        text = text.replace('}\\n\\n    @Override', '}\n\n    @Override')
        
        # Just to be safe, any remaining literal \n at start of lines:
        import re
        text = re.sub(r'(?m)^\\\\n', '', text)
        text = re.sub(r'(?m)^\\\\$', '', text)
        
        f.write(text)
