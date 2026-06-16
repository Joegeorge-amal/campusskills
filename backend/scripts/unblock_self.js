const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('campusskills');
    const usersColl = db.collection('users');
    
    // Find all users who have a blockedUsers array
    const users = await usersColl.find({ blockedUsers: { $exists: true } }).toArray();
    let count = 0;
    for (const u of users) {
      if (!u.blockedUsers || !Array.isArray(u.blockedUsers)) continue;
      
      const userIdStr = u.userId || u._id.toString();
      
      if (u.blockedUsers.includes(userIdStr) || u.blockedUsers.includes(u._id.toString())) {
         await usersColl.updateOne(
           { _id: u._id },
           { $pull: { blockedUsers: { $in: [userIdStr, u._id.toString()] } } }
         );
         console.log('Unblocked user from themselves: ' + (u.email || u._id));
         count++;
      }
    }
    console.log('Done. Total unblocked: ' + count);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}
run();
