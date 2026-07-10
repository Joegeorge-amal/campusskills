import re

with open('frontend/src/services/adminService.js', 'r', encoding='utf-8') as f:
    content = f.read()

if 'inviteAdmin:' not in content:
    new_method = '''  inviteAdmin: async (email, targetRole = 'ADMIN') => {
    const response = await api.post('/admin/management/invite', { email, targetRole });
    return response.data;
  },
'''
    content = content.replace('  promoteUser: async (targetUserId, targetRole, reason) => {', new_method + '\\n  promoteUser: async (targetUserId, targetRole, reason) => {')
    
    with open('frontend/src/services/adminService.js', 'w', encoding='utf-8') as f:
        f.write(content)
