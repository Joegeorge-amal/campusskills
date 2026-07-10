import os

with open('frontend/src/routes/AppRoutes.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

out_lines = []
for line in lines:
    if line.startswith("import LoginPage from '../pages/LoginPage';"):
        out_lines.append("import AdminInvitePage from '../pages/AdminInvitePage';\n")
        out_lines.append(line)
    elif '<Route path="/login" element={<LoginPage />} />' in line:
        out_lines.append(line)
        out_lines.append('        <Route path="/invite/:token" element={<AdminInvitePage />} />\n')
    else:
        out_lines.append(line)

with open('frontend/src/routes/AppRoutes.jsx', 'w', encoding='utf-8') as f:
    f.writelines(out_lines)
