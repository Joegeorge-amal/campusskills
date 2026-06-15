import React, { useState } from 'react';
import { IconCheck, IconHourglassHigh } from '@tabler/icons-react';
import { sessionService } from '../../../services/sessionService';
import { useAppData } from '../../../context/AppDataContext';

const HandshakeSection = ({ session }) => {
  const { user, triggerToast, fetchInitialData } = useAppData();
  const [loading, setLoading] = useState(false);

  if (!session || !session.rawSession) return null;

  const raw = session.rawSession;
  const isTeacher = raw.teacherId === user?.userId;
  const myConfirmation = isTeacher ? raw.teacherConfirmedCompletion : raw.studentConfirmedCompletion;
  const theirConfirmation = isTeacher ? raw.studentConfirmedCompletion : raw.teacherConfirmedCompletion;
  const otherPerson = session.name;

  const handleMarkComplete = async () => {
    try {
      setLoading(true);
      await sessionService.markCompletion(session.id);
      triggerToast('Marked as complete. Waiting for the other participant.');
      fetchInitialData();
    } catch (err) {
      triggerToast('Failed to mark completion.');
    } finally {
      setLoading(false);
    }
  };

  // State 1: I have confirmed, waiting for them
  if (myConfirmation && !theirConfirmation) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid #8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', background: '#f5f3ff' }}>
          <IconHourglassHigh size={28} color="#7c3aed" />
        </div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
          Waiting for {otherPerson}.
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', lineHeight: 1.5 }}>
          You've marked the session as complete.<br/>Waiting for them to confirm...
        </div>
      </div>
    );
  }

  // State 2: They have confirmed, waiting for me
  if (!myConfirmation && theirConfirmation) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <IconCheck size={32} color="#1d4ed8" />
        </div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
          {otherPerson} marked this session as completed.
        </div>
        <button
          onClick={handleMarkComplete}
          disabled={loading}
          style={{ width: '100%', padding: '14px', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '16px' }}
        >
          {loading ? 'Confirming...' : 'Confirm Completion'}
        </button>
      </div>
    );
  }

  // State 3: Neither confirmed. Show standard complete button.
  return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <button
        onClick={handleMarkComplete}
        disabled={loading}
        style={{ width: '100%', padding: '14px', background: '#1d4ed8', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'Marking...' : 'Mark Session Completed'}
      </button>
    </div>
  );
};

export default HandshakeSection;
