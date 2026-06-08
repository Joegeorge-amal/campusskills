const http = require('http');

const data = JSON.stringify({
  email: 'amaljogeorge@gmail.com',
  password: 'Georgekutty2312',
  displayName: 'Amal'
});

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/v1/auth/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
