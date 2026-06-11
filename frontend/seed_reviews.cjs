const { MongoClient, ObjectId } = require('mongodb');

async function fixStats() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('campusskills');
    
    // Find the user
    const user = await db.collection('users').findOne({
      $or: [
        { email: '24cpeb04@kristujayanti.com' },
        { displayName: 'Amal Jose' },
        { name: 'Amal Jose' }
      ]
    });
    
    if (!user) {
      console.log('User not found!');
      return;
    }
    
    const userId = user._id.toString();
    console.log('Found user:', userId);

    // Update user_stats collection
    const result = await db.collection('user_stats').updateOne(
      { userId: userId },
      { 
        $set: { 
          ratingAvg: 4.67,
          ratingCount: 3,
          sessionsCompleted: 5,
          updatedAt: Date.now()
        }
      },
      { upsert: true }
    );
    
    console.log('Updated user_stats collection!', result);
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

fixStats();
