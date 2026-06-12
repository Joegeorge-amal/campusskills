import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import Avatar from '../components/common/Avatar';
import ChatListItem from '../components/common/ChatListItem';
import ChatMessageBubble from '../components/common/ChatMessageBubble';
import ChatInput from '../components/common/ChatInput';
import { IconSearch, IconCheck, IconX } from '@tabler/icons-react';
import { chatService } from '../services/chatService';
import { chatRequestService } from '../services/chatRequestService';
import { userService } from '../services/userService';

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const Messages = () => {
  const { user } = useAuth();
  const { triggerToast } = useAppData();
  const [searchParams] = useSearchParams();
  
  const [activeChatId, setActiveChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [requests, setRequests] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});

  const fetchChatsAndRequests = async () => {
    try {
      const [chatsRes, reqsRes] = await Promise.all([
        chatService.getUserChats(),
        chatRequestService.getUserRequests()
      ]);

      const chatsData = chatsRes.items || [];
      const reqsData = (reqsRes.items || []).filter(r => r.receiverId === user?.userId && r.status === 'PENDING');

      // Gather unique user IDs to fetch profiles
      const userIdsToFetch = new Set();
      chatsData.forEach(c => {
        const otherId = c.participants?.find(p => p !== user?.userId);
        if (otherId) userIdsToFetch.add(otherId);
      });
      reqsData.forEach(r => {
        userIdsToFetch.add(r.senderId);
      });

      const profilesMap = { ...userProfiles };
      await Promise.all([...userIdsToFetch].map(async (id) => {
        if (!profilesMap[id]) {
          try {
            const profile = await userService.getPublicProfile(id);
            profilesMap[id] = profile;
          } catch (e) {
            console.error('Failed to fetch profile', id);
          }
        }
      }));

      setUserProfiles(profilesMap);

      // Map chats
      const mappedChats = chatsData.map(c => {
        const otherId = c.participants?.find(p => p !== user?.userId);
        const profile = profilesMap[otherId] || { name: 'Unknown User' };
        return {
          id: c._id || c.id,
          rawChat: c,
          name: profile.name,
          init: getInitials(profile.name),
          bg: '#E5E7EB',
          col: '#374151',
          preview: c.lastMessagePreview || 'No messages yet',
          unread: c.unreadCount || 0,
          time: c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          msgs: [] // Mocking messages as they are not fetched yet
        };
      });

      // Map requests
      const mappedReqs = reqsData.map(r => {
        const profile = profilesMap[r.senderId] || { name: 'Unknown User' };
        return {
          id: r._id,
          rawReq: r,
          name: profile.name,
          init: getInitials(profile.name),
          bg: '#E5E7EB',
          col: '#374151',
          message: r.message
        };
      });

      setChats(mappedChats);
      setRequests(mappedReqs);

      // Set initial active chat if passed in URL or just the first one
      if (!activeChatId && !searchParams.get('chatId') && mappedChats.length > 0) {
        setActiveChatId(mappedChats[0].id);
      } else if (!activeChatId && searchParams.get('chatId')) {
        setActiveChatId(searchParams.get('chatId'));
      }
    } catch (err) {
      console.error(err);
      triggerToast('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      fetchChatsAndRequests();
    }
  }, [user]);

  const filteredChats = chats.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.msgs]);

  const handleSend = (text) => {
    if (text.trim() && activeChat) {
      triggerToast('Sending real messages is not fully implemented yet!');
    }
  };

  const handleAcceptRequest = async (id) => {
    try {
      await chatRequestService.acceptRequest(id);
      triggerToast('Request accepted!');
      if (activeChatId === 'requests') {
        setActiveChatId(null);
      }
      fetchChatsAndRequests();
    } catch (err) {
      triggerToast('Failed to accept request');
    }
  };

  const handleDeclineRequest = async (id) => {
    try {
      await chatRequestService.rejectRequest(id);
      triggerToast('Request declined');
      fetchChatsAndRequests();
    } catch (err) {
      triggerToast('Failed to decline request');
    }
  };

  return (
    <div id="chat" className="pg on" style={{ padding: 0, height: 'calc(100vh - 60px)', background: 'var(--cs-bg-light)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', height: '100%', background: 'var(--cs-bg-white)', borderLeft: '0.5px solid var(--cs-border)' }}>
        
        {/* Left: Chat List */}
        <div style={{ width: '280px', display: 'flex', flexDirection: 'column', borderRight: '0.5px solid var(--cs-border)' }}>
          <div style={{ height: '60px', boxSizing: 'border-box', padding: '0 16px', borderBottom: '0.5px solid var(--cs-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }}>
              <IconSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cs-text-inactive)' }} size={14} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 30px', borderRadius: '100px', border: '1px solid var(--cs-border)', background: '#f3f4f6', fontSize: '13px', outline: 'none', color: 'var(--cs-text-main)' }}
              />
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {requests.length > 0 && (
              <div 
                style={{ 
                  padding: '12px', 
                  marginBottom: '12px', 
                  borderRadius: '12px', 
                  background: activeChatId === 'requests' ? '#eff6ff' : '#f8fafc',
                  border: activeChatId === 'requests' ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.2s'
                }}
                onClick={() => setActiveChatId('requests')}
              >
                <div style={{ fontSize: '14px', fontWeight: 600, color: activeChatId === 'requests' ? '#1d4ed8' : '#334155' }}>
                  Message Requests
                </div>
                <div style={{ background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px' }}>
                  {requests.length}
                </div>
              </div>
            )}

            <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', paddingLeft: '4px' }}>
              Conversations
            </div>

            {filteredChats.map(chat => (
              <ChatListItem 
                key={chat.id}
                avatarProps={{ letters: chat.init, bgColor: chat.bg, textColor: chat.col, size: '36px', fontSize: '13px' }}
                isOnline={false}
                name={chat.name}
                preview={chat.preview}
                time={chat.time}
                unreadCount={chat.unread}
                isActive={activeChatId === chat.id}
                onClick={() => setActiveChatId(chat.id)}
              />
            ))}

            {!loading && filteredChats.length === 0 && (
              <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '24px 0' }}>
                No conversations yet.
              </div>
            )}
          </div>
        </div>

        {/* Right: Chat Main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--cs-bg-light)', overflow: 'hidden' }}>
          
          {activeChatId === 'requests' ? (
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '24px' }}>
                Message Requests
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {requests.map(req => (
                  <div key={req.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <Avatar letters={req.init} bgColor={req.bg} textColor={req.col} size="48px" fontSize="18px" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>{req.name}</div>
                      <div style={{ fontSize: '14px', color: '#475569', marginTop: '4px' }}>{req.message || 'Wants to chat with you'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleDeclineRequest(req.id)}
                        style={{ width: '36px', height: '36px', borderRadius: '100px', border: '1px solid #e2e8f0', background: '#fff', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <IconX size={18} />
                      </button>
                      <button 
                        onClick={() => handleAcceptRequest(req.id)}
                        style={{ width: '36px', height: '36px', borderRadius: '100px', border: 'none', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <IconCheck size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeChat ? (
            <>
              {/* Header */}
              <div style={{ height: '60px', boxSizing: 'border-box', padding: '0 24px', background: 'var(--cs-bg-white)', borderBottom: '0.5px solid var(--cs-border)', display: 'flex', alignItems: 'center', gap: '12px', userSelect: 'none' }}>
                <Avatar letters={activeChat.init} bgColor={activeChat.bg} textColor={activeChat.col} size="36px" fontSize="14px" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-main)' }}>{activeChat.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--cs-text-inactive)', marginTop: '2px' }}>
                    Offline
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                {activeChat.msgs.map((msg, i) => (
                  <ChatMessageBubble 
                    key={msg.id || i}
                    isMe={msg.f === 'me'}
                    avatarProps={{ letters: activeChat.init, bgColor: activeChat.bg, textColor: activeChat.col }}
                    payload={msg}
                  />
                ))}
                {activeChat.msgs.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', margin: 'auto' }}>
                    No messages yet. Send a message to start the conversation!
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <ChatInput onSend={handleSend} />
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--cs-text-inactive)', fontSize: '14px', fontWeight: 500 }}>
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
