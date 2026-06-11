const http = require('http');

http.get('http://localhost:8080/api/v1/listings?ownerId=6a28e1c2e48b141c677ae29a', (resp) => {
  let data = '';
  resp.on('data', (chunk) => {
    data += chunk;
  });
  resp.on('end', () => {
    console.log(data);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
