import React, { useState, useEffect } from 'react';
import { 
  IconUsers, 
  IconBook, 
  IconCurrencyRupee, 
  IconAlertTriangle, 
  IconTrendingUp, 
  IconTrendingDown,
  IconStarFilled,
  IconUserPlus,
  IconCalendarEvent,
  IconCash,
  IconUserX,
  IconGavel,
  IconLoader2
} from '@tabler/icons-react';
import adminService from '../../services/adminService';

const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getOverview();
      setData(res);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch overview data", err);
      setError("Failed to load dashboard overview. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-overview fade-in" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh'}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#6b7280', gap: '12px'}}>
          <IconLoader2 size={32} className="spin" />
          <div>Loading overview data...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="admin-overview fade-in">
        <div style={{padding: '32px', background: '#fef2f2', color: '#ef4444', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px'}}>
          <IconAlertTriangle />
          {error || 'Failed to load data'}
        </div>
      </div>
    );
  }

  const { platformOverview, liveActivity, categoryPerformance, platformHealth, topTutors, recentRegistrations, pendingDisputes } = data;

  return (
    <div className="admin-overview fade-in">
      
      {/* HUGE BLUE BANNER */}
      <div className="admin-hero-banner">
        <div className="admin-hero-content">
          <div className="admin-hero-left">
            <span className="admin-hero-date">PLATFORM OVERVIEW · JUNE 2026</span>
            <h1 className="admin-hero-title">Good morning, Admin</h1>
            <p className="admin-hero-subtitle">Here's what's happening at Kristu Jayanti University today.</p>
          </div>
          <div className="admin-hero-right">
            <div className="admin-hero-stat-box">
              <span className="hero-stat-val">{platformOverview?.totalStudents?.value || 0}</span>
              <span className="hero-stat-lbl">Active Now</span>
            </div>
            <div className="admin-hero-stat-box">
              <span className="hero-stat-val" style={{color: '#6ee7b7'}}>{platformOverview?.activeSessions?.value || 0}</span>
              <span className="hero-stat-lbl">LIVE Session</span>
            </div>
          </div>
        </div>
      </div>

      {/* OVERLAPPING STAT CARDS */}
      <div className="admin-overview-stats">
        <div className="admin-ostard">
          <div className="ostard-icon" style={{background: '#eff6ff', color: '#2563eb'}}>
            <IconUsers size={20} />
          </div>
          <div className="ostard-label">TOTAL STUDENTS</div>
          <div className="ostard-value">{platformOverview.totalStudents.value.toLocaleString()}</div>
          <div className={`ostard-trend ${platformOverview.totalStudents.isPositive ? 'positive' : 'negative'}`}>
            {platformOverview.totalStudents.isPositive ? <IconTrendingUp size={16} /> : <IconTrendingDown size={16} />}
            {platformOverview.totalStudents.trend}
          </div>
        </div>

        <div className="admin-ostard">
          <div className="ostard-icon" style={{background: '#ecfdf5', color: '#10b981'}}>
            <IconBook size={20} />
          </div>
          <div className="ostard-label">ACTIVE SESSIONS</div>
          <div className="ostard-value">{platformOverview.activeSessions.value}</div>
          <div className={`ostard-trend ${platformOverview.activeSessions.isPositive ? 'positive' : 'negative'}`}>
            {platformOverview.activeSessions.isPositive ? <IconTrendingUp size={16} /> : <IconTrendingDown size={16} />}
            {platformOverview.activeSessions.trend}
          </div>
        </div>

        <div className="admin-ostard">
          <div className="ostard-icon" style={{background: '#fef3c7', color: '#d97706'}}>
            <IconCurrencyRupee size={20} />
          </div>
          <div className="ostard-label">VALUE EXCHANGED (₹)</div>
          <div className="ostard-value">{platformOverview.revenue.value}</div>
          <div className={`ostard-trend ${platformOverview.revenue.isPositive ? 'positive' : 'negative'}`}>
            {platformOverview.revenue.isPositive ? <IconTrendingUp size={16} /> : <IconTrendingDown size={16} />}
            {platformOverview.revenue.trend}
          </div>
        </div>

        <div className="admin-ostard">
          <div className="ostard-icon" style={{background: '#fef2f2', color: '#ef4444'}}>
            <IconAlertTriangle size={20} />
          </div>
          <div className="ostard-label">OPEN DISPUTES</div>
          <div className="ostard-value">{platformOverview.openDisputes.value}</div>
          <div className={`ostard-trend ${platformOverview.openDisputes.isPositive ? 'positive' : 'negative'}`}>
            {platformOverview.openDisputes.isPositive ? <IconTrendingUp size={16} /> : <IconTrendingDown size={16} />}
            {platformOverview.openDisputes.trend}
          </div>
        </div>
      </div>

      {/* THREE COLUMN GRID */}
      <div className="admin-grid-3col">
        
        {/* COL 1: LIVE ACTIVITY */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h3>Live Activity</h3>
            <span className="live-pulse-badge">
              <span className="pulse-dot"></span> LIVE
            </span>
          </div>
          <div className="live-activity-list">
            {liveActivity.map((activity) => (
              <div key={activity.id} className="la-item">
                <div className={`la-icon ${activity.status}`}>
                  {activity.type === 'registration' && <IconUsers size={16} />}
                  {activity.type === 'session' && <IconBook size={16} />}
                  {activity.type === 'dispute' && <IconAlertTriangle size={16} />}
                  {activity.type === 'payout' && <IconCash size={16} />}
                  {activity.type === 'suspension' && <IconUserX size={16} />}
                </div>
                <div className="la-content">
                  <div className="la-title">{activity.title}</div>
                  <div className="la-sub">{activity.subtitle}</div>
                </div>
                <div className="la-time">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* COL 2: CATEGORY PERFORMANCE */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h3>Category Performance</h3>
            <span className="panel-hdr-sub">This month</span>
          </div>
          <div className="cat-perf-list">
            {categoryPerformance.categories.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#9ca3af', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <IconBook size={28} style={{ marginBottom: '12px', color: '#cbd5e1' }} />
                <div>No active sessions yet.</div>
              </div>
            ) : (
              categoryPerformance.categories.map((cat, idx) => (
                <div key={idx} className="cat-perf-item">
                  <div className="cat-perf-top">
                    <div className="cat-perf-name">
                      <span className="cat-dot" style={{background: cat.color}}></span>
                      {cat.name}
                      <span className={`cat-status-pill ${cat.status.toLowerCase()}`}>
                        {cat.status === 'Growing' ? <IconTrendingUp size={12}/> : (cat.status === 'Declining' ? <IconTrendingDown size={12}/> : '')}
                        {cat.status}
                      </span>
                    </div>
                    <div className="cat-perf-stats">
                      {cat.sessions} sessions <span className="cat-rating"><IconStarFilled size={10} color="#f59e0b"/> {cat.rating}</span>
                    </div>
                  </div>
                  <div className="cat-perf-bar-bg">
                    <div className="cat-perf-bar-fill" style={{width: `${cat.fill}%`, background: cat.color}}></div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="cat-perf-footer">
            <div className="cpf-stat">
              <div className="cpf-val">{categoryPerformance.totalSessions}</div>
              <div className="cpf-lbl">TOTAL SESSIONS</div>
            </div>
            <div className="cpf-stat">
              <div className="cpf-val">{categoryPerformance.activeTutors}</div>
              <div className="cpf-lbl">ACTIVE TUTORS</div>
            </div>
            <div className="cpf-stat">
              <div className="cpf-val">{categoryPerformance.avgRating} <IconStarFilled size={14} /></div>
              <div className="cpf-lbl">AVG RATING</div>
            </div>
          </div>
        </div>

        {/* COL 3: PLATFORM HEALTH */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h3>Platform Health</h3>
            <span className="health-badge success">
              <span className="pulse-dot"></span> All systems operational
            </span>
          </div>
          <div className="health-metrics-list">
            {platformHealth.metrics.map((metric, idx) => (
              <div key={idx} className="hm-item">
                <div className="hm-top">
                  <span className="hm-lbl">{metric.label}</span>
                  <span className="hm-val">{metric.value}</span>
                </div>
                <div className="hm-bar-bg">
                  <div className="hm-bar-fill" style={{width: `${metric.fill}%`, background: metric.color}}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="health-footer">
            <div className="hf-stat">
              <div className="hf-val">{platformHealth.uptime}</div>
              <div className="hf-lbl">Uptime</div>
            </div>
            <div className="hf-stat">
              <div className="hf-val">{platformHealth.avgLoad}</div>
              <div className="hf-lbl">Avg Load (ms)</div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM WIDGETS ROW */}
      <div className="admin-grid-2col" style={{ marginTop: '24px' }}>
        
        {/* TOP TUTORS */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h3>Top Tutors</h3>
            <span className="panel-hdr-sub">This month</span>
          </div>
          <div className="admin-list-widget">
            {topTutors.map(tutor => (
              <div key={tutor.id} className="alw-item">
                <div className="alw-rank">#{tutor.rank}</div>
                <div className="alw-avatar">{tutor.initial}</div>
                <div className="alw-info">
                  <div className="alw-name">{tutor.name}</div>
                  <div className="alw-sub">{tutor.dept} · {tutor.sessions} sessions</div>
                </div>
                <div className="alw-right">
                  <div className="alw-rating"><IconStarFilled size={12} color="#f59e0b"/> {tutor.rating}</div>
                  <div className="alw-earnings">₹{tutor.earnings}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT REGISTRATIONS */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h3>Recent Registrations</h3>
            <span className="panel-hdr-sub active-blue">+38 this week</span>
          </div>
          <div className="admin-list-widget">
            {recentRegistrations.map(reg => (
              <div key={reg.id} className="alw-item">
                <div className="alw-avatar" style={{background: '#f3f4f6', color: '#4b5563'}}>{reg.initial}</div>
                <div className="alw-info">
                  <div className="alw-name">{reg.name}</div>
                  <div className="alw-sub">{reg.info}</div>
                </div>
                <div className="alw-right" style={{textAlign: 'right'}}>
                  <div className={`alw-role-pill ${reg.role.toLowerCase()}`}>{reg.role}</div>
                  <div className="alw-time" style={{fontSize: '11px', color: '#9ca3af', marginTop: '4px'}}>{reg.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PENDING DISPUTES WIDGET */}
      <div className="admin-panel" style={{ marginTop: '24px', marginBottom: '32px' }}>
        <div className="admin-panel-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <IconAlertTriangle size={20} color="#ef4444" />
            <h3 style={{margin: 0}}>Pending Disputes</h3>
            <span className="panel-badge red">{pendingDisputes.length} open</span>
          </div>
          <a href="/admin/reports" className="panel-view-all">View all →</a>
        </div>
        <div className="admin-disputes-list">
          {pendingDisputes.map(disp => (
            <div key={disp.id} className="adl-item">
              <div className="adl-id">{disp.id}</div>
              <div className="adl-info">
                <div className="adl-parties">{disp.parties}</div>
                <div className="adl-reason">{disp.reason} · {disp.date}</div>
              </div>
              <div className="adl-right">
                <div className="adl-amount">₹{disp.amount}</div>
                <div className={`adl-status ${disp.status}`}>{disp.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminOverview;
