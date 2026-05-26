console.log("DEV TEST UI LOADED");
console.log("APP.JS CONNECTED");

// TAB SWITCHING
function openTab(evt, tabName) {
  const tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  const tablinks = document.getElementsByClassName("tablink");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
  }
  document.getElementById(tabName).style.display = "block";
  if (evt && evt.currentTarget) {
    evt.currentTarget.classList.add("active");
  }
}

// APP PREVIEW - DUMMY LOGIC
document.addEventListener("DOMContentLoaded", () => {
  const sendMsgForm = document.getElementById('send-msg-form');
  if (sendMsgForm) {
    sendMsgForm.onsubmit = (e) => {
      e.preventDefault();
      alert("UI form submitted! Switch to 'Developer Console' to test actual backend APIs.");
    };
  }
  
  updateAuthStatusUI();
});

// -----------------------------------------
// AUTHENTICATION LOGIC
// -----------------------------------------
let currentUserToken = localStorage.getItem('jwt_token');
let currentUser = JSON.parse(localStorage.getItem('user_data') || 'null');

function updateAuthStatusUI() {
  const statusEl = document.getElementById('auth-status-display');
  if (!statusEl) return;
  
  if (currentUserToken && currentUser) {
    statusEl.innerHTML = `<strong>Logged in as:</strong> ${currentUser.email} (Role: ${currentUser.role}, ID: ${currentUser._id})`;
    statusEl.style.backgroundColor = '#d4edda';
  } else {
    statusEl.innerHTML = `Not logged in`;
    statusEl.style.backgroundColor = '#e9ecef';
  }
}

async function handleSignup() {
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const displayName = document.getElementById('signup-name').value;
  const role = document.getElementById('signup-role').value;

  try {
    const res = await fetch('http://localhost:8080/api/v1/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName, role })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert("Signup successful! You can now log in.");
    } else {
      alert("Signup failed: " + (data.error || JSON.stringify(data)));
    }
  } catch (err) {
    alert("Network error: " + err.message);
  }
}

async function handleLogin() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      currentUserToken = data.data.token;
      currentUser = data.data.user;
      localStorage.setItem('jwt_token', currentUserToken);
      localStorage.setItem('user_data', JSON.stringify(currentUser));
      updateAuthStatusUI();
      alert("Login successful!");
    } else {
      alert("Login failed: " + (data.error || JSON.stringify(data)));
    }
  } catch (err) {
    alert("Network error: " + err.message);
  }
}

function handleLogout() {
  currentUserToken = null;
  currentUser = null;
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('user_data');
  updateAuthStatusUI();
  disconnectWS();
  alert("Logged out successfully.");
}


// -----------------------------------------
// DEVELOPER CONSOLE - REST API
// -----------------------------------------
async function sendApiRequest() {
  const method = document.getElementById('api-method').value;
  const urlPath = document.getElementById('api-url').value;
  const bodyText = document.getElementById('api-body').value;
  
  const fullUrl = 'http://localhost:8080' + (urlPath.startsWith('/') ? urlPath : '/' + urlPath);
  const resStatusEl = document.getElementById('res-status');
  const resBodyEl = document.getElementById('res-body');

  resStatusEl.textContent = "Loading...";
  resBodyEl.textContent = "";

  const options = {
    method: method,
    headers: {}
  };
  
  if (currentUserToken) {
      options.headers['Authorization'] = 'Bearer ' + currentUserToken;
  }

  if (method !== 'GET' && method !== 'DELETE' && bodyText.trim() !== '') {
    options.headers['Content-Type'] = 'application/json';
    try {
      // Validate JSON before sending
      JSON.parse(bodyText);
      options.body = bodyText;
    } catch (e) {
      resStatusEl.textContent = "JSON Error";
      resBodyEl.textContent = "Invalid JSON body format:\n" + e.message;
      return;
    }
  }

  try {
    const response = await fetch(fullUrl, options);
    resStatusEl.textContent = response.status + ' ' + response.statusText;
    
    if (response.status >= 200 && response.status < 300) {
      resStatusEl.style.backgroundColor = '#d4edda';
      resStatusEl.style.color = '#155724';
    } else {
      resStatusEl.style.backgroundColor = '#f8d7da';
      resStatusEl.style.color = '#721c24';
    }

    const text = await response.text();
    try {
      const json = JSON.parse(text);
      resBodyEl.textContent = JSON.stringify(json, null, 2);
    } catch {
      resBodyEl.textContent = text || '<empty response>';
    }
  } catch (err) {
    resStatusEl.textContent = 'NETWORK ERROR';
    resStatusEl.style.backgroundColor = '#f8d7da';
    resStatusEl.style.color = '#721c24';
    resBodyEl.textContent = "Failed to fetch: " + err.message + "\nIs the backend running on port 8080?";
  }
}


// -----------------------------------------
// DEVELOPER CONSOLE - WEBSOCKETS
// -----------------------------------------
let ws = null;

function logWSEvent(msg, isError = false) {
  const logDiv = document.getElementById('ws-events');
  const time = new Date().toLocaleTimeString();
  const color = isError ? 'color: #ff5555;' : '';
  logDiv.innerHTML += `<div style="${color}">[${time}] ${msg}</div>`;
  logDiv.scrollTop = logDiv.scrollHeight;
}

function updateWsStatus(status, isOnline) {
  const statusEl = document.getElementById('ws-status');
  statusEl.textContent = status;
  statusEl.className = isOnline ? 'online' : 'offline';
}

function connectWS() {
  if (!currentUserToken) {
    alert("Please log in from the Authentication tab first to get a JWT token.");
    return;
  }

  if (ws) {
    ws.close();
  }

  const wsUrl = `ws://localhost:8080/ws?token=${currentUserToken}`;
  logWSEvent(`Attempting to connect to ${wsUrl}...`);
  
  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      updateWsStatus('Connected (Authenticated)', true);
      logWSEvent('Connection opened successfully.');
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        logWSEvent(`RECEIVED JSON: \n${JSON.stringify(payload, null, 2)}`);
      } catch {
        logWSEvent(`RECEIVED RAW: ${event.data}`);
      }
    };

    ws.onclose = () => {
      updateWsStatus('Disconnected', false);
      logWSEvent('Connection closed.');
      ws = null;
    };

    ws.onerror = (err) => {
      updateWsStatus('Error', false);
      logWSEvent('WebSocket Error occurred.', true);
    };

  } catch (err) {
    logWSEvent(`Failed to create WebSocket: ${err.message}`, true);
  }
}

function disconnectWS() {
  if (ws) {
    logWSEvent('Disconnecting...');
    ws.close();
  } else {
    logWSEvent('Already disconnected.');
  }
}
