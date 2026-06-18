import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAppData } from '../../context/AppDataContext';
import { useSessionReminder } from '../../hooks/useSessionReminder';
import SessionReminderOverlay from './SessionReminderOverlay';
import { sessionService } from '../../services/sessionService';
import { IconX } from '@tabler/icons-react';
import CustomTimeInput from '../common/CustomTimeInput';
import CustomSelect from '../common/CustomSelect';

const SessionReminderManager = () => {
  const { sessionsData, triggerToast, fetchSessionsOnly } = useAppData();
  const { activeReminder, dismissReminder } = useSessionReminder(sessionsData);

  // Reschedule Modal states
  const [rescheduleSession, setRescheduleSession] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleDuration, setRescheduleDuration] = useState('60');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleOpenReschedule = (e) => {
      const session = e.detail;
      handleProposePostponement(session);
    };

    const handleRefreshData = () => {
      fetchSessionsOnly();
    };

    document.addEventListener('openReschedule', handleOpenReschedule);
    document.addEventListener('refreshSessionsData', handleRefreshData);

    return () => {
      document.removeEventListener('openReschedule', handleOpenReschedule);
      document.removeEventListener('refreshSessionsData', handleRefreshData);
    };
  }, [fetchSessionsOnly]);

  const handleRescheduleSubmit = async () => {
    if (isSubmitting) return;
    if (!rescheduleDate || !rescheduleTime) {
      triggerToast('Please select a date and time');
      return;
    }
    const startObj = new Date(`${rescheduleDate}T${rescheduleTime}`);
    const endObj = new Date(startObj.getTime() + parseInt(rescheduleDuration) * 60 * 1000);
    try {
      setIsSubmitting(true);
      await sessionService.proposeReschedule(rescheduleSession.id, startObj.getTime(), endObj.getTime());
      triggerToast('Reschedule proposal sent successfully!');
      setRescheduleSession(null);
      // Refresh only sessions data, not the whole app
      fetchSessionsOnly();
    } catch (err) {
      triggerToast('Failed to propose reschedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProposePostponement = (session) => {
    setRescheduleSession(session);
    // Initialize date and time inputs with current values of the session
    if (session.rawSession && session.rawSession.scheduledStart) {
      const d = new Date(session.rawSession.scheduledStart);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      
      setRescheduleDate(`${year}-${month}-${day}`);
      setRescheduleTime(`${hours}:${minutes}`);
    }
  };

  return (
    <>
      <SessionReminderOverlay 
        session={activeReminder} 
        onDismiss={dismissReminder} 
        onProposePostponement={handleProposePostponement}
      />

      {/* Reschedule Modal */}
      {rescheduleSession && ReactDOM.createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>Propose Reschedule</h3>
              <button onClick={() => setRescheduleSession(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}><IconX size={20} /></button>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '4px' }}>Date</label>
              <input 
                type="date" 
                value={rescheduleDate} 
                onChange={(e) => setRescheduleDate(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '4px' }}>Start Time</label>
              <CustomTimeInput value={rescheduleTime} onChange={setRescheduleTime} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '4px' }}>Duration</label>
              <CustomSelect 
                value={rescheduleDuration} 
                onChange={val => setRescheduleDuration(val)}
                options={[
                  { value: '30', label: '30 minutes' },
                  { value: '60', label: '60 minutes' },
                  { value: '90', label: '90 minutes' }
                ]}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setRescheduleSession(null)}
                disabled={isSubmitting}
                style={{ flex: 1, padding: '10px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '13px', opacity: isSubmitting ? 0.6 : 1 }}
              >
                Cancel
              </button>
              <button 
                onClick={handleRescheduleSubmit}
                disabled={isSubmitting}
                style={{ flex: 1, padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '13px', opacity: isSubmitting ? 0.6 : 1 }}
              >
                {isSubmitting ? 'Proposing...' : 'Propose'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default SessionReminderManager;
