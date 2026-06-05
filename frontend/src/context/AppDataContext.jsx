import React, { createContext, useState, useContext } from 'react';
import { useAuth } from './AuthContext';

const AppDataContext = createContext();

export const AppDataProvider = ({ children }) => {
  const { user, updateProfile } = useAuth();
  const [toastMessage, setToastMessage] = useState(null);
  
  // 0. Notifications (future-ready empty state)
  const [notifications, setNotifications] = useState([]);
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // 1. Marketplace skills list
  const [skills, setSkills] = useState([
    {
      id: 0,
      name: 'React.js basics',
      cat: 'Coding',
      catCls: 'c-code',
      price: '₹300/hr',
      priceNum: 300,
      type: 'paid',
      rating: '4.9',
      sessions: 12,
      mode: 'Online',
      avail: 'Mon–Fri evenings, Weekends',
      desc: 'Learn React from scratch — components, hooks, state management, and building real projects. Great for students who know basic JS and want to level up.',
      topics: ['JSX & Components', 'useState & useEffect', 'React Router', 'API calls with fetch', 'Mini project: Todo App'],
      teacher: {
        name: 'Priya S.',
        init: 'PS',
        bg: '#E6F1FB',
        col: '#0C447C',
        year: '3rd year',
        branch: 'CSE',
        college: 'PESU Bengaluru',
        bio: 'Passionate about frontend dev. Interned at a Bangalore startup. Love helping others learn React!',
        skills: 'Teaches: React, JavaScript',
        rating: '4.9',
        sessions: 12,
        upi: 'priyas@upi'
      }
    },
    {
      id: 1,
      name: 'Figma UI design',
      cat: 'Design',
      catCls: 'c-des',
      price: '₹250/hr',
      priceNum: 250,
      type: 'paid',
      rating: '4.7',
      sessions: 8,
      mode: 'In-person',
      avail: 'Weekends',
      desc: 'Master Figma from basics to prototyping. Learn design systems, auto-layout, and real UI case studies used in industry.',
      topics: ['Figma workspace & tools', 'Frames, components & variants', 'Auto-layout basics', 'Design systems & styles', 'Portfolio project walkthrough'],
      teacher: {
        name: 'Rohan M.',
        init: 'RM',
        bg: '#FBEAF0',
        col: '#72243E',
        year: '2nd year',
        branch: 'ECE',
        college: 'PESU Bengaluru',
        bio: 'Self-taught designer. Freelances on Fiverr. Been using Figma for 2 years.',
        skills: 'Teaches: Figma, Canva',
        rating: '4.7',
        sessions: 8,
        upi: 'rohanm@upi'
      }
    },
    {
      id: 2,
      name: 'Japanese N5',
      cat: 'Language',
      catCls: 'c-lan',
      price: 'Swap only',
      priceNum: 0,
      type: 'swap',
      rating: '5.0',
      sessions: 5,
      mode: 'Online',
      avail: 'Anytime flexible',
      desc: 'JLPT N5 Japanese from zero. Covers hiragana, katakana, basic kanji (80), grammar patterns, and conversational phrases.',
      topics: ['Hiragana & Katakana', 'Basic vocabulary (800 words)', 'Core grammar patterns', 'Numbers, dates, time', 'Self-introduction & conversations'],
      teacher: {
        name: 'Aisha T.',
        init: 'AT',
        bg: '#EAF3DE',
        col: '#27500A',
        year: '4th year',
        branch: 'MBA',
        college: 'PESU Bengaluru',
        bio: 'Lived in Japan for a semester. JLPT N3 certified. Love sharing the language with others!',
        skills: 'Teaches: Japanese, French basics',
        rating: '5.0',
        sessions: 5,
        upi: 'aishat@upi'
      }
    },
    {
      id: 3,
      name: 'Linear algebra',
      cat: 'Math',
      catCls: 'c-mat',
      price: '₹200/hr',
      priceNum: 200,
      type: 'paid',
      rating: '4.8',
      sessions: 15,
      mode: 'Either',
      avail: 'Weekday afternoons',
      desc: 'Covers all linear algebra topics for engineering and ML. Matrix operations, eigenvalues, vector spaces explained with intuition.',
      topics: ['Vectors & matrices', 'Matrix operations', 'Determinants', 'Eigenvalues & eigenvectors', 'Applications in ML'],
      teacher: {
        name: 'Vikram N.',
        init: 'VN',
        bg: '#FAEEDA',
        col: '#633806',
        year: '3rd year',
        branch: 'ECE',
        college: 'PESU Bengaluru',
        bio: 'Math olympiad participant. TA for engineering maths. Makes abstract concepts very intuitive.',
        skills: 'Teaches: Linear Algebra, Calculus',
        rating: '4.8',
        sessions: 15,
        upi: 'vikramn@upi'
      }
    },
    {
      id: 4,
      name: 'Guitar basics',
      cat: 'Music',
      catCls: 'c-mus',
      price: '₹150/hr',
      priceNum: 150,
      type: 'paid',
      rating: '4.6',
      sessions: 6,
      mode: 'In-person',
      avail: 'Weekend mornings',
      desc: 'Learn guitar from absolute zero. Covers proper posture, basic chords, strumming patterns, and your first 3 songs.',
      topics: ['Posture & hand position', 'Basic open chords (C, G, D, Em, Am)', 'Strumming patterns', 'Chord transitions', 'Songs: Wonderful Tonight, Let Her Go'],
      teacher: {
        name: 'Sneha K.',
        init: 'SK',
        bg: '#EEEDFE',
        col: '#3C3489',
        year: '1st year',
        branch: 'ECE',
        college: 'PESU Bengaluru',
        bio: 'Playing guitar since age 10. Performs at college fests. Patient teacher for beginners.',
        skills: 'Teaches: Guitar, Keyboard',
        rating: '4.6',
        sessions: 6,
        upi: 'snehak@upi'
      }
    },
    {
      id: 5,
      name: 'Python & data analysis',
      cat: 'Coding',
      catCls: 'c-code',
      price: 'Swap only',
      priceNum: 0,
      type: 'swap',
      rating: '4.9',
      sessions: 20,
      mode: 'Online',
      avail: 'Mon–Fri evenings',
      desc: 'Python for data analysis using pandas, numpy and matplotlib. Covers real datasets and a capstone project at the end.',
      topics: ['Python basics & syntax', 'NumPy arrays', 'Pandas DataFrames', 'Data cleaning & EDA', 'Matplotlib visualizations'],
      teacher: {
        name: 'Dev R.',
        init: 'DR',
        bg: '#E6F1FB',
        col: '#0C447C',
        year: '4th year',
        branch: 'CSE',
        college: 'PESU Bengaluru',
        bio: 'Data science enthusiast. Kaggle contributor. Has cracked 2 data internships. Great at simplifying concepts.',
        skills: 'Teaches: Python, Data Analysis, ML basics',
        rating: '4.9',
        sessions: 20,
        upi: 'devr@upi'
      }
    }
  ]);

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
      name: 'Aisha T.',
      init: 'AT',
      bg: '#EEEDFE',
      col: '#3C3489',
      title: 'Aisha T. · Japanese N5',
      sub: 'Swap: you teach DSA · awaiting reply',
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
      status: 'soon'
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

  // 7. Admin Sessions List
  const [adminSessions, setAdminSessions] = useState([
    {
      id: 1,
      title: 'React.js basics',
      participants: 'Priya S. → Arjun K.',
      dateTime: '22 May · 4PM',
      amount: '₹300',
      status: 'Upcoming',
      statusCls: 'c-code'
    },
    {
      id: 2,
      title: 'C++ · Swap',
      participants: 'Arjun K. → Sai M.',
      dateTime: '25 May · 5:30PM',
      amount: 'Swap',
      status: 'Upcoming',
      statusCls: 'c-mus'
    },
    {
      id: 3,
      title: 'DSA',
      participants: 'Arjun K. → Rohan M.',
      dateTime: '14 May · 3PM',
      amount: '₹300',
      status: 'Completed',
      statusCls: 'c-code'
    },
    {
      id: 4,
      title: 'Japanese N5',
      participants: 'Aisha T. → Priya S.',
      dateTime: '18 May · 5PM',
      amount: '₹250',
      status: 'Completed',
      statusCls: 'c-code'
    },
    {
      id: 5,
      title: 'Guitar basics',
      participants: 'Sneha K. → Vikram N.',
      dateTime: '10 May · 6PM',
      amount: '₹150',
      status: 'Reported',
      statusCls: 'c-mus'
    }
  ]);

  // 8. Admin Users list
  const [adminUsers, setAdminUsers] = useState([
    { name: 'Priya S.', init: 'PS', bg: '#E6F1FB', col: '#0C447C', meta: '3rd yr · CSE', sessions: 12, rating: '4.9', active: true },
    { name: 'Rohan M.', init: 'RM', bg: '#FBEAF0', col: '#72243E', meta: '2nd yr · ECE', sessions: 8, rating: '4.7', active: true },
    { name: 'Aisha T.', init: 'AT', bg: '#EAF3DE', col: '#27500A', meta: '4th yr · MBA', sessions: 5, rating: '5.0', active: true },
    { name: 'Vikram N.', init: 'VN', bg: '#FAEEDA', col: '#633806', meta: '3rd yr · ECE', sessions: 15, rating: '4.8', active: true },
    { name: 'Sneha K.', init: 'SK', bg: '#EEEDFE', col: '#3C3489', meta: '1st yr · ECE', sessions: 6, rating: '4.6', active: true },
    { name: 'Dev R.', init: 'DR', bg: '#E6F1FB', col: '#0C447C', meta: '4th yr · CSE', sessions: 20, rating: '4.9', active: true }
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

  const acceptRequest = (reqId) => {
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
        triggerToast(`Swap accepted! Exchange confirmed with ${matchedReq.name}`);
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

  const adminRemoveSkill = (skillId) => {
    setSkills((prev) => prev.filter((s) => s.id !== skillId));
    setAdminSessions((prev) => prev.filter((s) => s.id !== skillId));
    triggerToast('Skill removed from platform.');
  };

  const adminSuspendStudent = (studentName) => {
    setAdminUsers((prev) =>
      prev.map((u) => {
        if (u.name === studentName) return { ...u, active: false };
        return u;
      })
    );
    triggerToast(`Student account suspended.`);
  };

  const adminWarnUser = (studentName) => {
    triggerToast(`Warning sent to ${studentName}`);
  };

  const adminIssueRefund = (reportId, amount, reporter) => {
    setAdminReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) return { ...r, status: 'refunded' };
        return r;
      })
    );

    // If report reporter is Arjun K., refund to user wallet
    if (reporter === 'Arjun K.') {
      updateProfile({ walletBalance: user.walletBalance + amount });
      const newTx = {
        id: Date.now(),
        title: 'Refund received · Admin resolution',
        desc: 'Wallet credited',
        amount: `+₹${amount}`,
        type: 'received',
        date: 'Today'
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
    triggerToast(`Refund of ₹${amount} issued.`);
  };

  const adminDismissReport = (reportId) => {
    setAdminReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) return { ...r, status: 'dismissed' };
        return r;
      })
    );
    triggerToast('Report dismissed.');
  };

  return (
    <AppDataContext.Provider
      value={{
        skills,
        conversations,
        transactions,
        requests,
        bookedSessions,
        adminReports,
        adminSessions,
        adminUsers,
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
        adminRemoveSkill,
        adminSuspendStudent,
        adminWarnUser,
        adminIssueRefund,
        adminDismissReport,
        createSession,
        notifications,
        markAllAsRead
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);
