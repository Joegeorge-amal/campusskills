const fs = require('fs');

const data = fs.readFileSync('C:/Users/akash/.gemini/antigravity/brain/5a4b9356-246a-406a-9af0-96f05e2443b5/.system_generated/steps/695/output.txt', 'utf8');

// Match top level frames (2 spaces indentation)
const matches = data.match(/^  <frame id="([^"]+)" name="([^"]+)"/gm);
if (matches) {
  matches.forEach(m => console.log(m.trim()));
} else {
  console.log('No matches');
}
