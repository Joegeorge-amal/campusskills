import os
import re

with open('frontend/src/routes/AppRoutes.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'<Route path="/setup" element=\{<SetupPage />\} />'
replacement = '<Route path="/setup" element={<SetupPage />} />\n      <Route path="/invite/:token" element={<AdminInvitePage />} />'

if pattern in content:
    content = content.replace(pattern, replacement)
    with open('frontend/src/routes/AppRoutes.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Replaced route successfully")
else:
    print("Route Pattern not found")
