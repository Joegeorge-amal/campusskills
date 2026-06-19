import React, { useState, useEffect } from 'react';
import { IconSearch, IconLoader2 } from '@tabler/icons-react';
import adminService from '../../services/adminService';
import ConfirmModal from '../../components/modals/ConfirmModal';

const AdminSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const [confirmCancel, setConfirmCancel] = useState({ isOpen: false, id: null });

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getSessions({
        q: searchQuery || undefined,
        status: activeFilter !== 'All' ? activeFilter : undefined
      });
      setSessions(res.data || []);
      setTotalSessions(res.pagination?.total || (res.data?.length || 0));
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      setError('Failed to load sessions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSessions();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeFilter]);

  const executeCancel = async () => {
    if (!confirmCancel.id) return;
    try {
      await adminService.cancelSession(confirmCancel.id, "Cancelled by Admin");
      fetchSessions();
    } catch (err) {
      console.error('Failed to cancel session:', err);
      alert('Failed to cancel session.');
    } finally {
      setConfirmCancel({ isOpen: false, id: null });
    }
  };

  const handleCancel = (id) => {
    setConfirmCancel({ isOpen: true, id });
  };

  // Compute stats locally from fetched data
  const liveCount = sessions.filter(s => s.status === 'LIVE' || s.status === 'IN_PROGRESS').length;
  const upcomingCount = sessions.filter(s => s.status === 'SCHEDULED' || s.status === 'PENDING').length;
  const completedCount = sessions.filter(s => s.status === 'COMPLETED').length;
  const todayCount = activeFilter === 'All' ? totalSessions : sessions.length;


  return (
    <div className="admin-sessions-page fade-in">
      <ConfirmModal 
        isOpen={confirmCancel.isOpen}
        onClose={() => setConfirmCancel({ isOpen: false, id: null })}
        onConfirm={executeCancel}
        title="Cancel Session"
        message="Are you sure you want to cancel this session?"
        isDanger={true}
        confirmText="Cancel Session"
      />
      
      {/* Top Toolbar */}
      <div className="admin-sessions-toolbar">
        <div className="admin-u-search">
          <IconSearch size={18} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Search by skill, tutor or learner..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="as-filter-pills">
          <button 
            className={`as-pill ${activeFilter === 'All' ? 'active' : ''}`}
            onClick={() => setActiveFilter('All')}
          >
            All
          </button>
          <button 
            className={`as-pill ${activeFilter === 'LIVE' ? 'active' : ''}`}
            onClick={() => setActiveFilter('LIVE')}
          >
            Live
          </button>
          <button 
            className={`as-pill ${activeFilter === 'Upcoming' ? 'active' : ''}`}
            onClick={() => setActiveFilter('Upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`as-pill ${activeFilter === 'Completed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('Completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      {activeFilter === 'All' && (
        <div className="admin-sessions-stats" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        
        {/* Active / Upcoming Flip Card */}
        <div className="al-flip-container">
          <div className="al-flipper">
            <div className="al-front as-stat-card live" style={{ margin: 0, height: '100%' }}>
              <div className="as-stat-val">{liveCount}</div>
              <div className="as-stat-lbl">LIVE NOW</div>
            </div>
            <div className="al-back as-stat-card upcoming" style={{ margin: 0, height: '100%' }}>
              <div className="as-stat-val">{upcomingCount}</div>
              <div className="as-stat-lbl">UPCOMING</div>
            </div>
          </div>
        </div>

        {/* Today / Completed Flip Card */}
        <div className="al-flip-container">
          <div className="al-flipper">
            <div className="al-front as-stat-card today" style={{ margin: 0, height: '100%' }}>
              <div className="as-stat-val">{todayCount}</div>
              <div className="as-stat-lbl">TOTAL SESSIONS</div>
            </div>
            <div className="al-back as-stat-card completed" style={{ margin: 0, height: '100%' }}>
              <div className="as-stat-val">{completedCount}</div>
              <div className="as-stat-lbl">COMPLETED</div>
            </div>
          </div>
        </div>

      </div>
      )}

      {/* Sessions List */}
      <div className="admin-sessions-list">
        {loading ? (
          <div className="as-empty-state">
            <IconLoader2 className="spinner" size={24} style={{ marginBottom: '8px', color: '#3b82f6' }} />
            <div>Loading sessions...</div>
          </div>
        ) : error ? (
          <div className="as-empty-state" style={{ color: '#ef4444' }}>{error}</div>
        ) : sessions.length === 0 ? (
          <div className="as-empty-state">No sessions found matching your criteria.</div>
        ) : (
          sessions.map(session => {
            const statusUpper = (session.status || '').toUpperCase();
            const timeStr = session.scheduledAt ? new Date(session.scheduledAt).toLocaleString() : 'Unknown time';
            const priceStr = session.isSkillSwap ? 'Skill Swap' : (session.price ? `${session.currency || 'INR'} ${session.price}` : 'Free');
            const dotColor = statusUpper === 'LIVE' || statusUpper === 'IN_PROGRESS' ? '#ef4444' : (statusUpper === 'COMPLETED' ? '#10b981' : '#3b82f6');
            
            return (
              <div key={session.id} className="as-card">
                <div className="as-card-left">
                  <div className="as-dot" style={{ background: dotColor }}></div>
                  <div className="as-info">
                    <div className="as-title-row">
                      <span className="as-title">{session.title || 'Untitled Session'}</span>
                      {(statusUpper === 'LIVE' || statusUpper === 'IN_PROGRESS') && <span className="as-status-pill live">LIVE</span>}
                      {statusUpper === 'COMPLETED' && <span className="as-status-pill done">Done</span>}
                    </div>
                    <div className="as-meta">
                      {session.tutor} &rarr; {session.learner} &middot; {timeStr} &middot; {session.mode || 'Online'} &middot; <span className="as-price">{priceStr}</span>
                    </div>
                  </div>
                </div>
                <div className="as-card-right">
                  {statusUpper !== 'COMPLETED' && statusUpper !== 'CANCELLED' && (
                    <button className="as-cancel-btn" onClick={() => handleCancel(session.id)}>Cancel</button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default AdminSessions;
