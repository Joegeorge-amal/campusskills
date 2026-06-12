import React, { createContext, useState, useContext, useEffect } from 'react';
import { useWebSocket } from './WebSocketContext';
import { useAuth } from './AuthContext';

const AppDataContext = createContext();

export const AppDataProvider = ({ children }) => {
  const { user, updateProfile } = useAuth();
  const [toastMessage, setToastMessage] = useState(null);
  
  // 0. Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'booked',
      title: 'Session Reminder',
      message: 'You have a session with Priya S. in 30 minutes.',
      timestamp: '30m ago',
      unread: true,
      actionUrl: '/app/sessions',
      actionLabel: 'View Session'
    },
    {
      id: 2,
      type: 'swap_accepted',
      title: 'Swap Request Accepted',
      message: 'Aisha T. accepted your Japanese N5 swap request.',
      timestamp: '1h ago',
      unread: true,
      actionUrl: '/app/sessions',
      actionLabel: 'View Details'
    },
    {
      id: 3,
      type: 'payment',
      title: 'Payment Received',
      message: 'Dev R. paid ₹300 for the C++ session.',
      timestamp: '2h ago',
      unread: true
    }
  ]);
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'NOTIFICATION') {
      const newNotif = {
        id: lastMessage.payload.id || Date.now(),
        type: lastMessage.payload.type.toLowerCase(),
        title: lastMessage.payload.title,
        message: lastMessage.payload.message,
        time: 'Just now',
        unread: true
      };
      setNotifications(prev => [newNotif, ...prev]);
    } else if (lastMessage && lastMessage.type === 'NEW_MESSAGE') {
      const msg = lastMessage.payload;
      setConversations(prev => prev.map(chat => {
        if (chat.id === msg.chatId || (chat.participants && chat.participants.includes(msg.senderId))) {
          return {
            ...chat,
            lastMsg: msg.message,
            time: 'Just now',
            unreadCount: (chat.unreadCount || 0) + 1,
            msgs: [...(chat.msgs || []), {
              id: msg.id || Date.now(),
              text: msg.message,
              sender: 'them',
              time: 'Just now'
            }]
          };
        }
        return chat;
      }));
    }
  }, [lastMessage]);

  // 1. Marketplace skills list (removed, now fetching from backend, keeping empty array for mock references)
  const [skills, setSkills] = useState([]);
  // 2. Student Conversations
  const [conversations, setConversations] = useState([
    {
      id: 0,
      name: 'Priya S.',
      init: 'PS',
      bg: '#E6F1FB',
      col: '#0C447C',
      skill: 'React.js',
      online: true,
      unread: 1,
      time: 'now',
      preview: 'Sure! 4 PM works for me.',
      msgs: [
        { f: 'them', t: 'Hey! I can teach you React.js.' },
        { f: 'me', t: 'Awesome! Is tomorrow 4 PM okay?' },
        { f: 'them', t: 'Sure! 4 PM works for me.' },
        { f: 'them', type: 'pay', title: 'Session booking', sub: 'Tomorrow · 4 PM · 1 hr · ₹300', price: 300 }
      ]
    },
    {
      id: 1,
      name: 'Rohan M.',
      init: 'RM',
      bg: '#FBEAF0',
      col: '#72243E',
      skill: 'Figma',
      online: false,
      unread: 0,
      time: '2h',
      preview: 'Can we do a skill swap?',
      msgs: [
        { f: 'them', t: 'Thanks for the DSA session!' },
        { f: 'me', t: 'Happy to help! Want another one?' },
        { f: 'them', t: 'Actually, can we do a skill swap?' },
        { f: 'them', type: 'swap', title: 'Skill swap request', sub: 'I teach Figma · You teach DSA', offer: 'DSA' }
      ]
    },
    {
      id: 2,
      name: 'Aisha T.',
      init: 'AT',
      bg: '#EAF3DE',
      col: '#27500A',
      skill: 'Japanese',
      online: true,
      unread: 2,
      time: '1d',
      preview: 'Yoroshiku onegaishimasu!',
      msgs: [
        { f: 'me', t: 'Hi Aisha! Interested in Japanese N5.' },
        { f: 'them', t: 'Hello! I teach from scratch.' },
        { f: 'them', t: 'Yoroshiku onegaishimasu!' }
      ]
    },
    {
      id: 3,
      name: 'Vikram N.',
      init: 'VN',
      bg: '#FAEEDA',
      col: '#633806',
      skill: 'Algebra',
      online: false,
      unread: 0,
      time: '3d',
      preview: 'Session confirmed for 25th.',
      msgs: [
        { f: 'them', t: 'Confirmed — C++ from you, algebra from me.' },
        { f: 'me', t: '25th May evening works!' },
        { f: 'them', t: 'Session confirmed for 25th.' }
      ]
    }
  ]);

  // 3. Transactions List
  const [transactions, setTransactions] = useState([
    {
      id: 101,
      title: 'Received · DSA · Rohan M.',
      desc: 'Wallet credited',
      amount: '+₹300',
      type: 'received',
      date: '20 May'
    },
    {
      id: 102,
      title: 'Skill swap · C++ ↔ Figma',
      desc: 'With Priya S.',
      amount: 'Swap',
      type: 'swap',
      date: '19 May'
    },
    {
      id: 103,
      title: 'Paid · Japanese N5 · Aisha T.',
      desc: 'Wallet debited',
      amount: '−₹250',
      type: 'paid',
      date: '18 May'
    },
    {
      id: 104,
      title: 'Withdrawn → HDFC ••42',
      desc: 'Credited to bank',
      amount: '−₹500',
      type: 'withdrawn',
      date: '12 May'
    },
    {
      id: 105,
      title: 'Received · C++ · Dev R.',
      desc: 'Wallet credited',
      amount: '+₹300',
      type: 'received',
      date: '10 May'
    }
  ]);

  // 4. Requests (Pending / Sent)
  const [requests, setRequests] = useState([
    {
      id: 1,
      direction: 'incoming',
      name: 'Priya R.',
      init: 'PR',
      bg: '#E1F5EE',
      col: '#0F6E56',
      title: 'Priya R. wants a session',
      sub: 'DSA · 1 hr · ₹300',
      type: 'Payment request',
      typeCls: 'c-code',
      status: 'pending'
    },
    {
      id: 2,
      direction: 'incoming',
      name: 'Sai M.',
      init: 'SM',
      bg: '#FAEEDA',
      col: '#633806',
      title: 'Sai M. sent a swap request',
      sub: 'He offers Guitar · Wants C++',
      type: 'Skill swap request',
      typeCls: 'c-mus',
      status: 'pending'
    },
    {
      id: 3,
      direction: 'outgoing',
      name: 'Priya S.',
      init: 'PS',
      bg: '#E6F1FB',
      col: '#0C447C',
      title: 'React.js basics',
      sub: 'Priya S. · ₹300/hr · Online\n📅 26 May · 4:00 PM',
      status: 'Pending'
    },
    {
      id: 4,
      direction: 'outgoing',
      name: 'Vikram N.',
      init: 'VN',
      bg: '#EAF3DE',
      col: '#3B6D11',
      title: 'Vikram N. · Linear algebra',
      sub: 'Swap: you teach C++',
      status: 'Confirmed'
    }
  ]);

  // 5. Booked Sessions
  const [bookedSessions, setBookedSessions] = useState([
    {
      id: 10,
      title: 'React.js · Priya S.',
      time: '4:00 PM · Online',
      date: '22',
      month: 'MAY',
      info: 'React.js · Priya S. · ₹300 paid',
      status: 'join'
    },
    {
      id: 11,
      title: 'Teaching C++ · Sai M.',
      time: '5:30 PM · Skill swap',
      date: '25',
      month: 'MAY',
      info: 'Teaching C++ · Sai M. · Skill swap',
      status: 'join'
    },
    {
      id: 12,
      title: 'DSA · Rohan M.',
      time: 'Completed · 55 min · Paid',
      date: '14',
      month: 'MAY',
      status: 'completed',
      reviewed: true
    },
    {
      id: 13,
      title: 'Japanese N5 · Aisha T.',
      time: 'Completed · 60 min · ₹250 paid',
      date: '10',
      month: 'MAY',
      status: 'completed',
      reviewed: false
    }
  ]);

  // 6. Admin Reports List
  const [adminReports, setAdminReports] = useState([
    {
      id: 1,
      title: 'Report: No-show',
      sub: 'By Arjun K. · Against Dev R. · 18 May',
      desc: 'No-show for scheduled Python session on 18 May. Student paid ₹300 and tutor did not attend.',
      severity: 'High',
      severityCls: 'report-ico-high',
      status: 'open',
      reporter: 'Arjun K.',
      target: 'Dev R.',
      amount: 300
    },
    {
      id: 2,
      title: 'Report: Misleading listing',
      sub: 'By Priya S. · Against Sneha K. · 20 May',
      desc: 'Guitar basics listing was misleading — advertised advanced techniques but only covered basics.',
      severity: 'Medium',
      severityCls: 'report-ico-medium',
      status: 'open',
      reporter: 'Priya S.',
      target: 'Sneha K.',
      amount: 300
    },
    {
      id: 3,
      title: 'Report: Poor conduct',
      sub: 'By Rohan M. · Against Vikram N. · 22 May',
      desc: 'Tutor was 30 min late and ended session early without refund.',
      severity: 'Medium',
      severityCls: 'report-ico-medium',
      status: 'open',
      reporter: 'Rohan M.',
      target: 'Vikram N.',
      amount: 300
    }
  ]);


  // ─── TOAST TRIGGER ───
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // ─── MESSAGING LOGIC ───
  const sendChatMessage = (convId, text) => {
    if (!text.trim()) return;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          const newMsgs = [...c.msgs, { f: 'me', t: text }];
          return {
            ...c,
            msgs: newMsgs,
            preview: text,
            time: 'now',
            unread: 0
          };
        }
        return c;
      })
    );

    // Dynamic mock response like in the prototype after 1.2s
    setTimeout(() => {
      const responses = [
        'Got it!',
        'Sure!',
        "Let me check my schedule.",
        'Sounds good!',
        "I'll confirm shortly."
      ];
      const botReply = responses[Math.floor(Math.random() * responses.length)];

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === convId) {
            return {
              ...c,
              msgs: [...c.msgs, { f: 'them', t: botReply }],
              preview: botReply,
              time: 'now'
            };
          }
          return c;
        })
      );
    }, 1200);
  };

  // ─── TRANSACTION & WALLET ACTIONS ───
  const payForSession = (amount, tutorName, skillName) => {
    if (user.walletBalance < amount) {
      triggerToast('Insufficient wallet balance!');
      return false;
    }

    // Deduct cash from user context
    updateProfile({ walletBalance: user.walletBalance - amount });

    // Add transaction row
    const newTx = {
      id: Date.now(),
      title: `Paid · ${skillName} · ${tutorName}`,
      desc: 'Wallet debited',
      amount: `−₹${amount}`,
      type: 'paid',
      date: 'Today'
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Book upcoming session
    const newSession = {
      id: Date.now(),
      title: `${skillName} · ${tutorName}`,
      time: '4:00 PM · Online',
      date: new Date().getDate().toString(),
      month: 'MAY',
      info: `${skillName} · ${tutorName} · ₹${amount} paid`,
      status: 'join'
    };
    setBookedSessions((prev) => [newSession, ...prev]);
    triggerToast(`₹${amount} paid! Session booked with ${tutorName}.`);
    return true;
  };

  const depositMoney = (amount) => {
    updateProfile({ walletBalance: user.walletBalance + amount });
    const newTx = {
      id: Date.now(),
      title: 'Added money',
      desc: 'Wallet credited via Net Banking',
      amount: `+₹${amount}`,
      type: 'received',
      date: 'Today'
    };
    setTransactions((prev) => [newTx, ...prev]);
    triggerToast(`₹${amount} added to your CampusSkills wallet!`);
  };

  const withdrawMoney = (amount, bankName) => {
    if (user.walletBalance < amount) {
      triggerToast('Insufficient funds for withdrawal!');
      return false;
    }
    updateProfile({ walletBalance: user.walletBalance - amount });
    const newTx = {
      id: Date.now(),
      title: `Withdrawn → ${bankName}`,
      desc: 'Credited in 1-2 days',
      amount: `−₹${amount}`,
      type: 'withdrawn',
      date: 'Today'
    };
    setTransactions((prev) => [newTx, ...prev]);
    triggerToast(`₹${amount} withdrawal initiated. Credited in 1–2 business days.`);
    return true;
  };

  // ─── SWAP PROPOSAL ACTIONS ───
  const submitSwapProposal = (tutorName, skillName, offerSkill, schedule, note) => {
    const newReq = {
      id: Date.now(),
      direction: 'outgoing',
      name: tutorName,
      init: tutorName.split(' ').map(n => n[0]).join('').toUpperCase(),
      bg: '#EEEDFE',
      col: '#3C3489',
      title: `${tutorName} · ${skillName}`,
      sub: `Swap: you teach ${offerSkill} · awaiting reply`,
      status: 'Pending'
    };
    setRequests((prev) => [newReq, ...prev]);
    triggerToast(`Swap request sent to ${tutorName}! Offering: ${offerSkill}`);
  };

  const acceptRequest = (reqId, options = {}) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === reqId) return { ...r, status: 'accepted' };
        return r;
      })
    );

    const matchedReq = requests.find((r) => r.id === reqId);
    if (matchedReq) {
      if (matchedReq.type && matchedReq.type.includes('Payment')) {
        // Book bookedSession
        const newSess = {
          id: Date.now(),
          title: matchedReq.sub.split(' · ')[0] + ' · ' + matchedReq.name,
          time: '5:00 PM · Online',
          date: '28',
          month: 'MAY',
          info: matchedReq.sub,
          status: 'join'
        };
        setBookedSessions((prev) => [newSess, ...prev]);
        triggerToast(`Accepted! Session confirmed with ${matchedReq.name}`);
      } else {
        // Swap accept
        const newSess = {
          id: Date.now(),
          title: 'Swap · ' + matchedReq.name,
          time: '6:00 PM · Skill Swap',
          date: '29',
          month: 'MAY',
          info: matchedReq.sub,
          status: 'soon'
        };
        setBookedSessions((prev) => [newSess, ...prev]);
        if (!options.hideToast) {
          triggerToast(`Swap accepted! Exchange confirmed with ${matchedReq.name}`);
        }
      }
    }
  };

  const declineRequest = (reqId) => {
    setRequests((prev) => prev.filter((r) => r.id !== reqId));
    triggerToast('Request declined.');
  };

  // ─── ADD ACTIVE SKILL IN PROFILE ───
  const addSkillOffering = (skillName, category, priceText) => {
    const isPaid = priceText.includes('₹');
    const priceNum = isPaid ? parseInt(priceText.replace(/[^0-9]/g, '')) : 0;

    const newSkill = {
      id: skills.length,
      name: skillName,
      cat: category,
      catCls: category === 'Coding' ? 'c-code' : category === 'Design' ? 'c-des' : 'c-mus',
      price: priceText,
      priceNum: priceNum,
      type: isPaid ? 'paid' : 'swap',
      rating: '5.0',
      sessions: 0,
      mode: 'Online',
      avail: 'Weekday evenings',
      desc: `Learn ${skillName} with step by step guides. Custom tailored topics for college students.`,
      topics: ['Introduction', 'Core components', 'Practical case study'],
      teacher: {
        name: user.name,
        init: user.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        bg: '#EEEDFE',
        col: '#3C3489',
        year: user.year,
        branch: user.branch,
        college: user.college,
        bio: user.bio,
        skills: `Teaches: ${skillName}`,
        rating: '5.0',
        sessions: 0,
        upi: user.upi
      }
    };
    setSkills((prev) => [...prev, newSkill]);
    triggerToast(`Added skill: ${skillName}!`);
  };

  // ─── ADMIN PANELS MODERATION ───
  const createSession = (sessionData) => {
    const d = sessionData.date ? new Date(sessionData.date) : new Date();
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const newSession = {
      id: Date.now(),
      title: `${sessionData.title} · ${sessionData.student.split(' ')[0]}`,
      time: `${sessionData.time || '10:00 AM'} · ${sessionData.mode}`,
      date: d.getDate().toString(),
      month: months[d.getMonth()],
      info: `${sessionData.skill} · ${sessionData.type}`,
      status: 'soon'
    };
    setBookedSessions(prev => [newSession, ...prev]);
  };


  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unread || 0), 0);
  const pendingRequestsCount = requests.filter(r => r.status.toLowerCase() === 'pending').length;

  return (
    <AppDataContext.Provider
      value={{
        skills,
        conversations,
        transactions,
        requests,
        bookedSessions,
        adminReports,
        toastMessage,
        triggerToast,
        sendChatMessage,
        payForSession,
        depositMoney,
        withdrawMoney,
        submitSwapProposal,
        acceptRequest,
        declineRequest,
        addSkillOffering,
        createSession,
        notifications,
        markAllAsRead,
        unreadMessagesCount,
        pendingRequestsCount
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);
