import React from 'react';
import { IconStarFilled, IconArrowUpRight, IconArrowDownRight, IconMinus } from '@tabler/icons-react';
import '../../styles/admin.css';

const AdminOverview = () => {
  return (
    <div className="admin-overview fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>Platform Overview</h1>
        <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>All numbers are live approximations</p>
      </div>

      {/* 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div className="admin-card">
          <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px' }}>Total Students</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>1,284</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>+38 this week</div>
        </div>
        <div className="admin-card">
          <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px' }}>Active Sessions</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>47</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>+12 today</div>
        </div>
        <div className="admin-card">
          <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px' }}>Revenue (₹)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>2,36,450</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>+₹18,200 this week</div>
        </div>
        <div className="admin-card">
          <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px' }}>Open Disputes</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>3</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ef4444' }}>−2 resolved today</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-card" style={{ marginBottom: '32px' }}>
        <div className="admin-card-title" style={{ marginBottom: '24px' }}>Recent Activity</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
              <div style={{ fontSize: '0.95rem', color: '#374151' }}>New user registered: Meera Khanna (1st yr, Arts)</div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>2m ago</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }}></div>
              <div style={{ fontSize: '0.95rem', color: '#374151' }}>Session booked: React.js basics — Priya S. & Arjun K.</div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>15m ago</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>
              <div style={{ fontSize: '0.95rem', color: '#374151' }}>Dispute raised: D-041 — Ankit P. vs Rohan M.</div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>43m ago</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
              <div style={{ fontSize: '0.95rem', color: '#374151' }}>Payout processed: ₹1,200 to Sneha K.</div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>1h ago</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ fontSize: '0.95rem', color: '#374151' }}>User suspended: Vikram N. (3 violations)</div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>3h ago</div>
          </div>
        </div>
      </div>

      {/* Category Scorecard */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div className="admin-card-title" style={{ margin: 0 }}>Category Scorecard</div>
          <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>This month</div>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.5px' }}>CATEGORY</th>
              <th style={{ textAlign: 'center', padding: '12px 0', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.5px' }}>SESSIONS</th>
              <th style={{ textAlign: 'center', padding: '12px 0', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.5px' }}>TUTORS</th>
              <th style={{ textAlign: 'center', padding: '12px 0', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.5px' }}>AVG RATING</th>
              <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.5px' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '16px 0', fontSize: '0.95rem', fontWeight: 500, color: '#111827' }}>Coding</td>
              <td style={{ padding: '16px 0', fontSize: '0.95rem', color: '#4b5563', textAlign: 'center' }}>198</td>
              <td style={{ padding: '16px 0', fontSize: '0.95rem', color: '#4b5563', textAlign: 'center' }}>34</td>
              <td style={{ padding: '16px 0', fontSize: '0.95rem', fontWeight: 600, color: '#111827', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>4.8 <IconStarFilled size={14} color="#111827" /></td>
              <td style={{ padding: '16px 0', textAlign: 'right' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 }}>
                  <IconArrowUpRight size={14} /> Growing
                </span>
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '16px 0', fontSize: '0.95rem', fontWeight: 500, color: '#111827' }}>Design</td>
              <td style={{ padding: '16px 0', fontSize: '0.95rem', color: '#4b5563', textAlign: 'center' }}>104</td>
              <td style={{ padding: '16px 0', fontSize: '0.95rem', color: '#4b5563', textAlign: 'center' }}>18</td>
              <td style={{ padding: '16px 0', fontSize: '0.95rem', fontWeight: 600, color: '#111827', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>4.7 <IconStarFilled size={14} color="#111827" /></td>
              <td style={{ padding: '16px 0', textAlign: 'right' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 }}>
                  <IconArrowUpRight size={14} /> Growing
                </span>
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '16px 0', fontSize: '0.95rem', fontWeight: 500, color: '#111827' }}>Language</td>
              <td style={{ padding: '16px 0', fontSize: '0.95rem', color: '#4b5563', textAlign: 'center' }}>85</td>
              <td style={{ padding: '16px 0', fontSize: '0.95rem', color: '#4b5563', textAlign: 'center' }}>12</td>
              <td style={{ padding: '16px 0', fontSize: '0.95rem', fontWeight: 600, color: '#111827', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>4.9 <IconStarFilled size={14} color="#111827" /></td>
              <td style={{ padding: '16px 0', textAlign: 'right' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f3f4f6', color: '#4b5563', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 }}>
                  <IconArrowUpRight size={14} style={{ color: 'transparent' }} /> Stable
                </span>
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '16px 0', fontSize: '0.95rem', fontWeight: 500, color: '#111827' }}>Math</td>
              <td style={{ padding: '16px 0', fontSize: '0.95rem', color: '#4b5563', textAlign: 'center' }}>52</td>
              <td style={{ padding: '16px 0', fontSize: '0.95rem', color: '#4b5563', textAlign: 'center' }}>9</td>
              <td style={{ padding: '16px 0', fontSize: '0.95rem', fontWeight: 600, color: '#111827', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>4.6 <IconStarFilled size={14} color="#111827" /></td>
              <td style={{ padding: '16px 0', textAlign: 'right' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 }}>
                  <IconArrowDownRight size={14} /> Declining
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '16px 0', fontSize: '0.95rem', fontWeight: 500, color: '#111827' }}>Music</td>
              <td style={{ padding: '16px 0', fontSize: '0.95rem', color: '#4b5563', textAlign: 'center' }}>33</td>
              <td style={{ padding: '16px 0', fontSize: '0.95rem', color: '#4b5563', textAlign: 'center' }}>6</td>
              <td style={{ padding: '16px 0', fontSize: '0.95rem', fontWeight: 600, color: '#111827', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>4.5 <IconStarFilled size={14} color="#111827" /></td>
              <td style={{ padding: '16px 0', textAlign: 'right' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f3f4f6', color: '#4b5563', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 }}>
                  <IconArrowUpRight size={14} style={{ color: 'transparent' }} /> Stable
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOverview;
