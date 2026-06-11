const { MongoClient } = require('mongodb');

async function run() {
  const email = `testuser_${Date.now()}@kristujayanti.com`;
  const password = "password123";

  console.log(`1. Registering user ${email}...`);
  const regRes = await fetch('http://localhost:8080/api/v1/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, displayName: "Demo UI Expert" })
  });
  
  const regText = await regRes.text();
  try {
    const regData = JSON.parse(regText);
    console.log("Registered:", regData);
  } catch (e) {
    console.log("Registration raw response:", regText);
  }
  
  console.log("2. Overriding email verification in MongoDB...");
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('campusskills');
  await db.collection('users').updateOne({ email }, { $set: { emailVerified: true } });
  await client.close();
  
  console.log("3. Logging in...");
  const loginRes = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const loginText = await loginRes.text();
  let loginData;
  try {
    loginData = JSON.parse(loginText);
  } catch (e) {
    console.log("Login raw response:", loginText);
    return;
  }
  
  if (!loginData.data || !loginData.data.token) {
    console.error("Login failed:", loginData);
    return;
  }
  const token = loginData.data.token;
  console.log("Logged in!");
  
  console.log("4. Setting up profile...");
  await fetch('http://localhost:8080/api/v1/profiles/me', {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      skillsOffered: [{ name: "UI/UX Design", level: "ADVANCED" }],
      skillsWanted: []
    })
  });
  
  console.log("5. Creating listing...");
  const listingRes = await fetch('http://localhost:8080/api/v1/listings', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: "UI Design Mentorship",
      description: "I will teach you how to create stunning, modern web interfaces and animations.",
      category: "Design",
      listingType: "TEACH",
      price: 40,
      availability: "ONLINE",
      availableSlots: [],
      topics: ["Figma", "Framer Motion", "Animations"],
      offeredSkills: [{ name: "UI/UX Design", level: "ADVANCED" }],
      requestedSkills: []
    })
  });
  
  if (listingRes.status === 200 || listingRes.status === 201 || listingRes.status === 204) {
    console.log("Listing successfully created via API!");
  } else {
    const text = await listingRes.text();
    console.error(`Listing creation failed (${listingRes.status}):`, text);
  }
}

run().catch(console.error);
