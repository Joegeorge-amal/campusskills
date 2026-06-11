const { MongoClient } = require('mongodb');

async function main() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    const db = client.db('campusskills');
    
    // Get all user IDs
    const users = await db.collection('users').find({}, { projection: { _id: 1 } }).toArray();
    const userIds = users.map(u => u._id.toString());
    
    console.log(`Found ${userIds.length} active users.`);

    // Delete user_profiles where userId is not in the list of active user IDs
    const profileRes = await db.collection('user_profiles').deleteMany({ userId: { $nin: userIds } });
    console.log(`Deleted ${profileRes.deletedCount} orphaned user profiles.`);
    
    // Delete user_stats where userId is not in the list of active user IDs
    const statsRes = await db.collection('user_stats').deleteMany({ userId: { $nin: userIds } });
    console.log(`Deleted ${statsRes.deletedCount} orphaned user stats.`);
    
  } finally {
    await client.close();
  }
}

main().catch(console.error);
