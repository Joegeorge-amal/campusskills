import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import Avatar from '../components/common/Avatar';
import { IconEdit, IconSearch, IconInfoCircle, IconPaperclip, IconSend } from '@tabler/icons-react';

const Messages = () => {
  const { conversations, sendChatMessage, acceptRequest, declineRequest } = useAppData();
  const [searchParams] = useSearchParams();
  const initialChatId = searchParams.get('chatId') ? parseInt(searchParams.get('chatId')) : conversations[0]?.id;
  
  const [activeChatId, setActiveChatId] = useState(initialChatId);
  const [inputMsg, setInputMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const activeChat = conversations.find(c => c.id === activeChatId) || conversations[0];
  
  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.skill.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.msgs]);

  const handleSend = () => {
    if (inputMsg.trim() && activeChat) {
      sendChatMessage(activeChat.id, inputMsg);
      setInputMsg('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div id="chat" className="pg on" style={{ padding: 0 }}>
      <div className="chat-wrap">
        {/* Left: Chat List */}
        <div className="cl-list">
          <div className="cl-hdr">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#222' }}>Messages</span>
              <button style={{ width: '22px', height: '22px', borderRadius: '6px', border: '0.5px solid rgba(0,0,0,.1)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#888', fontSize: '12px' }}>
                <IconEdit />
              </button>
            </div>
            <div className="cl-s">
              <IconSearch style={{ fontSize: '11px', color: '#aaa' }} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="cl-items">
            {filteredConversations.map(chat => (
              <div 
                key={chat.id} 
                className={`ci ${activeChatId === chat.id ? 'on' : ''}`}
                onClick={() => setActiveChatId(chat.id)}
              >
                <div className="caw">
                  <Avatar letters={chat.init} bgColor={chat.bg} textColor={chat.col} size="33px" fontSize="11px" />
                  {chat.online ? <div className="dot-on"></div> : <div className="dot-on dot-off"></div>}
                </div>
                <div className="ci-inf">
                  <div className="ci-nm">{chat.name}</div>
                  <div className="ci-pv">{chat.preview}</div>
                </div>
                <div className="ci-mt">
                  <div className="ci-tm">{chat.time}</div>
                  {chat.unread > 0 && <div className="ci-un">{chat.unread}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Chat Main */}
        <div className="chat-main">
          {activeChat ? (
            <>
              {/* Header */}
              <div className="chat-hdr">
                <Avatar letters={activeChat.init} bgColor={activeChat.bg} textColor={activeChat.col} size="36px" fontSize="12px" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#222' }}>{activeChat.name}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>
                    {activeChat.online ? <span style={{ color: '#1D9E75' }}>● Online</span> : 'Offline'} · {activeChat.skill}
                  </div>
                </div>
                <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,.1)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#555', fontSize: '16px' }}>
                  <IconInfoCircle />
                </button>
              </div>

              {/* Messages Area */}
              <div className="chat-msgs">
                {activeChat.msgs.map((msg, i) => {
                  const isMe = msg.f === 'me';
                  
                  if (msg.type === 'pay' || msg.type === 'swap') {
                    // Custom rich bubble for requests
                    return (
                      <div key={i} className={`mrow ${isMe ? 'me' : ''}`} style={{ marginBottom: '4px' }}>
                        {!isMe && (
                          <div className="mav" style={{ background: activeChat.bg, color: activeChat.col }}>{activeChat.init}</div>
                        )}
                        <div className="rbbl">
                          <div className="rbt">{msg.title}</div>
                          <div className="rbs">{msg.sub}</div>
                          {!isMe && (
                            <div className="rbbtns">
                              <button className="rbacc" onClick={() => acceptRequest(msg.reqId || Date.now())}>Accept</button>
                              <button className="rbdec" onClick={() => declineRequest(msg.reqId || Date.now())}>Decline</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={i} className={`mrow ${isMe ? 'me' : ''}`} style={{ marginBottom: '4px' }}>
                      {!isMe && (
                        <div className="mav" style={{ background: activeChat.bg, color: activeChat.col }}>{activeChat.init}</div>
                      )}
                      <div className={`bbl ${isMe ? 'me' : 'them'}`}>
                        {msg.t}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <div className="cin-bar">
                <button style={{ width: '26px', height: '26px', borderRadius: '7px', border: '0.5px solid rgba(0,0,0,.1)', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#888', fontSize: '14px' }}>
                  <IconPaperclip />
                </button>
                <input 
                  className="cin" 
                  type="text" 
                  placeholder="Type a message..."
                  value={inputMsg}
                  onChange={e => setInputMsg(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button className="csend" onClick={handleSend}>
                  <IconSend />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', fontSize: '13px' }}>
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
