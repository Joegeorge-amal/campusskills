import { MongoClient } from 'mongodb';

async function testMongo() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    
    const db = client.db("campusskills");
    const topicsCollection = db.collection("topics");
    
    const count = await topicsCollection.countDocuments();
    console.log("Total topics in DB:", count);
    
    const sample = await topicsCollection.find().limit(5).toArray();
    console.log("Sample topics:", sample.map(t => t.name));
    
  } finally {
    await client.close();
  }
}

testMongo().catch(console.dir);
