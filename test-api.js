const http = require('http');
const req = http.request({
  hostname: 'localhost',
  port: 8080,
  path: '/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    try {
      const token = JSON.parse(data).data.token;
      const req2 = http.request({
        hostname: 'localhost',
        port: 8080,
        path: '/api/admin/management/staff',
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      }, res2 => {
        let data2 = '';
        res2.on('data', c => data2 += c);
        res2.on('end', () => console.log('STAFF:', data2));
      });
      req2.end();
    } catch(e) {
      console.log('Login failed:', data);
    }
  });
});
req.write(JSON.stringify({ email: 'amaljogeorge@gmail.com', password: 'Password@123' }));
req.end();
