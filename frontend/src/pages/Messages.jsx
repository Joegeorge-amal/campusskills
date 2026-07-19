import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { useWebSocket } from '../context/WebSocketContext';
import Avatar from '../components/common/Avatar';
import ChatListItem from '../components/common/ChatListItem';
import ChatMessageBubble from '../components/common/ChatMessageBubble';
import ChatInput from '../components/common/ChatInput';
import { IconSearch, IconCheck, IconX, IconTrash, IconMessageCircle, IconArrowLeft } from '@tabler/icons-react';
import { chatService } from '../services/chatService';
import { chatRequestService } from '../services/chatRequestService';
import { messageService } from '../services/messageService';
import { userService } from '../services/userService';
import { AnimatePresence } from 'framer-motion';
import DeleteChatModal from '../components/modals/DeleteChatModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ModalWrapper from '../components/common/ModalWrapper';

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const Messages = () => {
  const { user } = useAuth();
  const { triggerToast, searchQuery, setSearchQuery } = useAppData();
  const { chatId: activeChatId } = useParams();
  const navigate = useNavigate();
  const { lastMessage, sendMessage: sendSocketEvent } = useWebSocket();
  const [chatFilter, setChatFilter] = useState('all'); // 'all', 'unread', 'read'
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleNavigate = () => navigate('/app/sessions');
    document.addEventListener('navigateToSessions', handleNavigate);
    return () => document.removeEventListener('navigateToSessions', handleNavigate);
  }, [navigate]);

  const { 
    chats, setChats, 
    chatRequests: requests, setChatRequests: setRequests, 
    chatMessages, setChatMessages,
    isChatsLoading: loading,
    fetchInitialData
  } = useAppData();


  const [typingUsers, setTypingUsers] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blockingUser, setBlockingUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [deletingMessage, setDeletingMessage] = useState(null);
  const typingThrottleRef = useRef(0);
  const isTypingRef = useRef(false);
  const chatsRef = useRef(chats);
  
  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState({});
  const messagesContainerRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [unreadNewMessages, setUnreadNewMessages] = useState(0);

  // Refs to avoid stale closures in the WebSocket handler and prevent duplicate processing
  const activeChatIdRef = useRef(activeChatId);
  useEffect(() => {
    console.log('[Messages] chat switched:', activeChatId);
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);
  const processedWsRef = useRef(null);

  // Load historical messages when active chat changes
  useEffect(() => {
    if (activeChatId && activeChatId !== 'requests') {
      // Always fetch history from API (merges with any WS-pre-populated messages)
      const isNewChat = !chatMessages[activeChatId];
      if (isNewChat) setIsMessagesLoading(true);
      messageService.getMessages(activeChatId, { page: 1, limit: 50 }).then(res => {
        setIsMessagesLoading(false);
        const fetchedItems = res.items || [];
        if (isNewChat) {
          setChatMessages(prev => ({ ...prev, [activeChatId]: fetchedItems }));
        } else {
          setChatMessages(prev => {
            const existing = prev[activeChatId] || [];
            const existingIds = new Set(existing.map(m => m._id || m.id));
            const newItems = fetchedItems.filter(m => !existingIds.has(m._id || m.id));
            if (newItems.length === 0) return prev;
            return { ...prev, [activeChatId]: [...newItems, ...existing] };
          });
        }
        setHasMoreMessages(prev => ({ ...prev, [activeChatId]: fetchedItems.length === 50 }));
        
        // Scroll to the bottom instantly after render
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
        }, 100);

      }).catch(err => {
        setIsMessagesLoading(false);
        console.error(err);
      });

      messageService.markAsRead(activeChatId).catch(console.error);
      window.dispatchEvent(new CustomEvent('markNotificationAsRead', { detail: { sourceType: 'CHAT', sourceId: activeChatId } }));
      setChats(prevChats => prevChats.map(c => c.id === activeChatId ? { ...c, unread: 0 } : c));

      setShowScrollBottom(false);
      setUnreadNewMessages(0);
    }
  }, [activeChatId]);

  // Handle incoming WebSocket messages
  // Backend sends { type, timestamp, payload } — NOT { event, data }
  // Only depends on lastMessage (NOT activeChatId) to avoid stale re-processing on chat switch.
  // activeChatIdRef provides the current chat context without triggering re-runs.
  useEffect(() => {
    if (!lastMessage || !lastMessage.type) return;
    if (processedWsRef.current === lastMessage) return;
    processedWsRef.current = lastMessage;

    const currentChatId = activeChatIdRef.current;
    const { type, payload } = lastMessage;

    if (type === 'NEW_MESSAGE') {
      const msg = payload;
      const chatId = msg.chatId;
      const isOwnMessage = msg.senderId === user?.userId;

      let isAtBottom = false;
      if (currentChatId === chatId) {
        const container = messagesContainerRef.current;
        if (container) {
          isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
        }
      }

      // If this chat was hidden/deleted and just received a message, refetch to restore it
      if (!chatsRef.current.some(c => c.id === chatId)) {
        fetchInitialData();
      }

      setChatMessages(prev => {
        const chatMsgs = prev[chatId] || [];
        
        const existingIndex = chatMsgs.findIndex(m => 
          (msg.tempId && m.tempId === msg.tempId) || 
          (m._id && m._id === msg._id) || 
          (m.id && m.id === msg.id) || 
          (m.id && m.id === msg._id)
        );
        
        if (existingIndex !== -1) {
          const newMsgs = [...chatMsgs];
          newMsgs[existingIndex] = { ...newMsgs[existingIndex], ...msg, status: newMsgs[existingIndex].status === 'failed' ? 'failed' : 'sent' };
          return { ...prev, [chatId]: newMsgs };
        }
        
        return { ...prev, [chatId]: [...chatMsgs, msg] };
      });
      
      setChats(prevChats => prevChats.map(c => {
        if (c.id === chatId) {
          const isMe = msg.senderId === user?.userId;
          return {
            ...c,
            preview: isMe ? 'You: ' + msg.message : msg.message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: (currentChatId !== chatId) ? (c.unread || 0) + 1 : 0
          };
        }
        return c;
      }));

      // Acknowledge delivery for incoming messages (now handled globally in AppDataContext)
      

      if (currentChatId === chatId) {
        messageService.markAsRead(chatId).catch(console.error);
        window.dispatchEvent(new CustomEvent('markNotificationAsRead', { detail: { sourceType: 'CHAT', sourceId: chatId } }));
        if (isOwnMessage) {
          // Always scroll to bottom when YOU send a message
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        } else if (isAtBottom) {
          // Other person sent and we're at the bottom — auto scroll
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        } else {
          // Other person sent and we're scrolled up — show pill
          setUnreadNewMessages(prev => prev + 1);
          setShowScrollBottom(true);
        }
      }

    } else if (type === 'MESSAGE_EDITED') {
      const { messageId, chatId, message, editedAt } = payload;
      setChatMessages(prev => {
        const chatMsgs = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: chatMsgs.map(m =>
            (m._id === messageId || m.id === messageId)
              ? { ...m, message, editedAt, isEdited: true }
              : m
          )
        };
      });
      // Scroll to bottom if near bottom
      if (currentChatId === chatId) {
        const container = messagesContainerRef.current;
        if (container && container.scrollHeight - container.scrollTop - container.clientHeight < 150) {
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
      }

    } else if (type === 'MESSAGE_DELETED') {
      const { messageId, chatId, message: deletedText, isDeleted, deletedAt } = payload;
      setChatMessages(prev => {
        const chatMsgs = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: chatMsgs.map(m =>
            (m._id === messageId || m.id === messageId)
              ? { ...m, message: deletedText, isDeleted, deletedAt }
              : m
          )
        };
      });
      // Scroll to bottom if near bottom
      if (currentChatId === chatId) {
        const container = messagesContainerRef.current;
        if (container && container.scrollHeight - container.scrollTop - container.clientHeight < 150) {
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
      }

    } else if (type === 'MESSAGE_DELIVERED') {
      const { messageId, chatId } = payload;
      setChatMessages(prev => {
        const chatMsgs = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: chatMsgs.map(m => {
            const matches = messageId ? (m._id === messageId || m.id === messageId) : true;
            if (!matches) return m;
            return {
              ...m,
              isDelivered: true,
              status: m.isRead ? 'read' : 'delivered'
            };
          })
        };
      });
    } else if (type === 'MESSAGE_READ') {
      const { messageId, chatId } = payload;
      setChatMessages(prev => {
        const chatMsgs = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: chatMsgs.map(m => {
            const matches = messageId ? (m._id === messageId || m.id === messageId) : true;
            if (!matches) return m;
            return {
              ...m,
              isRead: true,
              isDelivered: true,
              status: 'read'
            };
          })
        };
      });
    } else if (type === 'TYPING_STARTED') {
      const { chatId, userId } = payload;
      // Only show typing for the other user in the active chat
      if (userId !== user?.userId) {
        setTypingUsers(prev => ({ ...prev, [`${chatId}_${userId}`]: true }));
        // Scroll to show typing bubble if already near bottom
        if (currentChatId === chatId) {
          const container = messagesContainerRef.current;
          if (container && container.scrollHeight - container.scrollTop - container.clientHeight < 150) {
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
          }
        }
        // Auto-clear after 5s in case TYPING_STOPPED is missed
        setTimeout(() => {
          setTypingUsers(prev => ({ ...prev, [`${chatId}_${userId}`]: false }));
        }, 5000);
      }
    } else if (type === 'TYPING_STOPPED') {
      const { chatId, userId } = payload;
      setTypingUsers(prev => ({ ...prev, [`${chatId}_${userId}`]: false }));
    }
  }, [lastMessage]);

  const filteredChats = chats.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const isUnread = c.unread > 0;
    if (!matchesSearch) return false;
    if (chatFilter === 'unread' && !isUnread) return false;
    if (chatFilter === 'read' && isUnread) return false;
    return true;
  });

  const activeChat = chats.find(c => c.id === activeChatId);
  const activeChatMsgs = chatMessages[activeChatId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottom(false);
    setUnreadNewMessages(0);
  };

  const handleScroll = async () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    if (isAtBottom && showScrollBottom) {
      setShowScrollBottom(false);
      setUnreadNewMessages(0);
    }

    if (container.scrollTop < 50 && hasMoreMessages[activeChatId] && !loadingOlder) {
      setLoadingOlder(true);
      try {
        const currentPage = Math.floor(activeChatMsgs.length / 50) + 1;
        const res = await messageService.getMessages(activeChatId, { page: currentPage, limit: 50 });
        
        if (res.items && res.items.length > 0) {
          const oldScrollHeight = container.scrollHeight;
          
          setChatMessages(prev => ({
            ...prev,
            [activeChatId]: [...res.items, ...prev[activeChatId]]
          }));
          
          setHasMoreMessages(prev => ({
            ...prev,
            [activeChatId]: res.items.length === 50
          }));

          setTimeout(() => {
            container.scrollTop = container.scrollHeight - oldScrollHeight;
          }, 0);
        } else {
          setHasMoreMessages(prev => ({ ...prev, [activeChatId]: false }));
        }
      } catch (error) {
        console.error('Failed to fetch older messages', error);
      } finally {
        setLoadingOlder(false);
      }
    }
  };

  const handleSend = async (text) => {
    if (text.trim() && activeChat) {
      if (editingMessage) {
        try {
          const msgId = editingMessage._id || editingMessage.id;
          setEditingMessage(null);

          await messageService.editMessage(msgId, text);
        } catch (err) {
          console.error(err);
          triggerToast(err?.response?.data?.error || err?.response?.data?.message || 'Failed to edit message');
        }
      } else {
        let newMessageObj = null;
        try {
          const replyId = replyingTo ? (replyingTo._id || replyingTo.id) : null;
          newMessageObj = {
            tempId: Date.now().toString(),
            chatId: activeChatId,
            senderId: user?.userId,
            message: text,
            replyToMessageId: replyId,
            createdAt: new Date().toISOString(),
            status: 'sent'
          };

          // Optimistic append — always scroll to bottom immediately when YOU send
          setChatMessages(prev => ({
            ...prev,
            [activeChatId]: [...(prev[activeChatId] || []), newMessageObj]
          }));
          setReplyingTo(null);
          // Use instant scroll for own message send so it doesn't feel laggy
          requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          });

          // Send to backend
          const res = await messageService.sendMessage(activeChatId, text, replyId, newMessageObj.tempId);
          
          // Update the sent message with actual DB ID
          setChatMessages(prev => ({
            ...prev,
            [activeChatId]: prev[activeChatId].map(m => 
              m.tempId === newMessageObj.tempId ? { ...res, tempId: m.tempId, status: 'sent', isDelivered: res.isDelivered, isRead: res.isRead } : m
            )
          }));

          // Update list preview
          setChats(prevChats => prevChats.map(c => {
            if (c.id === activeChatId) {
              return { ...c, preview: text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
            }
            return c;
          }));
        } catch (err) {
          console.error(err);
          triggerToast('Failed to send message');
          setChatMessages(prev => ({
            ...prev,
            [activeChatId]: prev[activeChatId].map(m => 
              m.tempId === newMessageObj?.tempId ? { ...m, status: 'failed' } : m
            )
          }));
        }
      }
      isTypingRef.current = false;
      sendSocketEvent('TYPING_STOPPED', { chatId: activeChatId });
    }
  };

  // Reset typing state when switching chats
  useEffect(() => {
    isTypingRef.current = false;
    typingThrottleRef.current = 0;
  }, [activeChatId]);

  const handleDeleteMessage = (msg) => {
    setDeletingMessage(msg);
  };

  const confirmDeleteMessage = async () => {
    if (!deletingMessage) return;
    try {
      const msgId = deletingMessage._id || deletingMessage.id;
      
      setDeletingMessage(null);

      await messageService.deleteMessage(msgId);
    } catch (err) {
      console.error(err);
      triggerToast(err?.response?.data?.error || err?.response?.data?.message || 'Failed to delete message');
    }
  };

  const handleRetry = async (payload) => {
    if (payload && payload.status === 'failed') {
      const tempId = payload.tempId || payload.id;
      
      setChatMessages(prev => {
        const msgs = prev[activeChatId] || [];
        return { ...prev, [activeChatId]: msgs.map(m => m.tempId === tempId ? { ...m, status: 'sent' } : m) };
      });

      try {
        const sentMsg = await messageService.sendMessage(activeChatId, payload.message, null, tempId);
        
        setChatMessages(prev => {
          const msgs = prev[activeChatId] || [];
          return { ...prev, [activeChatId]: msgs.map(m => m.tempId === tempId ? { ...sentMsg, status: 'sent', isDelivered: sentMsg.isDelivered, isRead: sentMsg.isRead } : m) };
        });
      } catch (err) {
        setChatMessages(prev => {
          const msgs = prev[activeChatId] || [];
          return { ...prev, [activeChatId]: msgs.map(m => m.tempId === tempId ? { ...m, status: 'failed' } : m) };
        });
      }
    }
  };

  const handleTyping = useCallback((isTyping) => {
    if (!activeChatId || activeChatId === 'requests') return;
    const now = Date.now();
    if (isTyping) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        sendSocketEvent('TYPING_STARTED', { chatId: activeChatId });
        typingThrottleRef.current = now;
      } else if (now - typingThrottleRef.current > 3000) {
        sendSocketEvent('TYPING_STARTED', { chatId: activeChatId });
        typingThrottleRef.current = now;
      }
    } else {
      isTypingRef.current = false;
      sendSocketEvent('TYPING_STOPPED', { chatId: activeChatId });
    }
  }, [activeChatId, sendSocketEvent]);

  const handleAcceptRequest = async (id) => {
    try {
      const res = await chatRequestService.acceptRequest(id);
      if (res && res.chatId) {
        navigate('/app/messages/' + res.chatId);
      } else if (activeChatId === 'requests') {
        navigate('/app/messages');
      }
      fetchInitialData();
    } catch (err) {
      triggerToast('Failed to accept request');
    }
  };

  const handleDeclineRequest = async (id) => {
    try {
      await chatRequestService.rejectRequest(id);
      fetchInitialData();
    } catch (err) {
      triggerToast('Failed to decline request');
    }
  };

  const handleDeleteChat = async () => {
    if (!activeChatId) return;
    setIsDeleting(true);
    try {
      await chatService.deleteChat(activeChatId);
      triggerToast('Chat deleted successfully', 'success');
      setShowDeleteModal(false);
      setChats(prev => prev.filter(c => c.id !== activeChatId));
      navigate('/app/messages');
    } catch (e) {
      triggerToast('Failed to delete chat');
    } finally {
      setIsDeleting(false);
    }
  };

  const isOtherUserTyping = activeChat && typingUsers[`${activeChat.id}_${activeChat.otherId}`];

  return (
    <div id="chat" className="pg on" style={{ padding: 0, height: 'calc(100vh - 60px)', background: 'var(--cs-bg-light)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', height: '100%', background: 'var(--cs-bg-white)', borderLeft: '0.5px solid var(--cs-border)' }}>
        
        {/* Left: Chat List */}
        <div style={{ width: '280px', display: 'flex', flexDirection: 'column', borderRight: '0.5px solid var(--cs-border)' }}>
          <div style={{ boxSizing: 'border-box', padding: '16px', borderBottom: '0.5px solid var(--cs-border)', display: 'flex', flexDirection: 'column' }}>
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
            
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              {['all', 'unread', 'read'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setChatFilter(filter)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '100px',
                    border: '1px solid',
                    borderColor: chatFilter === filter ? 'var(--cs-primary)' : 'var(--cs-border)',
                    background: chatFilter === filter ? 'var(--cs-primary-light)' : 'var(--cs-bg-white)',
                    color: chatFilter === filter ? 'var(--cs-primary)' : 'var(--cs-text-inactive)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {filter}
                </button>
              ))}
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
                onClick={() => navigate('/app/messages/requests')}
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

            {filteredChats.map(c => {
              const msgs = chatMessages[c.id];
              let displayPreview = c.preview;
              let displayTime = c.time;
              
              if (msgs && msgs.length > 0) {
                const lastMsg = msgs[msgs.length - 1];
                const isMe = lastMsg.senderId === user?.userId;
                if (lastMsg.isDeleted) {
                  displayPreview = isMe ? 'You deleted this message' : 'This message was deleted';
                } else {
                  displayPreview = isMe ? 'You: ' + lastMsg.message : lastMsg.message;
                }
                displayTime = new Date(lastMsg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }
              
              return (
                <ChatListItem 
                  key={c.id} 
                  id={c.id}
                  name={c.name} 
                  preview={displayPreview} 
                  time={displayTime} 
                  unreadCount={c.unread}
                  isActive={activeChatId === c.id}
                  onClick={() => {
                    navigate('/app/messages/' + c.id);
                  }}
                  avatarProps={{ initials: c.init, bg: c.bg, color: c.col, backgroundImage: c.avatar }}
                />
              );
            })}

            {!loading && filteredChats.length === 0 && (
              <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '24px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ fontWeight: 700, color: '#1f2937' }}>No conversations yet</div>
                <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '200px', margin: '0 auto', lineHeight: '1.4' }}>Start exploring the marketplace to connect with peers.</div>
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
                    <Avatar initials={req.init} bg={req.bg} color={req.col} backgroundImage={req.avatar} size="48px" fontSize="18px" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>{req.name}</div>
                      <div style={{ fontSize: '14px', color: '#475569', marginTop: '4px' }}>{req.message || 'Wants to chat with you'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => {
                          setBlockingUser({
                            id: req.rawReq.senderId,
                            name: req.name,
                            callback: fetchChatsAndRequests
                          });
                        }}
                        style={{ width: '36px', height: '36px', borderRadius: '100px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', title: 'Block User' }}
                      >
                        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>🚫</span>
                      </button>
                      <button 
                        onClick={() => handleDeclineRequest(req.id)}
                        style={{ width: '36px', height: '36px', borderRadius: '100px', border: '1px solid #e2e8f0', background: '#fff', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', title: 'Decline' }}
                      >
                        <IconX size={18} />
                      </button>
                      <button 
                        onClick={() => handleAcceptRequest(req.id)}
                        style={{ width: '36px', height: '36px', borderRadius: '100px', border: 'none', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', title: 'Accept' }}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={() => navigate('/app/messages')}
                    style={{ background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '4px', borderRadius: '50%' }}
                  >
                    <IconArrowLeft size={20} />
                  </button>
                </div>
                
                <div 
                  onClick={() => navigate(`/app/user/${activeChat.otherId}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}
                >
                  <Avatar initials={activeChat.init} bg={activeChat.bg} color={activeChat.col} backgroundImage={activeChat.avatar} size="36px" fontSize="14px" />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-main)' }}>{activeChat.name}</div>
                    <div style={{ fontSize: '12px', color: activeChat.isOnline ? '#10b981' : 'var(--cs-text-inactive)', marginTop: '2px' }}>
                      {isOtherUserTyping ? 'Typing...' : (activeChat.isOnline ? 'Online' : 'Offline')}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setBlockingUser({
                      id: activeChat.otherId,
                      name: activeChat.name
                    });
                  }}
                  style={{ width: '36px', height: '36px', borderRadius: '100px', border: 'none', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', title: 'Block User' }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>🚫</span>
                </button>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  style={{ width: '36px', height: '36px', borderRadius: '100px', border: 'none', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', title: 'Delete Chat' }}
                >
                  <IconTrash size={18} />
                </button>
              </div>

              {/* Right side (Messages) */}
              <div 
                ref={messagesContainerRef}
                onScroll={handleScroll}
                style={{ 
                flex: 1, height: '100%', background: '#f8fafc', 
                display: 'flex', flexDirection: 'column',
                overflowY: 'auto', padding: '16px', boxSizing: 'border-box', position: 'relative'
              }}>
                <div style={{ flex: 1 }} />
                {loadingOlder && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', opacity: 0.6 }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #cbd5e1', borderTopColor: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                  </div>
                )}
                {activeChatMsgs.map((msg, i) => {
                  let status = msg.status;
                  if (!status && msg.senderId === user?.userId) {
                    if (msg.isRead) status = 'read';
                    else if (msg.isDelivered) status = 'delivered';
                    else status = 'sent';
                  }

                  const replyToMessage = msg.replyToMessageId ? activeChatMsgs.find(m => m._id === msg.replyToMessageId || m.id === msg.replyToMessageId) : null;
                  
                  const isMe = msg.senderId === user?.userId;
                  const now = Date.now();
                  const createdAt = msg.createdAt ? new Date(msg.createdAt).getTime() : 0;
                  const ageMs = now - createdAt;
                  const canEdit = isMe && ageMs <= 10 * 60 * 1000;
                  const canDelete = isMe && ageMs <= 15 * 60 * 1000;

                  return (
                    <div key={msg.tempId || msg._id || msg.id || i} id={'msg-' + (msg.tempId || msg._id || msg.id)}>
                      <ChatMessageBubble 
                        isMe={isMe}
                        avatarProps={{ initials: activeChat.init, bg: activeChat.bg, color: activeChat.col, backgroundImage: activeChat.avatar }}
                        payload={{
                          t: msg.message,
                          time: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          f: isMe ? 'me' : 'them',
                          status: status,
                          ...msg
                        }}
                        onRetry={handleRetry}
                        onReply={() => setReplyingTo(msg)}
                        onEdit={canEdit ? () => setEditingMessage(msg) : undefined}
                        onDelete={canDelete ? () => handleDeleteMessage(msg) : undefined}
                        replyToMessage={replyToMessage}
                      />
                    </div>
                  );
                })}
                {isMessagesLoading && activeChatMsgs.length === 0 ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0', margin: 'auto' }}>
                    <LoadingSpinner />
                  </div>
                ) : !isMessagesLoading && activeChatMsgs.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', margin: 'auto' }}>
                    No messages yet. Send a message to start the conversation!
                  </div>
                ) : null}

                {/* Typing indicator bubble */}
                {isOtherUserTyping && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '4px' }}>
                    <Avatar
                      initials={activeChat.init}
                      bg={activeChat.bg}
                      color={activeChat.col}
                      backgroundImage={activeChat.avatar}
                      size="28px"
                      fontSize="11px"
                    />
                    <div style={{
                      background: 'var(--cs-bg-white)',
                      border: '1px solid var(--cs-border)',
                      borderRadius: '18px 18px 18px 4px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
                    }}>
                      <span style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        background: '#94a3b8',
                        display: 'inline-block',
                        animation: 'typingBounce 1.2s ease-in-out infinite',
                        animationDelay: '0s'
                      }} />
                      <span style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        background: '#94a3b8',
                        display: 'inline-block',
                        animation: 'typingBounce 1.2s ease-in-out infinite',
                        animationDelay: '0.2s'
                      }} />
                      <span style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        background: '#94a3b8',
                        display: 'inline-block',
                        animation: 'typingBounce 1.2s ease-in-out infinite',
                        animationDelay: '0.4s'
                      }} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Scroll to bottom Pill */}
              <AnimatePresence>
                {showScrollBottom && (
                  <div style={{ position: 'absolute', bottom: '80px', right: '24px', zIndex: 10 }}>
                    <button
                      onClick={scrollToBottom}
                      style={{
                        background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '100px',
                        padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        cursor: 'pointer', color: '#1e293b', fontWeight: 600, fontSize: '13px',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      {unreadNewMessages > 0 ? (
                        <div style={{ background: '#3b82f6', color: '#fff', borderRadius: '100px', padding: '2px 8px', fontSize: '12px' }}>
                          {unreadNewMessages} New
                        </div>
                      ) : (
                        <IconArrowLeft size={16} style={{ transform: 'rotate(-90deg)' }} />
                      )}
                      <span style={{ color: '#64748b' }}>Scroll to bottom</span>
                    </button>
                  </div>
                )}
              </AnimatePresence>

              {/* Input Bar */}
              <ChatInput 
                onSend={handleSend} 
                onChange={(e) => handleTyping(e.target.value.length > 0)}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
                editingMessage={editingMessage}
                onCancelEdit={() => setEditingMessage(null)}
              />

              {/* Delete Message Modal */}
              <ModalWrapper isOpen={!!deletingMessage} onClose={() => setDeletingMessage(null)} maxWidth="320px" zIndex={1000}>
                <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600, color: 'var(--cs-text-main)' }}>Delete message?</h3>
                  <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'var(--cs-text-inactive)' }}>Are you sure you want to delete this message? This action cannot be undone.</p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setDeletingMessage(null)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={confirmDeleteMessage} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              </ModalWrapper>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--cs-text-inactive)' }}>
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '100px', 
                background: '#f1f5f9', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', marginBottom: '16px' 
              }}>
                <IconMessageCircle size={40} color="#94a3b8" stroke={1.5} />
              </div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--cs-text-main)', marginBottom: '8px' }}>
                Your Messages
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                Select a conversation to start chatting.
              </div>
            </div>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteChatModal 
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteChat}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>

      <ModalWrapper isOpen={!!blockingUser} onClose={() => { if (!blockingUser?.loading) setBlockingUser(null) }} maxWidth="320px" zIndex={1000}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600, color: 'var(--cs-text-main)' }}>Block {blockingUser?.name}?</h3>
          <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'var(--cs-text-inactive)', lineHeight: '1.4' }}>Are you sure you want to block this user? They will not be able to message you or view your listings.</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => setBlockingUser(null)} 
              disabled={blockingUser?.loading}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer', opacity: blockingUser?.loading ? 0.7 : 1 }}
            >
              Cancel
            </button>
            <button 
              disabled={blockingUser?.loading}
              onClick={async () => {
                const targetId = blockingUser.id;
                const callback = blockingUser.callback;
                setBlockingUser({ ...blockingUser, loading: true });
                try {
                  await userService.blockUser(targetId);
                  triggerToast('User blocked successfully');
                  setBlockingUser(null);
                  if (callback) {
                    callback();
                  } else {
                    navigate('/app/messages');
                    window.location.reload();
                  }
                } catch (e) {
                  console.error('[Messages] Failed to block user:', e);
                  triggerToast('Failed to block user');
                  setBlockingUser(null);
                }
              }} 
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 600, cursor: blockingUser?.loading ? 'not-allowed' : 'pointer', opacity: blockingUser?.loading ? 0.7 : 1 }}
            >
              {blockingUser?.loading ? 'Blocking...' : 'Block'}
            </button>
          </div>
        </div>
      </ModalWrapper>
    </div>
  );
};

export default Messages;
