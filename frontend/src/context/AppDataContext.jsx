
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from './WebSocketContext';
import { useAuth } from './AuthContext';
import { chatService } from '../services/chatService';
import { userService } from '../services/userService';
import { exchangeService } from '../services/exchangeService';
import { chatRequestService } from '../services/chatRequestService';
import { listingService } from '../services/listingService';
import { sessionService } from '../services/sessionService';

const AppDataContext = createContext();

export const AppDataProvider = ({ children }) => {
  const { user, updateProfile } = useAuth();
  const [toastMessage, setToastMessage] = useState(null);
  
  const [chats, setChats] = useState([]);
  const [chatMessages, setChatMessages] = useState({});
  const [chatRequests, setChatRequests] = useState([]);
  const [requestsData, setRequestsData] = useState([]);
  const [sessionsData, setSessionsData] = useState([]);
  
  const [isChatsLoading, setIsChatsLoading] = useState(true);
  const [isRequestsLoading, setIsRequestsLoading] = useState(true);
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);

  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const fetchInitialData = useCallback(async () => {
    if (!user?.userId) return;
    try {
      setIsChatsLoading(true);
      setIsRequestsLoading(true);
      setIsSessionsLoading(true);

      const [chatsRes, exchangesData, chatReqsRes, sessionsRes] = await Promise.all([
        chatService.getUserChats(),
        exchangeService.getMyExchanges(),
        chatRequestService.getUserRequests(),
        sessionService.getSessions()
      ]);

      const chatsData = chatsRes.items || [];
      const chatReqs = chatReqsRes.items || [];
      const allRawRequests = [...exchangesData, ...chatReqs];

      const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
      };

      // Map Chats
      const mappedChats = chatsData.map(c => {
        const otherId = c.participants?.find(p => p !== user?.userId);
        const pProfile = c.participantProfile || {};
        const displayName = pProfile.name || 'Unknown User';
        
        const isMe = c.lastMessageSenderId === user?.userId;
        let previewText = c.lastMessagePreview || 'No messages yet';
        if (isMe && c.lastMessagePreview) {
          previewText = 'You: ' + c.lastMessagePreview;
        }

        return {
          id: c._id || c.id,
          rawChat: c,
          otherId: otherId,
          name: displayName,
          init: getInitials(displayName),
          bg: pProfile.avatarColor?.bg || '#eef2ff',
          col: pProfile.avatarColor?.text || '#1d4ed8',
          avatar: pProfile.profilePicture || pProfile.avatarImg,
          preview: previewText,
          unread: c.unreadCount || 0,
          time: c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        };
      });
      setChats(mappedChats);

      // Map Requests
      const otherUserIds = [...new Set(allRawRequests.map(req => {
        const myId = user.userId;
        if (req.initiatorId) {
          return req.initiatorId === myId ? req.receiverId : req.initiatorId;
        } else {
          return req.senderId === myId ? req.receiverId : req.senderId;
        }
      }).filter(Boolean))];

      const userProfilesMap = {};
      await Promise.all(otherUserIds.map(async (id) => {
        try {
          const res = await userService.getPublicProfile(id);
          userProfilesMap[id] = res;
        } catch (e) {}
      }));

      const listingIds = [...new Set(allRawRequests.map(req => req.listingId).filter(Boolean))];
      const listingsMap = {};
      await Promise.all(listingIds.map(async (id) => {
        try {
          const res = await listingService.getListingById(id);
          listingsMap[id] = res;
        } catch (e) {}
      }));

      const mappedRequests = allRawRequests.map(req => {
        const myId = user.userId;
        let isIncoming = false;
        let otherUserId = null;
        let isExchange = false;

        if (req.initiatorId) {
          isExchange = true;
          isIncoming = req.receiverId === myId;
          otherUserId = isIncoming ? req.initiatorId : req.receiverId;
        } else {
          isIncoming = req.receiverId === myId;
          otherUserId = isIncoming ? req.senderId : req.receiverId;
        }

        const otherUserRes = userProfilesMap[otherUserId];
        const otherUser = otherUserRes?.profile || { name: 'Unknown User' };
        
        let title = '';
        let sub = '';
        let tagText = '';
        let tagType = 'primary';
        
        if (isExchange) {
          if (req.type === 'SWAP') {
            title = isIncoming ? `${otherUser.name} proposed a skill swap` : `You proposed a skill swap to ${otherUser.name}`;
            tagText = 'Skill swap request';
            tagType = 'success';
          } else {
            title = isIncoming ? `${otherUser.name} requested a session` : `You requested a session with ${otherUser.name}`;
            tagText = 'Session request';
          }
          sub = req.message || 'No additional message provided.';
        } else {
          title = isIncoming ? `${otherUser.name} wants to chat` : `You requested to chat with ${otherUser.name}`;
          tagText = 'Chat request';
          sub = req.message || 'No additional message provided.';
        }

        const statusLower = (req.status || '').toLowerCase();
        if (statusLower === 'rejected' || statusLower === 'declined') {
          title = isIncoming ? 'You declined the request' : 'They declined the request';
          sub = 'This request was not accepted.';
        } else if (statusLower === 'cancelled') {
          title = isIncoming ? 'They cancelled the request' : 'You cancelled the request';
          sub = 'This request was cancelled.';
        } else if (statusLower === 'completed') {
          title = 'Request completed';
          sub = 'This request has been fulfilled.';
        } else if (statusLower === 'accepted') {
          title = 'Request accepted';
          sub = 'This request was accepted and a session was created.';
        }

          const listing = req.listingId ? listingsMap[req.listingId] : null;
          
          let offeredSkillName = null;
          let requestedSkillName = null;
          
          if (listing) {
            const offered = listing.offeredSkills?.[0];
            offeredSkillName = offered?.name || offered;
            
            const requested = listing.requestedSkills?.[0];
            requestedSkillName = requested?.name || requested;
          }
          
          const userExtras = {
            email: otherUserRes?.email,
            createdAt: otherUserRes?.createdAt,
            isProfileVerified: otherUserRes?.emailVerified,
            listingTitle: listing?.title,
            listingType: listing?.listingType,
            requestedSkill: requestedSkillName,
            listingRequestedSkill: requestedSkillName,
            offeredSkillName: offeredSkillName,
            listingAvailableSlots: listing?.availableSlots || [],
          };

          return {
            id: req.exchangeId || req._id,
            rawReq: req,
            direction: isIncoming ? 'incoming' : 'outgoing',
            status: req.status.toLowerCase(),
            title,
            sub,
            message: sub,
            type: tagText,
            typeCls: tagType === 'success' ? 'c-code' : 'c-prim',
            name: otherUser.name,
            init: getInitials(otherUser.name),
            bg: otherUser.avatarColor?.bg || '#eef2ff',
            col: otherUser.avatarColor?.text || '#1d4ed8',
            avatar: otherUser.profilePicture || otherUser.avatarImg,
            otherUser,
            otherUserExtras: userExtras,
            otherUserStats: otherUserRes?.stats || {}
          };
      });

      setRequestsData(mappedRequests);
      const pendingChatReqs = mappedRequests.filter(r => r.direction === 'incoming' && r.status === 'pending' && r.type === 'Chat request');
      setChatRequests(pendingChatReqs);

      // Map Sessions
      const rawSessions = sessionsRes?.items || [];
      const sessionOtherUserIds = [...new Set(rawSessions.map(s => {
        return s.teacherId === user.userId ? s.studentId : s.teacherId;
      }).filter(Boolean))];

      await Promise.all(sessionOtherUserIds.map(async (id) => {
        if (!userProfilesMap[id]) {
          try {
            const res = await userService.getPublicProfile(id);
            userProfilesMap[id] = res;
          } catch (e) {}
        }
      }));

      const mappedSessions = rawSessions.map(s => {
        const otherId = s.teacherId === user.userId ? s.studentId : s.teacherId;
        const otherProfile = userProfilesMap[otherId]?.profile || { name: 'Unknown User' };
        
        let dateStr = 'TBD';
        let timeStr = 'TBD';
        let monthStr = '';
        let dayStr = '';
        
        if (s.scheduledStart) {
          const d = new Date(s.scheduledStart);
          dateStr = d.toLocaleDateString();
          timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const parts = d.toDateString().split(' ');
          monthStr = parts[1].toUpperCase();
          dayStr = parts[2];
        }

        return {
          id: s._id || s.id,
          rawSession: s,
          topic: s.topic || 'Skill Session',
          otherUser: otherProfile,
          name: otherProfile.name,
          init: getInitials(otherProfile.name),
          bg: otherProfile.avatarColor?.bg || '#eef2ff',
          col: otherProfile.avatarColor?.text || '#1d4ed8',
          avatar: otherProfile.profilePicture || otherProfile.avatarImg,
          role: s.teacherId === user.userId ? 'Teaching' : 'Learning',
          status: s.status,
          date: dateStr,
          time: timeStr,
          day: dayStr,
          month: monthStr,
          mode: s.mode === 'IN_PERSON' ? 'In-person' : 'Online'
        };
      });

      setSessionsData(mappedSessions);

    } catch (err) {
      console.error('Failed to load global data', err);
    } finally {
      setIsChatsLoading(false);
      setIsRequestsLoading(false);
      setIsSessionsLoading(false);
    }
  }, [user]);

  const fetchSessionsOnly = useCallback(async () => {
    if (!user?.userId) return;
    try {
      setIsSessionsLoading(true);
      const sessionsRes = await sessionService.getSessions();
      const rawSessions = sessionsRes?.items || [];
      const sessionOtherUserIds = [...new Set(rawSessions.map(s => {
        return s.teacherId === user.userId ? s.studentId : s.teacherId;
      }).filter(Boolean))];

      const userProfilesMap = {};
      await Promise.all(sessionOtherUserIds.map(async (id) => {
        try {
          const res = await userService.getPublicProfile(id);
          userProfilesMap[id] = res;
        } catch (e) {}
      }));

      const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
      };

      const mappedSessions = rawSessions.map(s => {
        const otherId = s.teacherId === user.userId ? s.studentId : s.teacherId;
        const otherProfile = userProfilesMap[otherId]?.profile || { name: 'Unknown User' };
        
        let dateStr = 'TBD';
        let timeStr = 'TBD';
        let monthStr = '';
        let dayStr = '';
        
        if (s.scheduledStart) {
          const d = new Date(s.scheduledStart);
          dateStr = d.toLocaleDateString();
          timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const parts = d.toDateString().split(' ');
          monthStr = parts[1].toUpperCase();
          dayStr = parts[2];
        }

        return {
          id: s._id || s.id,
          rawSession: s,
          topic: s.topic || 'Skill Session',
          otherUser: otherProfile,
          name: otherProfile.name,
          init: getInitials(otherProfile.name),
          bg: otherProfile.avatarColor?.bg || '#eef2ff',
          col: otherProfile.avatarColor?.text || '#1d4ed8',
          avatar: otherProfile.profilePicture || otherProfile.avatarImg,
          role: s.teacherId === user.userId ? 'Teaching' : 'Learning',
          status: s.status,
          date: dateStr,
          time: timeStr,
          day: dayStr,
          month: monthStr,
          mode: s.mode === 'IN_PERSON' ? 'In-person' : 'Online'
        };
      });

      setSessionsData(mappedSessions);
    } catch (err) {
      console.error('Failed to load sessions data', err);
    } finally {
      setIsSessionsLoading(false);
    }
  }, [user]);


  useEffect(() => {
    if (user?.userId) {
      fetchInitialData();
    }
  }, [user, fetchInitialData]);

  const { lastMessage } = useWebSocket();

  const processedMessageRef = useRef(null);

  useEffect(() => {
    if (!lastMessage || processedMessageRef.current === lastMessage) return;
    processedMessageRef.current = lastMessage;

    if (lastMessage.type === 'NOTIFICATION') {
      const notifType = lastMessage.payload.type;
      const newNotif = {
        id: lastMessage.payload.id || Date.now(),
        type: notifType.toLowerCase(),
        title: lastMessage.payload.title,
        message: lastMessage.payload.message,
        time: 'Just now',
        unread: true
      };
      setNotifications(prev => [newNotif, ...prev]);

      if (
        notifType === 'SESSION_ACCEPTED' ||
        notifType === 'SESSION_BOOKED' ||
        notifType === 'SESSION_COMPLETED' ||
        notifType === 'COMPLETION_REQUESTED' ||
        notifType === 'RESCHEDULE_PROPOSED' ||
        notifType === 'RESCHEDULE_ACCEPTED' ||
        notifType === 'RESCHEDULE_REJECTED' ||
        notifType === 'MARKED_PAID'
      ) {
        fetchInitialData();
      }
    } else if (
      lastMessage.type === 'NEW_REQUEST' ||
      lastMessage.type === 'REQUEST_ACCEPTED' ||
      lastMessage.type === 'REQUEST_REJECTED' ||
      lastMessage.type === 'REQUEST_CANCELLED' ||
      lastMessage.type === 'REQUEST_UPDATED'
    ) {
      const msg = lastMessage.payload;
      const myId = user?.userId;
      
      if (lastMessage.type === 'NEW_REQUEST') {
        const isExchange = !!msg.initiatorId;
        const isIncoming = isExchange ? msg.receiverId === myId : msg.receiverId === myId;
        const otherUser = msg.otherUser || { name: 'Unknown User' };
        
        let title = '';
        let sub = '';
        let tagText = '';
        let tagType = 'primary';
        
        if (isExchange) {
          if (msg.type === 'SWAP') {
            title = isIncoming ? `${otherUser.name} proposed a skill swap` : `You proposed a skill swap to ${otherUser.name}`;
            tagText = 'Skill swap request';
            tagType = 'success';
          } else {
            title = isIncoming ? `${otherUser.name} requested a session` : `You requested a session with ${otherUser.name}`;
            tagText = 'Session request';
          }
          sub = msg.message || 'No additional message provided.';
        } else {
          title = isIncoming ? `${otherUser.name} wants to chat` : `You requested to chat with ${otherUser.name}`;
          tagText = 'Chat request';
          sub = msg.message || 'No additional message provided.';
        }

        const getInitials = (name) => {
          if (!name) return 'U';
          const parts = name.split(' ');
          if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
          return name.substring(0, 2).toUpperCase();
        };

        const mapped = {
          id: msg.exchangeId || msg.id || msg._id,
          rawReq: msg,
          direction: isIncoming ? 'incoming' : 'outgoing',
          status: msg.status ? msg.status.toLowerCase() : 'pending',
          title,
          sub,
          message: sub,
          type: tagText,
          typeCls: tagType === 'success' ? 'c-code' : 'c-prim',
          name: otherUser.name,
          init: getInitials(otherUser.name),
          bg: otherUser.avatarColor?.bg || '#eef2ff',
          col: otherUser.avatarColor?.text || '#1d4ed8',
          avatar: otherUser.profilePicture || otherUser.avatarImg || otherUser.avatar,
          otherUser,
          otherUserExtras: {}
        };

        setRequestsData(prev => [mapped, ...prev]);
        if (!isExchange && isIncoming) {
          setChatRequests(prev => [mapped, ...prev]);
        }
        
        // Fetch full context (listing, extras, stats) in the background to complete the card
        fetchInitialData();
      } else {
        const idToUpdate = msg.exchangeId || msg.id || msg._id;
        const newStatus = msg.status ? msg.status.toLowerCase() : 'pending';
        
        setRequestsData(prev => prev.map(r => r.id === idToUpdate ? { ...r, status: newStatus } : r));
        if (newStatus !== 'pending') {
          setChatRequests(prev => prev.filter(r => r.id !== idToUpdate));
        }
        if (newStatus === 'accepted') {
          fetchInitialData();
        }
      }
    } else if (lastMessage.type === 'NEW_MESSAGE') {
      const msg = lastMessage.payload;
      
      setChatMessages(prev => {
        if (!prev[msg.chatId]) return prev;
        if (prev[msg.chatId].find(m => m.id === msg.id || m._id === msg.id)) return prev;
        return { ...prev, [msg.chatId]: [...prev[msg.chatId], msg] };
      });

      setChats(prevChats => {
        const existingIndex = prevChats.findIndex(c => c.id === msg.chatId);
        if (existingIndex > -1) {
          const chat = prevChats[existingIndex];
          const updatedChat = {
            ...chat,
            preview: msg.message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: msg.senderId !== user?.userId ? (chat.unread || 0) + 1 : chat.unread
          };
          const newChats = [...prevChats];
          newChats.splice(existingIndex, 1);
          return [updatedChat, ...newChats];
        } else {
          return prevChats;
        }
      });
      
      // Async fetch if chat is missing, to avoid side-effects in state updater
      setChats(prevChats => {
        if (prevChats.findIndex(c => c.id === msg.chatId) === -1) {
          setTimeout(() => fetchInitialData(), 0);
        }
        return prevChats;
      });

    } else if (lastMessage.type === 'MESSAGE_EDITED') {
      const msg = lastMessage.payload;
      setChatMessages(prev => {
        if (!prev[msg.chatId]) return prev;
        return {
          ...prev,
          [msg.chatId]: prev[msg.chatId].map(m => 
            (m.id === msg.messageId || m._id === msg.messageId) ? { ...m, message: msg.message, editedAt: msg.editedAt } : m
          )
        };
      });
      // Optionally update preview if it was the last message
      setChats(prevChats => prevChats.map(c => 
        (c.id === msg.chatId && c.preview) ? { ...c, preview: msg.message } : c
      ));
    } else if (lastMessage && lastMessage.type === 'MESSAGE_DELETED') {
      const msg = lastMessage.payload;
      setChatMessages(prev => {
        if (!prev[msg.chatId]) return prev;
        return {
          ...prev,
          [msg.chatId]: prev[msg.chatId].map(m => 
            (m.id === msg.messageId || m._id === msg.messageId) ? { ...m, isDeleted: true, message: msg.message, deletedAt: msg.deletedAt } : m
          )
        };
      });
      setChats(prevChats => prevChats.map(c => 
        (c.id === msg.chatId) ? { ...c, preview: c.preview } : c
      )); // Could update preview but keeping it simple for now
    }
  }, [lastMessage, user?.userId, fetchInitialData]);

  const unreadMessagesCount = chats.reduce((acc, c) => acc + (c.unread || 0), 0);
  const pendingRequestsCount = requestsData.filter(r => r.status.toLowerCase() === 'pending').length;

  return (
    <AppDataContext.Provider
      value={{
        chats,
        setChats,
        chatMessages,
        setChatMessages,
        isChatsLoading,
        chatRequests,
        requestsData,
        isRequestsLoading,
        sessionsData,
        isSessionsLoading,
        fetchInitialData,
        fetchSessionsOnly,
        toastMessage,

        triggerToast,
        notifications,
        markAllAsRead,
        unreadMessagesCount,
        pendingRequestsCount,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);
