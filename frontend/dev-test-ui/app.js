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

// -----------------------------------------
// FRONTEND STATE MANAGEMENT
// -----------------------------------------
const State = {
  chats: [],
  activeChatId: null,
  messages: {}, // { chatId: [msg1, msg2] }
  sessions: [],
  typingTimeouts: {} // { chatId: timeoutId }
};

// -----------------------------------------
// APP PREVIEW LOGIC
// -----------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const sendMsgForm = document.getElementById('send-msg-form');
  if (sendMsgForm) {
    sendMsgForm.onsubmit = (e) => {
      e.preventDefault();
      const input = document.getElementById('msg-input');
      if (input.value.trim() && State.activeChatId) {
        sendMessage(input.value.trim());
        input.value = '';
      }
    };

    // Typing indicator event
    const input = document.getElementById('msg-input');
    if (input) {
      input.addEventListener('input', () => {
        if (State.activeChatId) {
          sendTypingEvent(State.activeChatId);
        }
      });
    }
  }
  
  updateAuthStatusUI();
  if (currentUserToken) {
    fetchChats();
    fetchSessions();
  }
});

// -- MODAL LOGIC --
window.openNewChatModal = function() { 
  console.log("Action: openNewChatModal triggered");
  document.getElementById('new-chat-modal').style.display = 'block'; 
};
window.closeNewChatModal = function() { 
  console.log("Action: closeNewChatModal triggered");
  document.getElementById('new-chat-modal').style.display = 'none'; 
};
window.openNewSessionModal = function() { 
  console.log("Action: openNewSessionModal triggered");
  document.getElementById('new-session-modal').style.display = 'block'; 
};
window.closeNewSessionModal = function() { 
  console.log("Action: closeNewSessionModal triggered");
  document.getElementById('new-session-modal').style.display = 'none'; 
};

window.submitNewChat = async function() {
  console.log("Action: submitNewChat triggered");
  const targetUserId = document.getElementById('new-chat-target').value;
  const listingId = document.getElementById('new-chat-listing').value;
  if (!targetUserId || !listingId) return alert("Fields required");

  try {
    const res = await fetch('http://localhost:8080/api/v1/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + currentUserToken },
      body: JSON.stringify({ participants: [targetUserId], listingId })
    });
    if (res.ok) {
      console.log("Success: Chat created");
      window.closeNewChatModal();
      document.getElementById('new-chat-target').value = '';
      document.getElementById('new-chat-listing').value = '';
      await fetchChats();
    } else {
      const err = await res.json();
      console.error("Error creating chat:", err);
      alert("Error: " + JSON.stringify(err));
    }
  } catch (e) { 
    console.error("Exception in submitNewChat:", e);
    alert(e.message); 
  }
};

window.submitNewSession = async function() {
  console.log("Action: submitNewSession triggered");
  const studentId = document.getElementById('new-session-student').value;
  const listingId = document.getElementById('new-session-listing').value;
  const start = document.getElementById('new-session-start').value;
  const end = document.getElementById('new-session-end').value;

  try {
    const res = await fetch('http://localhost:8080/api/v1/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + currentUserToken },
      body: JSON.stringify({ studentId, listingId, scheduledStart: Number(start), scheduledEnd: Number(end), meetingPlatform: 'Zoom' })
    });
    if (res.ok) {
      console.log("Success: Session proposed");
      window.closeNewSessionModal();
      document.getElementById('new-session-student').value = '';
      document.getElementById('new-session-listing').value = '';
      document.getElementById('new-session-start').value = '';
      document.getElementById('new-session-end').value = '';
      await fetchSessions();
    } else {
      const err = await res.json();
      console.error("Error proposing session:", err);
      alert("Error: " + JSON.stringify(err));
    }
  } catch (e) { 
    console.error("Exception in submitNewSession:", e);
    alert(e.message); 
  }
};

// -- DATA FETCHING & RENDERING --
async function fetchChats() {
  try {
    const res = await fetch('http://localhost:8080/api/v1/chats', {
      headers: { 'Authorization': 'Bearer ' + currentUserToken }
    });
    if (res.ok) {
      const data = await res.json();
      State.chats = data.data || [];
      renderChatList();
    }
  } catch (e) { console.error("Failed to fetch chats", e); }
}

function renderChatList() {
  const list = document.getElementById('chat-list');
  if (!list) return;
  list.innerHTML = '';
  if (State.chats.length === 0) {
    list.innerHTML = '<li class="empty-state">No chats found.</li>';
    return;
  }
  
  State.chats.forEach(chat => {
    const li = document.createElement('li');
    const otherParticipant = chat.participants.find(p => p !== currentUser._id) || "Self";
    const statusText = `(${chat.status || 'UNKNOWN'})`;
    li.innerHTML = `<span class="status-dot online"></span> Chat with ${otherParticipant.substring(0, 6)}... <span style="font-size: 10px; color: gray;">${statusText}</span>`;
    if (chat.id === State.activeChatId) li.classList.add('active-item');
    
    li.onclick = () => selectChat(chat.id, otherParticipant);
    list.appendChild(li);
  });
}

async function selectChat(chatId, otherParticipantName) {
  State.activeChatId = chatId;
  const chat = State.chats.find(c => c.id === chatId);
  const statusStr = chat ? chat.status : 'UNKNOWN';
  
  const titleEl = document.getElementById('active-chat-title');
  if (titleEl) titleEl.innerText = "Chat with " + otherParticipantName.substring(0, 8) + "... (" + statusStr + ")";
  
  const formEl = document.getElementById('send-msg-form');
  if (formEl) {
    if (statusStr === 'ACTIVE') {
      formEl.style.display = 'flex';
    } else {
      formEl.style.display = 'none';
    }
  }
  
  renderChatList();
  
  try {
    const res = await fetch(`http://localhost:8080/api/v1/messages/${chatId}`, {
      headers: { 'Authorization': 'Bearer ' + currentUserToken }
    });
    if (res.ok) {
      const data = await res.json();
      State.messages[chatId] = data.data || [];
      renderMessages();
    }
  } catch (e) { console.error("Failed to fetch msgs", e); }
}

function renderMessages() {
  const container = document.getElementById('messages');
  if (!container) return;
  container.innerHTML = '';
  if (!State.activeChatId || !State.messages[State.activeChatId]) return;
  
  const msgs = State.messages[State.activeChatId];
  if (msgs.length === 0) {
    container.innerHTML = '<div class="empty-state" style="margin: auto;">No messages yet</div>';
    return;
  }
  
  msgs.forEach(m => {
    const div = document.createElement('div');
    const isMe = m.senderId === currentUser._id;
    div.className = 'msg ' + (isMe ? 'outgoing' : 'incoming');
    div.innerText = m.message;
    if (m.type === 'SYSTEM') {
        div.style.backgroundColor = '#ffc107'; 
        div.style.color = '#000';
    }
    container.appendChild(div);
  });
  container.scrollTop = container.scrollHeight;
}

async function sendMessage(text) {
  try {
    const res = await fetch('http://localhost:8080/api/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + currentUserToken },
      body: JSON.stringify({ chatId: State.activeChatId, message: text })
    });
    if (!res.ok) alert("Failed to send message");
  } catch (e) { console.error(e); }
}

async function fetchSessions() {
  try {
    const res = await fetch('http://localhost:8080/api/v1/sessions', {
      headers: { 'Authorization': 'Bearer ' + currentUserToken }
    });
    if (res.ok) {
      const data = await res.json();
      State.sessions = data.data || [];
      renderSessionList();
    }
  } catch (e) { console.error("Failed to fetch sessions", e); }
}

function renderSessionList() {
  const container = document.getElementById('session-list');
  if (!container) return;
  container.innerHTML = '';
  if (State.sessions.length === 0) {
    container.innerHTML = '<div class="card empty">No active sessions</div>';
    return;
  }
  
  State.sessions.forEach(s => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <strong>Session: ${s.id.substring(0,6)}...</strong>
      <p>Status: <span class="badge scheduled">${s.status}</span></p>
      <p class="meta">Teacher: ${s.teacherId.substring(0,6)}</p>
    `;
    const actions = document.createElement('div');
    actions.className = 'session-actions';
    
    if (s.status === 'PROPOSED') {
       actions.innerHTML += `<button class="btn-success" onclick="updateSession('${s.id}', 'accept')">Accept</button>`;
       actions.innerHTML += `<button class="btn-danger" onclick="updateSession('${s.id}', 'reject')">Reject</button>`;
    } else if (s.status === 'SCHEDULED') {
       actions.innerHTML += `<button class="btn-primary" onclick="updateSession('${s.id}', 'complete')">Complete</button>`;
       actions.innerHTML += `<button class="btn-danger" onclick="updateSession('${s.id}', 'cancel')">Cancel</button>`;
    }
    
    if (actions.innerHTML !== '') card.appendChild(actions);
    container.appendChild(card);
  });
}

async function updateSession(id, action) {
  try {
    const res = await fetch(`http://localhost:8080/api/v1/sessions/${id}/${action}`, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + currentUserToken }
    });
    if (res.ok) fetchSessions();
    else alert("Failed to " + action + " session");
  } catch (e) { console.error(e); }
}

// -- TYPING INDICATORS --
function sendTypingEvent(chatId) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  
  const chat = State.chats.find(c => c.id === chatId);
  if (!chat) return;
  const targetUserId = chat.participants.find(p => p !== currentUser._id);
  if (!targetUserId) return;

  ws.send(JSON.stringify({
    type: "TYPING_STARTED",
    payload: { targetUserId, chatId }
  }));
}

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
      fetchChats();
      fetchSessions();
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
        const data = JSON.parse(event.data);
        logWSEvent(`RECEIVED JSON: \n${JSON.stringify(data, null, 2)}`);
        
        // --- REALTIME ROUTER ---
        if (data.type === 'NEW_MESSAGE') {
            const msg = data.payload;
            if (State.messages[msg.chatId]) {
                State.messages[msg.chatId].push(msg);
                if (State.activeChatId === msg.chatId) renderMessages();
            }
            const ind = document.getElementById('typing-indicator');
            if (State.activeChatId === msg.chatId && ind) ind.style.display = 'none';
        } 
        else if (data.type === 'TYPING_STARTED') {
            if (data.payload.chatId === State.activeChatId) {
                const ind = document.getElementById('typing-indicator');
                if (ind) {
                    ind.style.display = 'block';
                    ind.innerText = "User is typing...";
                    clearTimeout(State.typingTimeouts[data.payload.chatId]);
                    State.typingTimeouts[data.payload.chatId] = setTimeout(() => {
                        ind.style.display = 'none';
                    }, 3000);
                }
            }
        }
        else if (data.type === 'SESSION_UPDATE' || data.type === 'SESSION_PROPOSED' || data.type === 'SESSION_ACCEPTED' || data.type === 'SESSION_REJECTED' || data.type === 'SESSION_CANCELLED') {
            fetchSessions();
        }
        else if (data.type === 'CHAT_UPDATE') {
            fetchChats();
        }
        else if (data.type === 'NOTIFICATION') {
            const list = document.getElementById('notification-list');
            if (list) {
                list.classList.remove('empty');
                list.innerHTML = `<div style="padding: 5px; border-bottom: 1px solid #ccc; font-size: 11px;">${JSON.stringify(data.payload)}</div>` + list.innerHTML;
            }
        }
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
