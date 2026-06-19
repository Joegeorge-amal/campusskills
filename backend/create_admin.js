const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    const db = client.db('campusskills');
    
    const email = 'akashreddy3161@gmail.com';
    const password = 'Akki0722';
    const hash = await bcrypt.hash(password, 10);
    
    const existing = await db.collection('users').findOne({ email: email });
    if (existing) {
        await db.collection('users').updateOne(
            { email: email },
            { $set: { role: 'SUPER_ADMIN', passwordHash: hash, isActive: true } }
        );
        console.log('User updated successfully');
    } else {
        const res = await db.collection('users').insertOne({
            email: email,
            role: 'SUPER_ADMIN',
            isActive: true,
            emailVerified: true,
            passwordHash: hash,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        
        await db.collection('user_profiles').insertOne({
            userId: res.insertedId.toString(),
            name: 'Akash Reddy',
            skillsOffered: [],
            skillsWanted: [],
            profileCompleted: true
        });
        console.log('User created successfully');
    }
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
