const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

function capitalize(s) {
  return s.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find all <i className="ti ti-[name]"></i>
  const regex = /<i className="ti ti-([^"]+)"(?: style={{([^}]+)}})?><\/i>/g;
  
  const matches = [...content.matchAll(regex)];
  if (matches.length === 0) return;

  let imports = new Set();
  
  content = content.replace(regex, (match, iconName, styleStr) => {
    const compName = 'Icon' + capitalize(iconName);
    imports.add(compName);
    if (styleStr) {
      return `<${compName} style={{${styleStr}}} />`;
    }
    return `<${compName} />`;
  });

  if (imports.size > 0) {
    const importStr = `import { ${Array.from(imports).join(', ')} } from '@tabler/icons-react';\n`;
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const nextLine = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, nextLine + 1) + importStr + content.slice(nextLine + 1);
    } else {
      content = importStr + content;
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

walk(dir);
console.log('Icons replacement done!');
