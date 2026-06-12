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
