const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('campusskills');
    
    // Find admins first
    const users = db.collection('users');
    const admins = await users.find({ role: 'ADMIN' }).toArray();
    
    console.log(`Found ${admins.length} ADMIN users.`);
    for (const admin of admins) {
      console.log(`- Deleting admin: ${admin.email}`);
    }

    const result = await users.deleteMany({ role: 'ADMIN' });
    console.log(`Successfully deleted ${result.deletedCount} ADMIN users.`);
    
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
