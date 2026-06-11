const { MongoClient } = require('mongodb');

async function insertListing() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('campusskills');

    const timestamp = Date.now();

    // Using an ID of another user from the database
    const otherUserId = "6a1fe827bcfefb74fd129d4b";

    const result = await db.collection('skill_listings').insertOne({
      ownerId: otherUserId,
      teacherId: otherUserId,
      title: "React UI Animation Expert",
      description: "I can help you build flawless Framer Motion animations for your frontend project.",
      category: "Programming",
      topics: [],
      listingType: "TEACH",
      sessionType: "PAID",
      offeredSkills: [
        {
          name: "React",
          level: "ADVANCED"
        }
      ],
      skills: [
        {
          name: "React",
          level: "ADVANCED"
        }
      ],
      requestedSkills: [],
      preferredSkills: [],
      price: 15,
      budget: null,
      availability: "ONLINE",
      availableSlots: [],
      active: true,
      status: "ACTIVE",
      createdAt: timestamp,
      updatedAt: timestamp
    });

    console.log(`Listing created successfully from 'another user'! ID: ${result.insertedId}`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

insertListing();
