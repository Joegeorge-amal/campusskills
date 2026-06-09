async function runTest() {
  try {
    console.log("Registering test user...");
    const regRes = await fetch('http://localhost:8080/api/v1/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test_${Date.now()}@kristujayanti.com`,
        password: 'password123',
        displayName: 'Test User'
      })
    });
    const reg = await regRes.json();
    console.log("Reg response:", JSON.stringify(reg));
    
    let token = reg.data?.token || reg.token;
    if (!token) throw new Error("No token found");

    console.log("Fetching topics...");
    const topicsRes = await fetch('http://localhost:8080/api/v1/topics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const topicsData = await topicsRes.json();
    console.log("Topics Response Status:", topicsRes.status);
    console.log("Topics Response Data:", JSON.stringify(topicsData).substring(0, 500));
    if (topicsData.data && Array.isArray(topicsData.data)) {
      console.log("Number of topics fetched:", topicsData.data.length);
    }

  } catch (err) {
    console.log("Error:", err);
  }
}

runTest();
