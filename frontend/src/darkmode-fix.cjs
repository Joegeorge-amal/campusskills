const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.jsx') || file.endsWith('.css')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(__dirname);

// Mapping of hex colors to CSS variables based on property context
const textMain = /#1e293b|#1f2937|#334155|#222222|#000000|#0f172a/gi;
const textSecondary = /#64748b|#475569|#666666|#4b5563/gi;
const textInactive = /#94a3b8|#9ca3af|#888888|#cbd5e1/gi;

const bgWhite = /#ffffff|#fff/gi;
const bgLight = /#f8fafc|#f3f4f6|#fafafa|#f1f5f9/gi;
const bgHover = /#eff6ff|#e0e7ff/gi;

const borderCol = /#e2e8f0|#e5e7eb|#d1d5db|rgba\(0, 0, 0, 0.08\)|rgba\(0,0,0,0.08\)/gi;

let totalChanges = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // React inline style replacements
    if (file.endsWith('.jsx')) {
        content = content.replace(/color:\s*['"](#[0-9a-fA-F]{3,6})['"]/g, (match, hex) => {
            if (hex.match(textMain)) return `color: 'var(--cs-text-main)'`;
            if (hex.match(textSecondary)) return `color: 'var(--cs-text-secondary)'`;
            if (hex.match(textInactive)) return `color: 'var(--cs-text-inactive)'`;
            return match;
        });

        content = content.replace(/(?:background|backgroundColor):\s*['"](#[0-9a-fA-F]{3,6})['"]/g, (match, hex) => {
            if (hex.match(bgWhite)) return `background: 'var(--cs-bg-white)'`;
            if (hex.match(bgLight)) return `background: 'var(--cs-bg-light)'`;
            if (hex.match(bgHover)) return `background: 'var(--cs-bg-hover)'`;
            return match;
        });

        content = content.replace(/border(?:Bottom|Top|Left|Right)?:\s*['"]1px solid (#[0-9a-fA-F]{3,6})['"]/g, (match, hex) => {
            if (hex.match(borderCol)) return match.replace(hex, 'var(--cs-border)');
            return match;
        });
        
        content = content.replace(/borderColor:\s*['"](#[0-9a-fA-F]{3,6})['"]/g, (match, hex) => {
            if (hex.match(borderCol)) return `borderColor: 'var(--cs-border)'`;
            return match;
        });
    } 
    
    // CSS replacements (ignoring global.css where variables are defined)
    else if (file.endsWith('.css') && !file.endsWith('global.css')) {
        content = content.replace(/color:\s*(#[0-9a-fA-F]{3,6});/g, (match, hex) => {
            if (hex.match(textMain)) return `color: var(--cs-text-main);`;
            if (hex.match(textSecondary)) return `color: var(--cs-text-secondary);`;
            if (hex.match(textInactive)) return `color: var(--cs-text-inactive);`;
            return match;
        });

        content = content.replace(/background(-color)?:\s*(#[0-9a-fA-F]{3,6});/g, (match, suffix, hex) => {
            if (hex.match(bgWhite)) return `background${suffix || ''}: var(--cs-bg-white);`;
            if (hex.match(bgLight)) return `background${suffix || ''}: var(--cs-bg-light);`;
            if (hex.match(bgHover)) return `background${suffix || ''}: var(--cs-bg-hover);`;
            return match;
        });

        content = content.replace(/border(-[a-z]+)?:\s*1px solid (#[0-9a-fA-F]{3,6});/g, (match, suffix, hex) => {
            if (hex.match(borderCol)) return `border${suffix || ''}: 1px solid var(--cs-border);`;
            return match;
        });
        
        content = content.replace(/border-color:\s*(#[0-9a-fA-F]{3,6});/g, (match, hex) => {
            if (hex.match(borderCol)) return `border-color: var(--cs-border);`;
            return match;
        });
    }

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${path.basename(file)}`);
        totalChanges++;
    }
});

console.log(`\nRefactor complete. Modifed ${totalChanges} files.`);
