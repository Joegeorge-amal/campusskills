import React, { useState } from 'react';
import { IconCalendarEvent, IconClock } from '@tabler/icons-react';
import { sessionService } from '../../../services/sessionService';
import { useAppData } from '../../../context/AppDataContext';

const RescheduleSection = ({ session }) => {
  const { user, triggerToast, fetchInitialData } = useAppData();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('view'); // 'view' or 'propose'
  
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  if (!session || !session.rawSession) return null;
  const raw = session.rawSession;
  const proposal = raw.rescheduleProposal;
  
  const isInitiator = proposal && proposal.initiatorId === user?.userId;

  const handlePropose = async (e) => {
    e.preventDefault();
    if (!newDate || !newTime) {
      triggerToast('Please select date and time');
      return;
    }
    
    // Create new start/end Date objects
    const startObj = new Date(`${newDate}T${newTime}`);
    const endObj = new Date(startObj.getTime() + 60 * 60 * 1000); // Assume 1 hour for now

    try {
      setLoading(true);
      await sessionService.proposeReschedule(session.id, startObj.toISOString(), endObj.toISOString());
      triggerToast('Reschedule proposed');
      fetchInitialData();
      setMode('view');
    } catch (err) {
      triggerToast('Failed to propose reschedule');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (accept) => {
    try {
      setLoading(true);
      await sessionService.respondToReschedule(session.id, accept);
      triggerToast(accept ? 'Reschedule accepted' : 'Reschedule rejected');
      fetchInitialData();
    } catch (err) {
      triggerToast('Failed to respond to reschedule');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'propose') {
    return (
      <div style={{ padding: '8px 0' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px', textAlign: 'center' }}>
          Propose New Time
        </div>
        <form onSubmit={handlePropose} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Date</label>
            <input 
              type="date" 
              value={newDate} 
              onChange={e => setNewDate(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Time</label>
            <input 
              type="time" 
              value={newTime} 
              onChange={e => setNewTime(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
              required
            />
          </div>
          
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => setMode('view')}
              disabled={loading}
              style={{ flex: 1, padding: '12px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 1, padding: '12px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Submitting...' : 'Propose'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // If there's an active proposal
  if (proposal) {
    const pDate = new Date(proposal.proposedStart);
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fffbeb', border: '2px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <IconClock size={32} color="#d97706" />
        </div>
        
        {isInitiator ? (
          <>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Reschedule Proposed
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
              Waiting for {session.name} to accept the new time:<br/>
              <strong>{pDate.toLocaleString()}</strong>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              {session.name} wants to reschedule
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
              Proposed time:<br/>
              <strong>{pDate.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => handleRespond(false)}
                disabled={loading}
                style={{ flex: 1, padding: '12px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                Reject
              </button>
              <button
                onClick={() => handleRespond(true)}
                disabled={loading}
                style={{ flex: 1, padding: '12px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                Accept
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // No active proposal, button to propose
  return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <button
        onClick={() => setMode('propose')}
        style={{ width: '100%', padding: '14px', background: '#f3f4f6', color: '#111827', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        <IconCalendarEvent size={18} />
        Propose Reschedule
      </button>
    </div>
  );
};

export default RescheduleSection;
