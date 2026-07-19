const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');

// Fix the main container background
content = content.replace(/background: 'linear-gradient\\(180deg, #fafafa 0%, #f8f9ff 100%\\)'/g, "background: 'var(--cs-bg-app)'");

// Fix specific hardcoded text colors that were missed
content = content.replace(/color: '#111827'/g, "color: 'var(--cs-text-main)'");
content = content.replace(/color: '#1e40af'/g, "color: 'var(--cs-primary)'");
content = content.replace(/color: '#6b7280'/g, "color: 'var(--cs-text-inactive)'");
content = content.replace(/color: '#1f2937'/g, "color: 'var(--cs-text-main)'");

// Fix specific hardcoded background colors that were missed
content = content.replace(/background: '#1d4ed8'/g, "background: 'var(--cs-primary)'");
content = content.replace(/background: '#2563eb'/g, "background: 'var(--cs-primary)'");
content = content.replace(/background: '#1e3a8a'/g, "background: 'var(--cs-primary-dark)'");
content = content.replace(/background: 'linear-gradient\\(to bottom right, rgba\\(239, 246, 255, 0.4\\) 0%, rgba\\(255, 255, 255, 0.6\\) 100%\\)'/g, "background: 'var(--cs-bg-elevated)'");

// Fix the stat cards icon containers
content = content.replace(/background: '#f0f6ff', color: '#1e3a8a'/g, "background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa'");
content = content.replace(/background: '#ecfdf5', color: '#065f46'/g, "background: 'rgba(16, 185, 129, 0.15)', color: '#34d399'");
content = content.replace(/background: '#fef3c7', color: '#92400e'/g, "background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24'");

// Fix borders
content = content.replace(/border: '1px solid rgba\\(29, 78, 216, 0.08\\)'/g, "border: '1px solid var(--cs-border)'");
content = content.replace(/border: '1px solid rgba\\(0,0,0,0.04\\)'/g, "border: '1px solid var(--cs-border)'");

fs.writeFileSync('frontend/src/pages/Dashboard.jsx', content, 'utf8');
console.log('Dashboard fixed.');
