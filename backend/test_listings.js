const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:8080/api/v1/listings');
    console.log("ALL LISTINGS:");
    if (res.data && res.data.data && res.data.data.data) {
        res.data.data.data.forEach(l => {
            console.log(`ID: ${l.id}, Title: ${l.title}, ownerId: ${l.ownerId}, teacherId: ${l.teacherId}`);
        });
    } else {
        console.log(JSON.stringify(res.data, null, 2));
    }
  } catch (e) {
    console.error(e.message);
  }
}

test();
