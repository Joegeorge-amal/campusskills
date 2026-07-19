const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');

// Fix specific hardcoded background colors that were missed
content = content.replace(/background: 'linear-gradient\\(to bottom right, rgba\\(239, 246, 255, 0\\.4\\) 0%, rgba\\(255, 255, 255, 0\\.6\\) 100%\\)'/g, "background: 'var(--cs-bg-elevated)'");
content = content.replace(/background: '#1e3a8a'/g, "background: 'var(--cs-primary-dark)'");
content = content.replace(/color: '#1d4ed8'/g, "color: 'var(--cs-primary)'");
content = content.replace(/boxShadow: '0 4px 12px rgba\\(29, 78, 216, 0\\.3\\)'/g, "boxShadow: 'none'");
content = content.replace(/boxShadow: '0 2px 3px rgba\\(0, 0, 0, 0\\.12\\)'/g, "boxShadow: 'none'");

fs.writeFileSync('frontend/src/pages/Dashboard.jsx', content, 'utf8');
console.log('Dashboard fixed again.');
