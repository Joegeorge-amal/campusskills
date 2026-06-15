import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import SessionsCardV2 from '../components/common/SessionsCardV2';
import ReportSessionModal from '../components/modals/ReportSessionModal';
import ActiveSessionModal from '../components/modals/ActiveSessionModal';
import { useSessionReminder } from '../hooks/useSessionReminder';
import SessionReminderOverlay from '../components/modals/SessionReminderOverlay';

const Sessions = () => {
  const { sessionsData, isSessionsLoading, triggerToast } = useAppData();
  const [activeSession, setActiveSession] = useState(null);
  
  const { activeReminder, dismissReminder } = useSessionReminder(sessionsData);

  const [isSoonOpen, setIsSoonOpen] = useState(true);
  const [isAllOpen, setIsAllOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleRate = (name) => {
    triggerToast(`Opening rating modal for ${name}`);
  };

  const handleReport = (title) => {
    const target = title.split('·')[1]?.trim();
    const context = title.split('·')[0]?.trim();
    document.dispatchEvent(new CustomEvent('openReport', { detail: { target, context } }));
  };

  const btnJoin = { fontSize: '11px', padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#1d4ed8', color: '#ffffff', cursor: 'pointer', fontWeight: 600 };
  const btnRate = { fontSize: '11px', padding: '5px 12px', borderRadius: '100px', border: '1px solid #93c5fd', background: '#ffffff', color: '#3b82f6', cursor: 'pointer', fontWeight: 600 };

  if (isSessionsLoading) {
    return (
      <div id="sessions" className="pg on" style={{ padding: 0, height: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>Loading sessions...</div>
      </div>
    );
  }

  const now = Date.now();
  const soonLimit = now + 48 * 60 * 60 * 1000; // 48 hours

  // Filter and sort sessions
  const allScheduled = sessionsData
    .filter(s => s.status === 'SCHEDULED')
    .sort((a, b) => (a.rawSession.scheduledStart || 0) - (b.rawSession.scheduledStart || 0));

  const upcomingSoon = allScheduled.filter(s => 
    s.rawSession.scheduledStart && 
    s.rawSession.scheduledStart <= soonLimit && 
    s.rawSession.scheduledStart >= now - 3600000 // up to 1 hour ago
  );

  const pastSessions = sessionsData
    .filter(s => s.status === 'COMPLETED' || s.status === 'CANCELLED')
    .sort((a, b) => (b.rawSession.updatedAt || 0) - (a.rawSession.updatedAt || 0));

  return (
    <div id="sessions" className="pg on" style={{ padding: '32px 40px', backgroundColor: 'var(--cs-bg-light)', backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px)', backgroundSize: '24px 24px', minHeight: '100vh', boxSizing: 'border-box', overflowY: 'auto' }}>
      <ReportSessionModal />
      <ActiveSessionModal 
        isOpen={!!activeSession} 
        session={activeSession} 
        onClose={() => setActiveSession(null)} 
      />
      <SessionReminderOverlay 
        session={activeReminder} 
        onDismiss={dismissReminder} 
        onProposePostponement={(s) => setActiveSession(s)}
      />

      {/* Coming up soon Section */}
      <div style={{ marginBottom: '28px' }}>
        <div 
          style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setIsSoonOpen(!isSoonOpen)}
        >
          <span>{isSoonOpen ? '▼' : '▶'}</span> Coming up soon ({upcomingSoon.length})
        </div>
        
        {isSoonOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingSoon.map((s, idx) => (
              <SessionsCardV2
                key={s.id || idx}
                date={s.day} month={s.month}
                title={`${s.topic} · ${s.name}`}
                subtitle={`${s.time} · ${s.mode}`}
                actions={
                  <button style={btnJoin} onClick={() => setActiveSession(s)}>Join Room</button>
                }
              />
            ))}
            
            {upcomingSoon.length === 0 && (
              <div style={{ fontSize: '14px', color: '#6b7280', padding: '32px 0', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                No sessions scheduled for the next 48 hours.
              </div>
            )}
          </div>
        )}
      </div>

      {/* All Scheduled Sessions Section */}
      <div style={{ marginBottom: '28px' }}>
        <div 
          style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setIsAllOpen(!isAllOpen)}
        >
          <span>{isAllOpen ? '▼' : '▶'}</span> All Scheduled Sessions ({allScheduled.length})
        </div>
        
        {isAllOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allScheduled.map((s, idx) => (
              <SessionsCardV2
                key={s.id || idx}
                date={s.day} month={s.month}
                title={`${s.topic} · ${s.name}`}
                subtitle={`${s.time} · ${s.mode}`}
                actions={
                  <button style={btnJoin} onClick={() => setActiveSession(s)}>Join Room</button>
                }
              />
            ))}
            
            {allScheduled.length === 0 && (
              <div style={{ fontSize: '14px', color: '#6b7280', padding: '32px 0', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                No scheduled sessions found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* History / Past Sessions Section */}
      <div>
        <div 
          style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
        >
          <span>{isHistoryOpen ? '▼' : '▶'}</span> Past Sessions & History ({pastSessions.length})
        </div>
        
        {isHistoryOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pastSessions.map((s, idx) => {
              const isSwap = !!s.rawSession.swapGroupId;
              const canReview = s.status === 'COMPLETED' && (isSwap || s.rawSession.studentMarkedPaid);

              return (
                <SessionsCardV2
                  key={s.id || idx}
                  date={s.day} month={s.month}
                  title={`${s.topic} · ${s.name}`}
                  subtitle={`${s.status === 'CANCELLED' ? 'Cancelled' : 'Completed'} · ${s.mode}`}
                  actions={
                    canReview ? (
                      <button style={btnRate} onClick={() => handleRate(s.name)}>Rate</button>
                    ) : null
                  }
                />
              );
            })}
            
            {pastSessions.length === 0 && (
              <div style={{ fontSize: '14px', color: '#6b7280', padding: '32px 0', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                No past sessions found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sessions;