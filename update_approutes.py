import os

with open('frontend/src/routes/AppRoutes.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

import_str = "import AdminInvitePage from '../pages/AdminInvitePage';\\n"
if 'AdminInvitePage' not in content:
    content = content.replace("import LoginPage from '../pages/LoginPage';", import_str + "import LoginPage from '../pages/LoginPage';")
    content = content.replace("<Route path=\"/login\" element={<LoginPage />} />", "<Route path=\"/login\" element={<LoginPage />} />\\n        <Route path=\"/invite/:token\" element={<AdminInvitePage />} />")

with open('frontend/src/routes/AppRoutes.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
