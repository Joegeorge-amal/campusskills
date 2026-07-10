import os

files = [
    'backend/src/main/java/com/campusskills/modules/users/routes/AuthRouter.java',
    'backend/src/main/java/com/campusskills/modules/admin/routes/AdminRouter.java'
]

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace('\\n', '\n')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
