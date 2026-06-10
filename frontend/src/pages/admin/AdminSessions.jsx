import React, { useState } from 'react';
import { IconSearch } from '@tabler/icons-react';
import { adminSessionsList } from '../../data/adminDashboardData';

const AdminSessions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredSessions = adminSessionsList.filter(session => {
    if (activeFilter !== 'All' && session.status.toLowerCase() !== activeFilter.toLowerCase()) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !session.title.toLowerCase().includes(q) &&
        !session.tutor.toLowerCase().includes(q) &&
        !session.learner.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="admin-sessions-page fade-in">
      
      {/* Top Toolbar */}
      <div className="admin-sessions-toolbar">
        <div className="as-search-wrapper">
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
      <div className="admin-sessions-stats">
        <div className="as-stat-card live">
          <div className="as-stat-val">1</div>
          <div className="as-stat-lbl">LIVE NOW</div>
        </div>
        <div className="as-stat-card upcoming">
          <div className="as-stat-val">6</div>
          <div className="as-stat-lbl">UPCOMING</div>
        </div>
        <div className="as-stat-card today">
          <div className="as-stat-val">9</div>
          <div className="as-stat-lbl">TODAY TOTAL</div>
        </div>
        <div className="as-stat-card completed">
          <div className="as-stat-val">463</div>
          <div className="as-stat-lbl">COMPLETED</div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="admin-sessions-list">
        {filteredSessions.length === 0 ? (
          <div className="as-empty-state">No sessions found matching your criteria.</div>
        ) : (
          filteredSessions.map(session => (
            <div key={session.id} className="as-card">
              <div className="as-card-left">
                <div className="as-dot" style={{ background: session.dot }}></div>
                <div className="as-info">
                  <div className="as-title-row">
                    <span className="as-title">{session.title}</span>
                    {session.status === 'LIVE' && <span className="as-status-pill live">LIVE</span>}
                    {session.status === 'Done' && <span className="as-status-pill done">Done</span>}
                  </div>
                  <div className="as-meta">
                    {session.tutor} &rarr; {session.learner} &middot; {session.time} &middot; {session.location} &middot; <span className="as-price">{session.price}</span>
                  </div>
                </div>
              </div>
              <div className="as-card-right">
                <button className="as-cancel-btn">Cancel</button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default AdminSessions;
