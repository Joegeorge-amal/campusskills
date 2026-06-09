const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') && fullPath !== path.join(__dirname, 'src', 'main.jsx') && fullPath !== path.join(__dirname, 'src', 'App.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      const filtered = lines.filter(line => !line.match(/^import.*\.css';?$/));
      if (lines.length !== filtered.length) {
        fs.writeFileSync(fullPath, filtered.join('\n'), 'utf8');
        console.log(`Cleaned ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log('CSS cleaning done!');
