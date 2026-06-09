import React from 'react';
import { 
  IconUsers, 
  IconCalendarEvent, 
  IconWallet, 
  IconAlertTriangle, 
  IconTrendingUp, 
  IconTrendingDown,
  IconStarFilled,
  IconUserPlus,
  IconCash,
  IconUserX,
  IconGavel
} from '@tabler/icons-react';

const AdminOverview = () => {
  return (
    <div className="fade-in">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Platform Overview</h1>
          <p className="admin-page-subtitle">Live metrics and platform health</p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Total Students</span>
            <IconUsers size={20} className="admin-stat-icon" />
          </div>
          <div className="admin-stat-value">1,284</div>
          <div className="admin-stat-trend trend-up">
            <IconTrendingUp size={16} /> +38 this week
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Active Sessions</span>
            <IconCalendarEvent size={20} className="admin-stat-icon" />
          </div>
          <div className="admin-stat-value">47</div>
          <div className="admin-stat-trend trend-up">
            <IconTrendingUp size={16} /> +12 today
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Revenue (₹)</span>
            <IconWallet size={20} className="admin-stat-icon" />
          </div>
          <div className="admin-stat-value">2,36,450</div>
          <div className="admin-stat-trend trend-up">
            <IconTrendingUp size={16} /> +₹18k this week
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-title">Open Disputes</span>
            <IconAlertTriangle size={20} className="admin-stat-icon" />
          </div>
          <div className="admin-stat-value">3</div>
          <div className="admin-stat-trend trend-down">
            <IconTrendingDown size={16} /> -2 resolved today
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Category Scorecard */}
        <div className="admin-table-container">
          <div className="admin-table-toolbar">
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Category Performance</h3>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Sessions</th>
                <th style={{ textAlign: 'right' }}>Tutors</th>
                <th style={{ textAlign: 'center' }}>Avg Rating</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 500 }}>Coding</td>
                <td style={{ textAlign: 'right' }}>198</td>
                <td style={{ textAlign: 'right' }}>34</td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 600 }}>
                    4.8 <IconStarFilled size={14} color="#f59e0b" />
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="badge badge-success">Growing</span>
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>Design</td>
                <td style={{ textAlign: 'right' }}>104</td>
                <td style={{ textAlign: 'right' }}>18</td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 600 }}>
                    4.7 <IconStarFilled size={14} color="#f59e0b" />
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="badge badge-success">Growing</span>
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>Language</td>
                <td style={{ textAlign: 'right' }}>85</td>
                <td style={{ textAlign: 'right' }}>12</td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 600 }}>
                    4.9 <IconStarFilled size={14} color="#f59e0b" />
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="badge badge-neutral">Stable</span>
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>Math</td>
                <td style={{ textAlign: 'right' }}>52</td>
                <td style={{ textAlign: 'right' }}>9</td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 600 }}>
                    4.6 <IconStarFilled size={14} color="#f59e0b" />
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="badge badge-danger">Declining</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Recent Activity Timeline */}
        <div className="admin-table-container" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', color: '#0f172a' }}>Recent Activity</h3>
          
          <div className="admin-timeline">
            <div className="timeline-item">
              <div className="timeline-icon success">
                <IconUserPlus size={14} />
              </div>
              <div className="timeline-content">
                <div className="timeline-text">New user registered: Meera Khanna</div>
                <div className="timeline-time">2 mins ago</div>
              </div>
            </div>
            
            <div className="timeline-item">
              <div className="timeline-icon info">
                <IconCalendarEvent size={14} />
              </div>
              <div className="timeline-content">
                <div className="timeline-text">Session booked: React.js basics</div>
                <div className="timeline-time">15 mins ago</div>
              </div>
            </div>
            
            <div className="timeline-item">
              <div className="timeline-icon warning">
                <IconAlertTriangle size={14} />
              </div>
              <div className="timeline-content">
                <div className="timeline-text">Dispute raised: D-041 (Ankit vs Rohan)</div>
                <div className="timeline-time">43 mins ago</div>
              </div>
            </div>
            
            <div className="timeline-item">
              <div className="timeline-icon success">
                <IconCash size={14} />
              </div>
              <div className="timeline-content">
                <div className="timeline-text">Payout processed: ₹1,200 to Sneha K.</div>
                <div className="timeline-time">1 hour ago</div>
              </div>
            </div>
            
            <div className="timeline-item">
              <div className="timeline-icon danger">
                <IconUserX size={14} />
              </div>
              <div className="timeline-content">
                <div className="timeline-text">User suspended: Vikram N. (3 violations)</div>
                <div className="timeline-time">3 hours ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
