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

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (content.includes('#534AB7')) {
        content = content.replace(/#534AB7/gi, '#1d4ed8');
        changed = true;
    }
    if (content.includes('#EEEDFE')) {
        content = content.replace(/#EEEDFE/gi, '#eff6ff');
        changed = true;
    }
    if (content.includes('#3C3489')) {
        content = content.replace(/#3C3489/gi, '#1e40af');
        changed = true;
    }
    if (content.includes('#4338ca')) {
        content = content.replace(/#4338ca/gi, '#1e40af');
        changed = true;
    }
    if (content.includes('#1e1b7a')) {
        content = content.replace(/#1e1b7a/gi, '#2563eb');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
console.log('Done!');
