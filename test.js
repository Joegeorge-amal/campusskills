const axios = require('axios');

async function run() {
  try {
    // 1. Signup
    const signupRes = await axios.post('http://localhost:8080/api/v1/auth/signup', {
      email: 'test_patch500@pes.edu',
      password: 'password123',
      displayName: 'Test User'
    });
    console.log('Signup success:', signupRes.data);
    const token = signupRes.data.data.token;

    // 2. Patch Profile
    const patchRes = await axios.patch('http://localhost:8080/api/v1/profiles/me', {
      bio: "Hello",
      year: "3rd year",
      department: "CSE",
      profilePicture: "{}",
      skillsOffered: [{ name: "React", level: "INTERMEDIATE", isSystemSkill: false }],
      skillsWanted: [{ name: "Python", level: "BEGINNER", isSystemSkill: false }]
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Patch success:', patchRes.data);
  } catch (err) {
    if (err.response) {
      console.error('Error response:', err.response.status, err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}

run();
