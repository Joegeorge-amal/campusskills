import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import Avatar from '../components/common/Avatar';
import ChatListItem from '../components/common/ChatListItem';
import ChatMessageBubble from '../components/common/ChatMessageBubble';
import ChatInput from '../components/common/ChatInput';
import { IconEdit, IconSearch, IconInfoCircle } from '@tabler/icons-react';

const Messages = () => {
  const { conversations, sendChatMessage, acceptRequest, declineRequest } = useAppData();
  const [searchParams] = useSearchParams();
  const initialChatId = searchParams.get('chatId') ? parseInt(searchParams.get('chatId')) : conversations[0]?.id;
  
  const [activeChatId, setActiveChatId] = useState(initialChatId);
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

  const handleSend = (text) => {
    if (text.trim() && activeChat) {
      sendChatMessage(activeChat.id, text);
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
            {filteredConversations.map(chat => (
              <ChatListItem 
                key={chat.id}
                avatarProps={{ letters: chat.init, bgColor: chat.bg, textColor: chat.col, size: '36px', fontSize: '13px' }}
                isOnline={chat.online}
                name={chat.name}
                preview={chat.preview}
                time={chat.time}
                unreadCount={chat.unread}
                isActive={activeChatId === chat.id}
                onClick={() => setActiveChatId(chat.id)}
              />
            ))}
          </div>
        </div>

        {/* Right: Chat Main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--cs-bg-light)', overflow: 'hidden' }}>
          {activeChat ? (
            <>
              {/* Header */}
              <div style={{ height: '60px', boxSizing: 'border-box', padding: '0 24px', background: 'var(--cs-bg-white)', borderBottom: '0.5px solid var(--cs-border)', display: 'flex', alignItems: 'center', gap: '12px', userSelect: 'none' }}>
                <Avatar letters={activeChat.init} bgColor={activeChat.bg} textColor={activeChat.col} size="36px" fontSize="14px" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-main)' }}>{activeChat.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--cs-text-inactive)', marginTop: '2px' }}>
                    {activeChat.online ? <span style={{ color: '#1D9E75', fontWeight: 500 }}>Online</span> : 'Offline'}
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
                    onAccept={acceptRequest}
                    onDecline={declineRequest}
                  />
                ))}
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
