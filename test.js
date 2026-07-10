const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 8080,
  path: '/api/admin/management/staff',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + require('fs').readFileSync('token.txt', 'utf8').trim()
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
req.end();
