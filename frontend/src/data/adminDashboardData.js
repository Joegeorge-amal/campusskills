export const platformOverview = {
  totalStudents: { value: 1284, trend: '+38 this week', isPositive: true },
  activeSessions: { value: 47, trend: '+12 today', isPositive: true },
  revenue: { value: '2,36,450', trend: '+₹18,200 this week', isPositive: true },
  openDisputes: { value: 3, trend: '-2 resolved today', isPositive: false }
};

export const liveActivity = [
  { id: 1, type: 'registration', title: 'Meera Khanna registered', subtitle: '1st yr, Arts', time: '2m', status: 'success' },
  { id: 2, type: 'session', title: 'React.js session booked', subtitle: 'Priya S. & Arjun K.', time: '15m', status: 'info' },
  { id: 3, type: 'dispute', title: 'Dispute D-041 raised', subtitle: 'Ankit P. vs Rohan M.', time: '43m', status: 'warning' },
  { id: 4, type: 'payout', title: 'Payout ₹1,200 sent', subtitle: 'To Sneha K.', time: '1h', status: 'success' },
  { id: 5, type: 'suspension', title: 'Vikram N. suspended', subtitle: '3 violations', time: '3h', status: 'danger' },
];

export const categoryPerformance = {
  totalSessions: 472,
  activeTutors: 79,
  avgRating: 4.7,
  categories: [
    { name: 'Coding', sessions: 198, rating: 4.8, status: 'Growing', fill: 85, color: '#3b82f6' },
    { name: 'Design', sessions: 104, rating: 4.7, status: 'Growing', fill: 65, color: '#1e3a8a' },
    { name: 'Language', sessions: 85, rating: 4.9, status: 'Stable', fill: 45, color: '#60a5fa' },
    { name: 'Math', sessions: 52, rating: 4.6, status: 'Declining', fill: 25, color: '#ef4444' },
    { name: 'Music', sessions: 33, rating: 4.5, status: 'Stable', fill: 15, color: '#9ca3af' },
  ]
};

export const topTutors = [
  { id: 1, name: 'Priya Sharma', initial: 'P', dept: 'CSE', sessions: 42, rating: 4.9, earnings: '12,600', rank: 1 },
  { id: 2, name: 'Dev Rao', initial: 'D', dept: 'CSE', sessions: 38, rating: 4.8, earnings: '11,400', rank: 2 },
  { id: 3, name: 'Aisha Tiwari', initial: 'A', dept: 'MBA', sessions: 31, rating: 5.0, earnings: '9,300', rank: 3 },
  { id: 4, name: 'Sneha Kapoor', initial: 'S', dept: 'ECE', sessions: 24, rating: 4.7, earnings: '7,200', rank: 4 },
  { id: 5, name: 'Rohan Mehta', initial: 'R', dept: 'MCA', sessions: 18, rating: 4.6, earnings: '5,700', rank: 5 },
];

export const recentRegistrations = [
  { id: 1, name: 'Meera Khanna', initial: 'M', info: '1st yr · Arts', role: 'Student', time: '2m ago' },
  { id: 2, name: 'Kiran Desai', initial: 'K', info: '2nd yr · CSE', role: 'Student', time: '18m ago' },
  { id: 3, name: 'Tanvi Bose', initial: 'T', info: '3rd yr · ECE', role: 'Tutor', time: '1h ago' },
  { id: 4, name: 'Arjun Nair', initial: 'A', info: '1st yr · MBA', role: 'Student', time: '3h ago' },
  { id: 5, name: 'Divya Pillai', initial: 'D', info: '2nd yr · MCA', role: 'Tutor', time: '5h ago' },
];

export const platformHealth = {
  status: 'All systems operational',
  uptime: '99.9%',
  avgLoad: '142ms',
  metrics: [
    { label: 'Session Completion Rate', value: '94%', fill: 94, color: '#3b82f6' },
    { label: 'Dispute Rate', value: '2%', fill: 2, color: '#ef4444' },
    { label: 'Payment Success Rate', value: '98%', fill: 98, color: '#10b981' },
    { label: 'Tutor Response Rate', value: '87%', fill: 87, color: '#f59e0b' },
    { label: 'User Retention (30d)', value: '78%', fill: 78, color: '#8b5cf6' },
  ]
};

export const pendingDisputes = [
  { id: 'D-041', parties: 'Ankit P. vs Rohan M.', reason: 'No-show session · React.js Fundamentals', date: 'Filed June 6, 2026', amount: 300, status: 'open' },
  { id: 'D-042', parties: 'Meera K. vs Vikram N.', reason: 'Incorrect skill level · Advanced Data Structures', date: 'Filed June 5, 2026', amount: 200, status: 'open' },
  { id: 'D-043', parties: 'Raj S. vs Dev R.', reason: 'Late refund · Machine Learning Basics', date: 'Filed June 3, 2026', amount: 450, status: 'reviewing' },
];

export const mockNotifications = [
  { id: 1, type: 'user', title: 'New student registered', message: 'Ananya Sharma joined CampusSkills.', time: '2 min ago', unread: true },
  { id: 2, type: 'session', title: 'Session booked', message: 'Rohan K. booked a React.js session with Priya.', time: '15 min ago', unread: true },
  { id: 3, type: 'payment', title: 'Payment received', message: '₹300 received for DSA tutoring session.', time: '1 hr ago', unread: true },
  { id: 4, type: 'dispute', title: 'New dispute raised', message: 'Dispute #D-041 filed by Meera Singh.', time: '2 hr ago', unread: true },
  { id: 5, type: 'success', title: 'Dispute resolved', message: 'Dispute #D-038 closed successfully.', time: '5 hr ago', unread: false },
];

export const adminAnalyticsStats = {
  totalRegistrations: { value: '3,658', sub: '2024' },
  peakMonth: { value: 'Dec', sub: '468 students' },
  monthlyAvg: { value: '305', sub: 'per month' },
  yoyGrowth: { value: '+216%', sub: 'vs 2023', color: '#10b981' },
};

export const adminAnalyticsChartData = [
  { month: 'Jan', value: 160 },
  { month: 'Feb', value: 185 },
  { month: 'Mar', value: 210 },
  { month: 'Apr', value: 240 },
  { month: 'May', value: 270 },
  { month: 'Jun', value: 308 },
  { month: 'Jul', value: 285 },
  { month: 'Aug', value: 325 },
  { month: 'Sep', value: 365 },
  { month: 'Oct', value: 405 },
  { month: 'Nov', value: 435 },
  { month: 'Dec', value: 468 }
];

export const adminSessionsList = [
  { id: 1, title: 'React.js basics', status: 'LIVE', tutor: 'Priya S.', learner: 'Arjun K.', time: 'Today 4:00 PM', location: 'Online', price: '₹300', dot: '#10b981' },
  { id: 2, title: 'Figma UI design', status: 'Upcoming', tutor: 'Rohan M.', learner: 'Deepa R.', time: 'Today 6:30 PM', location: 'In-person', price: '₹250', dot: '#3b82f6' },
  { id: 3, title: 'Japanese N5', status: 'Upcoming', tutor: 'Aisha T.', learner: 'Siddharth M.', time: 'Tomorrow 10 AM', location: 'Online', price: 'Swap', dot: '#3b82f6' },
  { id: 4, title: 'Guitar basics', status: 'Upcoming', tutor: 'Sneha K.', learner: 'Kavya P.', time: 'Tomorrow 3:00 PM', location: 'In-person', price: '₹150', dot: '#3b82f6' },
  { id: 5, title: 'Data Structures', status: 'Upcoming', tutor: 'Dev R.', learner: 'Meera K.', time: 'Tomorrow 5:00 PM', location: 'Online', price: '₹400', dot: '#3b82f6' },
  { id: 6, title: 'Machine Learning', status: 'Upcoming', tutor: 'Kiran D.', learner: 'Raj S.', time: 'Jun 12, 2:00 PM', location: 'Online', price: '₹500', dot: '#3b82f6' },
  { id: 7, title: 'DSA — Graphs', status: 'Done', tutor: 'Priya S.', learner: 'Tanvi B.', time: 'Today 2:00 PM', location: 'Online', price: '₹350', dot: '#cbd5e1' },
  { id: 8, title: 'Business Communication', status: 'Done', tutor: 'Aisha T.', learner: 'Arjun N.', time: 'Today 11:00 AM', location: 'In-person', price: 'Swap', dot: '#cbd5e1' },
  { id: 9, title: 'Python Basics', status: 'Done', tutor: 'Dev R.', learner: 'Divya P.', time: 'Yesterday', location: 'Online', price: '₹200', dot: '#cbd5e1' },
];

export const adminDisputesDetailed = [
  { 
    id: 'D-041', 
    status: 'open',
    parties: 'Ankit P. vs Rohan M.', 
    meta: 'No-show session · Amount: ₹300', 
    description: 'I booked a React.js session with Rohan M. for June 5th at 4:00 PM. I paid ₹300 in advance via UPI. Rohan never joined the session and did not respond to my messages before or after the scheduled time. I waited for 30 minutes and then left. I have tried contacting him twice after but received no reply. I am requesting a full refund of ₹300 and appropriate action against the tutor.'
  },
  { 
    id: 'D-042', 
    status: 'open',
    parties: 'Meera K. vs Vikram N.', 
    meta: 'Incorrect skill level · Amount: ₹200', 
    description: 'I requested a tutor for Advanced Data Structures (trees, graphs, dynamic programming). Vikram N. listed himself as proficient in this area. However during the session it became clear he only had basic knowledge — he could not explain Red-Black Trees or Dijkstra\'s algorithm and kept referring to external resources. The session was not useful for my exam preparation. I paid ₹200 and I believe I deserve at least a partial refund since the advertised skill level was misrepresented.'
  },
  { 
    id: 'D-043', 
    status: 'reviewing',
    parties: 'Raj S. vs Dev R.', 
    meta: 'Late refund · Amount: ₹450', 
    description: 'I cancelled my session with Dev R. on May 27th (24 hours before the scheduled time) as per the platform\'s cancellation policy, which states a full refund should be issued within 3-5 business days. It has now been 7 business days and I have not received my refund of ₹450. Dev acknowledged the cancellation over chat but claims he already initiated the refund. I have checked with my bank and no such transaction has come through. I am requesting immediate resolution and the refund to be processed.'
  }
];

export const adminPaymentStats = {
  totalRevenue: { value: '₹2,36,450', sub: '+₹18,200 this week' },
  pendingPayouts: { value: '₹14,800', sub: '6 tutors waiting' },
  completedPayouts: { value: '₹2,21,650', sub: 'This academic year' }
};

export const adminTransactions = [
  { id: 1, path: 'Arjun K. \u2192 Priya S.', meta: 'React.js · UPI · Today 4:15 PM', amount: '₹300', status: 'completed' },
  { id: 2, path: 'Deepa R. \u2192 Rohan M.', meta: 'Figma UI · UPI · Today 2:00 PM', amount: '₹250', status: 'completed' },
  { id: 3, path: 'Siddharth M. \u2192 Aisha T.', meta: 'Japanese N5 · — · Yesterday', amount: 'Swap', status: 'completed' },
  { id: 4, path: 'Kavya P. \u2192 Sneha K.', meta: 'Guitar · UPI · Yesterday', amount: '₹150', status: 'pending' },
  { id: 5, path: 'Ankit P. \u2192 Rohan M.', meta: 'React basics · UPI · 2 days ago', amount: '₹200', status: 'disputed' }
];

export const adminSettingsData = {
  platformAccess: {
    title: 'CampusSkills Platform Access',
    description: 'Platform is live. Students can browse tutors, book sessions, and exchange skills.',
    badge: 'Platform is LIVE',
    isLive: true
  },
  platformSettings: [
    { id: 'skill_swaps', title: 'Allow Skill Swaps', description: 'Let students exchange skills without payment', enabled: true },
    { id: 'email_verify', title: 'Require Email Verification', description: 'New accounts must verify college email', enabled: true },
    { id: 'auto_suspend', title: 'Auto-suspend on 3 Disputes', description: 'Automatically suspend users with \u22653 open disputes', enabled: false },
    { id: 'public_tutors', title: 'Public Tutor Profiles', description: 'Allow non-students to view tutor profiles', enabled: false }
  ],
  notificationSettings: [
    { id: 'new_user_alerts', title: 'New User Alerts', description: 'Receive alerts when new users register', enabled: true },
    { id: 'dispute_alerts', title: 'Dispute Alerts', description: 'Receive alerts for new disputes', enabled: true },
    { id: 'payment_alerts', title: 'Payment Alerts', description: 'Receive alerts for payment completions', enabled: false }
  ]
};
