import os

with open('frontend/src/routes/AppRoutes.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

import_str = "import AdminInvitePage from '../pages/AdminInvitePage';\\n"
if 'AdminInvitePage' not in content:
    content = content.replace("import AdminLogin from '../pages/admin/AdminLogin';", import_str + "import AdminLogin from '../pages/admin/AdminLogin';")
    content = content.replace("<Route path=\"/admin/login\" element={<AdminLogin />} />", "<Route path=\"/admin/login\" element={<AdminLogin />} />\\n        <Route path=\"/invite/:token\" element={<AdminInvitePage />} />")

with open('frontend/src/routes/AppRoutes.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
