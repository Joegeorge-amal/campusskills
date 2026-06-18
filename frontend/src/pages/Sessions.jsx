import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { sessionService } from '../services/sessionService';
import ReportSessionModal from '../components/modals/ReportSessionModal';
import ModalWrapper from '../components/common/ModalWrapper';
import { 
  IconChevronDown, 
  IconChevronUp, 
  IconCalendar, 
  IconCalendarMonth,
  IconMapPin, 
  IconClock, 
  IconCopy, 
  IconCheck, 
  IconAlertTriangle, 
  IconStar, 
  IconStarFilled, 
  IconX,
  IconFlag
} from '@tabler/icons-react';

import ReviewModal from '../components/modals/ReviewModal';
import CustomTimeInput from '../components/common/CustomTimeInput';
import CustomSelect from '../components/common/CustomSelect';

const Sessions = () => {
  const { user } = useAuth();
  const { sessionsData, requestsData, isSessionsLoading, triggerToast, fetchInitialData, searchQuery, sessionEvent, setSessionEvent } = useAppData();
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [paymentInfos, setPaymentInfos] = useState({});
  const [loadingPaymentId, setLoadingPaymentId] = useState(null);

  // Accordion lists open states
  const [isSoonOpen, setIsSoonOpen] = useState(true);
  const [isAllOpen, setIsAllOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const location = useLocation();
  const highlightedSessionId = location.state?.highlightSessionId;
  const [activeHighlightId, setActiveHighlightId] = useState(null);

  useEffect(() => {
    if (highlightedSessionId && sessionsData && sessionsData.length > 0) {
      setExpandedSessionId(highlightedSessionId);
      setActiveHighlightId(highlightedSessionId);
      
      const session = sessionsData.find(s => s.id === highlightedSessionId);
      if (session) {
        const isSwap = !!session.rawSession.swapGroupId;
        const isHistory = session.status === 'CANCELLED' || 
          (session.status === 'COMPLETED' && (isSwap || session.rawSession.teacherConfirmedPayment));
          
        if (isHistory) {
          setIsHistoryOpen(true);
        } else {
          setIsSoonOpen(true);
          setIsAllOpen(true);
        }
        
        setTimeout(() => {
          const el = document.getElementById(`session-${highlightedSessionId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);

        // Fade out highlight after 1.8 seconds
        const timer = setTimeout(() => {
          setActiveHighlightId(null);
        }, 1800);
        return () => clearTimeout(timer);
      }
    }
  }, [highlightedSessionId, sessionsData]);

  // Auto-guide effect: react to session WS events with proactive modals
  useEffect(() => {
    if (!sessionEvent) return;
    const raw = sessionEvent.session;
    if (!raw) return;

    const sessionId = raw._id || raw.id;
    if (!sessionId) return;

    // Auto-expand — find in local data first, fall back to raw id
    const localSession = sessionsData.find(s => s.id === sessionId);
    const myId = user?.userId;
    if (!myId) return;

    const isTeacher = raw.teacherId === myId;
    const myRole = isTeacher ? 'Teaching' : 'Learning';

    setExpandedSessionId(sessionId);

    if (sessionEvent.type === 'SESSION_BOTH_CONFIRMED') {
      setIsHistoryOpen(true);
      triggerToast('Session completed! ' + (myRole === 'Learning' ? 'Please complete payment.' : 'Waiting for payment from student.'));
    } else if (sessionEvent.type === 'PAYMENT_SUBMITTED') {
      setIsHistoryOpen(true);
      if (isTeacher) {
        triggerToast('Payment claimed by ' + (raw.studentName || 'student') + '. Please confirm receipt.');
      } else {
        triggerToast('Payment submitted. Waiting for teacher to confirm.');
      }
    } else if (sessionEvent.type === 'PAYMENT_CONFIRMED') {
      setIsHistoryOpen(true);
      triggerToast('Payment confirmed! Please leave a review.');
      // Only auto-open review modal if not already reviewed
      const alreadyReviewed = localSession?.rawSession?.hasReviewed || raw.hasReviewed;
      if (!alreadyReviewed) {
        const stubSession = localSession || {
          id: sessionId,
          rawSession: raw,
          topic: raw.topic || 'Skill Session',
          name: isTeacher ? (raw.studentName || 'Student') : (raw.teacherName || 'Teacher'),
          role: myRole,
          status: 'COMPLETED'
        };
        setSelectedSessionForReview(stubSession);
        setReviewModalOpen(true);
      }
    } else if (sessionEvent.type === 'COMPLETION_REQUESTED') {
      setIsHistoryOpen(true);
      const requesterIsTeacher = raw.teacherConfirmedCompletion;
      if ((myRole === 'Learning' && requesterIsTeacher) || (myRole === 'Teaching' && !requesterIsTeacher)) {
        triggerToast('Session marked as completed. Please confirm.');
      }
    }

    const timer = setTimeout(() => setSessionEvent(null), 500);
    return () => clearTimeout(timer);
  }, [sessionEvent, sessionsData, user, triggerToast, setSessionEvent]);

  // Reschedule Modal state
  const [rescheduleSession, setRescheduleSession] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleDuration, setRescheduleDuration] = useState('60');

  // Cancel Modal state
  const [cancelSessionItem, setCancelSessionItem] = useState(null);
  const [cancelReason, setCancelReason] = useState('Scheduling conflict');

  // Processing state for buttons
  const [processingSessionId, setProcessingSessionId] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);

  // Review states
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSessionForReview, setSelectedSessionForReview] = useState(null);

  const handleToggleExpand = async (session) => {
    const sessionId = session.id;
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
    } else {
      setExpandedSessionId(sessionId);
      
      const req = requestsData.find(r => r.id === session.rawSession.exchangeId);
      const isSwap = !!session.rawSession.swapGroupId || (req && req.rawReq?.type === 'SWAP');
      const isCompleted = session.status === 'COMPLETED';

      // Fetch payment info if needed and not loaded
      if (isCompleted && !isSwap && !paymentInfos[sessionId] && session.role === 'Learning') {
        try {
          setLoadingPaymentId(sessionId);
          const info = await sessionService.getPaymentInfo(sessionId);
          setPaymentInfos(prev => ({ ...prev, [sessionId]: info }));
        } catch (e) {
          console.error("Failed to load payment info:", e);
        } finally {
          setLoadingPaymentId(null);
        }
      }
    }
  };

  const handleMarkCompletion = async (sessionId) => {
    if (processingSessionId) return;
    try {
      setProcessingSessionId(sessionId);
      setProcessingAction('complete');
      await sessionService.markCompletion(sessionId);
      triggerToast('Completion status updated!');
      fetchInitialData();
    } catch (err) {
      triggerToast(err.message || 'Failed to mark completion');
    } finally {
      setProcessingSessionId(null);
      setProcessingAction(null);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (processingSessionId) return;
    if (!rescheduleDate || !rescheduleTime) {
      triggerToast('Please select a date and time');
      return;
    }
    const startObj = new Date(`${rescheduleDate}T${rescheduleTime}`);
    const endObj = new Date(startObj.getTime() + parseInt(rescheduleDuration) * 60 * 1000);
    try {
      setProcessingSessionId(rescheduleSession.id);
      setProcessingAction('reschedule');
      await sessionService.proposeReschedule(rescheduleSession.id, startObj.getTime(), endObj.getTime());
      triggerToast('Reschedule proposal sent successfully!');
      setRescheduleSession(null);
      fetchInitialData();
    } catch (err) {
      triggerToast('Failed to propose reschedule');
    } finally {
      setProcessingSessionId(null);
      setProcessingAction(null);
    }
  };

  const handleCancelSubmit = async () => {
    if (processingSessionId) return;
    try {
      setProcessingSessionId(cancelSessionItem.id);
      setProcessingAction('cancel');
      await sessionService.cancelSession(cancelSessionItem.id, cancelReason);
      triggerToast('Session cancelled successfully');
      setCancelSessionItem(null);
      fetchInitialData();
    } catch (err) {
      triggerToast(err.message || 'Failed to cancel session');
    } finally {
      setProcessingSessionId(null);
      setProcessingAction(null);
    }
  };

  const handleMarkPaid = async (sessionId) => {
    if (processingSessionId) return;
    try {
      setProcessingSessionId(sessionId);
      setProcessingAction('pay');
      await sessionService.markPaid(sessionId);
      triggerToast('Marked as paid!');
      fetchInitialData();
    } catch (err) {
      triggerToast('Failed to mark as paid');
    } finally {
      setProcessingSessionId(null);
      setProcessingAction(null);
    }
  };

  const handleReport = (title) => {
    const target = title.split('·')[1]?.trim();
    const context = title.split('·')[0]?.trim();
    document.dispatchEvent(new CustomEvent('openReport', { detail: { target, context } }));
  };

  const copyUpi = (upiId) => {
    if (upiId) {
      navigator.clipboard.writeText(upiId);
      triggerToast('UPI ID copied to clipboard');
    }
  };

  if (isSessionsLoading) {
    return (
      <div id="sessions" className="pg on" style={{ padding: 0, height: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>Loading sessions...</div>
      </div>
    );
  }

  const now = Date.now();
  const soonLimit = now + 48 * 60 * 60 * 1000; // 48 hours

  const filteredSessions = sessionsData.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = s.topic?.toLowerCase().includes(q);
    const participantMatch = s.name?.toLowerCase().includes(q);
    return titleMatch || participantMatch;
  });

  // Filter and sort sessions
  const activeSessions = filteredSessions
    .filter(s => {
      if (s.status === 'SCHEDULED') return true;
      if (s.status === 'COMPLETED') {
        const isSwap = !!s.rawSession.swapGroupId;
        return !isSwap && !s.rawSession.teacherConfirmedPayment;
      }
      return false;
    })
    .sort((a, b) => (a.rawSession.scheduledStart || 0) - (b.rawSession.scheduledStart || 0));

  const upcomingSoon = activeSessions.filter(s => 
    s.rawSession.scheduledStart && 
    s.rawSession.scheduledStart <= soonLimit && 
    s.rawSession.scheduledStart >= now - 3600000 // up to 1 hour ago
  );

  const pastSessions = filteredSessions
    .filter(s => {
      if (s.status === 'CANCELLED') return true;
      if (s.status === 'COMPLETED') {
        const isSwap = !!s.rawSession.swapGroupId;
        return isSwap || s.rawSession.teacherConfirmedPayment;
      }
      return false;
    })
    .sort((a, b) => (b.rawSession.updatedAt || 0) - (a.rawSession.updatedAt || 0));

  const formatSessionFullTime = (start, end) => {
    if (!start) return 'TBD';
    const sD = new Date(start);
    const eD = new Date(end);
    const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const optionsTime = { hour: '2-digit', minute: '2-digit' };
    return `${sD.toLocaleDateString(undefined, optionsDate)} at ${sD.toLocaleTimeString(undefined, optionsTime)} - ${eD.toLocaleTimeString(undefined, optionsTime)}`;
  };

  const renderSessionCard = (s, idx) => {
    const isExpanded = expandedSessionId === s.id;
    const isCompleted = s.status === 'COMPLETED';
    const isCancelled = s.status === 'CANCELLED';
    const req = requestsData.find(r => r.id === s.rawSession.exchangeId);
    const isSwap = !!s.rawSession.swapGroupId || (req && req.rawReq?.type === 'SWAP');

    // Cancellation rule: status is SCHEDULED and neither has confirmed completion
    const canCancel = s.status === 'SCHEDULED' && 
      !s.rawSession.teacherConfirmedCompletion && 
      !s.rawSession.studentConfirmedCompletion;

    let guidanceText = null;
    let guidanceStyle = {};

    if (s.status === 'SCHEDULED') {
      const tConf = s.rawSession.teacherConfirmedCompletion;
      const sConf = s.rawSession.studentConfirmedCompletion;
      if (tConf || sConf) {
        guidanceText = "Waiting for completion confirmation";
        guidanceStyle = { background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' };
      }
    } else if (s.status === 'COMPLETED') {
      if (!isSwap) {
        if (!s.rawSession.studentMarkedPaid) {
          guidanceText = "Payment pending";
          guidanceStyle = { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' };
        } else if (!s.rawSession.teacherConfirmedPayment) {
          guidanceText = "Waiting for payment confirmation";
          guidanceStyle = { background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' };
        } else {
          const reviewExists = s.rawSession.reviews && s.rawSession.reviews.some(r => r.reviewerId === user?.userId);
          if (!reviewExists) {
            guidanceText = "Please leave a review";
            guidanceStyle = { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' };
          }
        }
      } else {
        const reviewExists = s.rawSession.reviews && s.rawSession.reviews.some(r => r.reviewerId === user?.userId);
        if (!reviewExists) {
          guidanceText = "Please leave a review";
          guidanceStyle = { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' };
        }
      }
    }

    return (
      <div 
        key={s.id || idx}
        id={`session-${s.id}`}
        style={{
          background: s.id === activeHighlightId ? '#f0f7ff' : '#ffffff',
          border: s.id === activeHighlightId ? '2px solid #3b82f6' : '1px solid rgba(0, 0, 0, 0.05)',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '12px',
          boxShadow: s.id === activeHighlightId ? '0 10px 30px -5px rgba(59, 130, 246, 0.25)' : '0 10px 30px -5px rgba(0,0,0,.04), 0 4px 6px -2px rgba(0,0,0,.02)',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header (Accordion Toggle) */}
        <div 
          onClick={() => handleToggleExpand(s)}
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          {/* Calendar Block */}
          <div style={{
            background: isCompleted || isCancelled ? '#f3f4f6' : '#eff6ff',
            borderRadius: '10px',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '16px',
            minWidth: '50px',
            height: '52px',
            boxSizing: 'border-box'
          }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: isCompleted || isCancelled ? '#4b5563' : '#1d4ed8', lineHeight: 1 }}>{s.day}</div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: isCompleted || isCancelled ? '#9ca3af' : '#1d4ed8', marginTop: '4px', letterSpacing: '0.5px' }}>{s.month?.toUpperCase()}</div>
          </div>

          {/* Details Preview */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {s.topic}
              {isSwap ? (
                <span style={{ fontSize: '10px', fontWeight: 600, background: '#f3e8ff', color: '#7e22ce', padding: '2px 8px', borderRadius: '12px' }}>
                  Skill Exchange
                </span>
              ) : s.rawSession.requiresPayment ? (
                <span style={{ fontSize: '10px', fontWeight: 600, background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px' }}>
                  Paid Session
                </span>
              ) : (
                <span style={{ fontSize: '10px', fontWeight: 600, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px' }}>
                  Free Session
                </span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {s.role === 'Teaching' ? `Teaching ${s.name}` : `Learning from ${s.name}`} · {s.time}
            </div>
          </div>

          {/* Status Badge & Chevron */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {guidanceText && (
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: '6px',
                ...guidanceStyle
              }}>
                {guidanceText}
              </span>
            )}
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '4px 8px',
              borderRadius: '9999px',
              textTransform: 'capitalize',
              background: s.status === 'SCHEDULED' ? '#ecfdf5' : s.status === 'COMPLETED' ? '#f3f4f6' : '#fef2f2',
              color: s.status === 'SCHEDULED' ? '#059669' : s.status === 'COMPLETED' ? '#4b5563' : '#dc2626'
            }}>
              {s.status.toLowerCase()}
            </span>
            {isExpanded ? <IconChevronUp size={20} color="#9ca3af" /> : <IconChevronDown size={20} color="#9ca3af" />}
          </div>
        </div>

        {/* Collapsible Details Content */}
        {isExpanded && (
          <div style={{ borderTop: '1px solid #f3f4f6', marginTop: '16px', paddingTop: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Participant</div>
                <div style={{ fontSize: '13px', color: '#374151', marginTop: '2px' }}>{s.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Date & Time</div>
                <div style={{ fontSize: '13px', color: '#374151', marginTop: '2px' }}>{formatSessionFullTime(s.rawSession.scheduledStart, s.rawSession.scheduledEnd)}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Mode</div>
                <div style={{ fontSize: '13px', color: '#374151', marginTop: '2px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {s.mode}
                  {s.rawSession.meetingLink && (
                    <a 
                      href={s.rawSession.meetingLink.startsWith('http') ? s.rawSession.meetingLink : `https://${s.rawSession.meetingLink}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ color: '#2563eb', textDecoration: 'underline' }}
                    >
                      Join Meeting Link
                    </a>
                  )}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Topic</div>
                <div style={{ fontSize: '13px', color: '#374151', marginTop: '2px' }}>{s.topic}</div>
              </div>
            </div>

            {/* Notes Section if exists */}
            {s.rawSession.notes && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Notes</div>
                <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '4px', whiteSpace: 'pre-wrap' }}>{s.rawSession.notes}</div>
              </div>
            )}

            {isCancelled && (
              <div style={{ 
                marginBottom: '16px', 
                padding: '12px 16px', 
                background: '#fef2f2', 
                borderLeft: '4px solid #ef4444', 
                borderRadius: '8px' 
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 600, textTransform: 'uppercase' }}>Cancelled By</div>
                    <div style={{ fontSize: '13px', color: '#7f1d1d', marginTop: '2px', fontWeight: 600 }}>
                      {s.rawSession.cancelledBy === user?.userId ? 'You' : (s.rawSession.cancelledBy === 'admin' ? 'Admin' : s.name)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 600, textTransform: 'uppercase' }}>Reason</div>
                    <div style={{ fontSize: '13px', color: '#7f1d1d', marginTop: '2px', fontWeight: 600 }}>
                      {s.rawSession.cancellationReason || 'Other'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Context Actions for Scheduled */}
            {s.status === 'SCHEDULED' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                <button 
                  onClick={() => handleMarkCompletion(s.id)}
                  disabled={!!processingSessionId}
                  style={{ 
                    fontSize: '12px', 
                    padding: '8px 16px', 
                    background: '#1d4ed8', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: processingSessionId ? 'not-allowed' : 'pointer', 
                    fontWeight: 600,
                    opacity: processingSessionId ? 0.6 : 1
                  }}
                >
                  {processingSessionId === s.id && processingAction === 'complete'
                    ? 'Completing...'
                    : s.role === 'Teaching' 
                      ? (s.rawSession.teacherConfirmedCompletion ? 'Completion Marked' : 'Mark Completed')
                      : (s.rawSession.studentConfirmedCompletion ? 'Completion Marked' : 'Mark Completed')}
                </button>
                
                <button 
                  onClick={() => setRescheduleSession(s)}
                  disabled={!!processingSessionId}
                  style={{ 
                    fontSize: '12px', 
                    padding: '8px 16px', 
                    background: '#e5e7eb', 
                    color: '#374151', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: processingSessionId ? 'not-allowed' : 'pointer', 
                    fontWeight: 600,
                    opacity: processingSessionId ? 0.6 : 1 
                  }}
                >
                  Propose Reschedule
                </button>

                <button 
                  onClick={() => handleReport(`${s.topic} · ${s.name}`)}
                  disabled={!!processingSessionId}
                  style={{ 
                    fontSize: '12px', 
                    padding: '8px 16px', 
                    background: '#fef2f2', 
                    color: '#dc2626', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: processingSessionId ? 'not-allowed' : 'pointer', 
                    fontWeight: 600, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    opacity: processingSessionId ? 0.6 : 1 
                  }}
                >
                  <IconFlag size={14} /> Report
                </button>

                {canCancel && (
                  <button 
                    onClick={() => setCancelSessionItem(s)}
                    disabled={!!processingSessionId}
                    style={{ 
                      fontSize: '12px', 
                      padding: '8px 16px', 
                      background: '#ffffff', 
                      color: '#dc2626', 
                      border: '1px solid #fecaca', 
                      borderRadius: '8px', 
                      cursor: processingSessionId ? 'not-allowed' : 'pointer', 
                      fontWeight: 600, 
                      marginLeft: 'auto',
                      opacity: processingSessionId ? 0.6 : 1 
                    }}
                  >
                    Cancel Session
                  </button>
                )}
              </div>
            )}

            {/* Context Actions for Completed */}
            {s.status === 'COMPLETED' && (
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px', marginTop: '8px' }}>
                {/* Non-swap paid session logic */}
                {!isSwap ? (
                  s.role === 'Learning' ? (
                    // We are the student
                    !s.rawSession.studentMarkedPaid ? (
                      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                        {loadingPaymentId === s.id ? (
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>Loading payment info...</div>
                        ) : paymentInfos[s.id] ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Scan QR to Pay Tutor</div>
                            
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${paymentInfos[s.id].upiId}&pn=${encodeURIComponent(s.name)}`)}`} 
                              alt="UPI QR Code" 
                              style={{ width: '150px', height: '150px', border: '1px solid #e5e7eb', padding: '6px', borderRadius: '8px', background: '#fff' }} 
                            />
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e5e7eb', padding: '6px 12px', borderRadius: '6px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 600 }}>UPI ID: {paymentInfos[s.id].upiId}</span>
                              <button onClick={() => copyUpi(paymentInfos[s.id].upiId)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', display: 'flex' }}>
                                <IconCopy size={16} />
                              </button>
                            </div>

                            <button 
                              onClick={() => handleMarkPaid(s.id)}
                              disabled={!!processingSessionId}
                              style={{ 
                                width: '100%', 
                                padding: '10px', 
                                background: '#059669', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: '8px', 
                                fontWeight: 600, 
                                cursor: processingSessionId ? 'not-allowed' : 'pointer', 
                                fontSize: '13px', 
                                marginTop: '4px',
                                opacity: processingSessionId ? 0.6 : 1
                              }}
                            >
                              {processingSessionId === s.id && processingAction === 'pay' ? 'Marking Paid...' : 'I Have Paid'}
                            </button>
                          </div>
                        ) : (
                          <div style={{ fontSize: '13px', color: '#ef4444' }}>Payment details could not be loaded. Please ensure the tutor has a registered UPI ID.</div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
                        <IconCheck size={18} /> Payment Completed
                      </div>
                    )
                  ) : (
                    // We are the teacher
                    s.rawSession.studentMarkedPaid && !s.rawSession.teacherConfirmedPayment ? (
                      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>
                          <IconCheck size={18} /> {s.name} claims payment was made.
                        </div>
                        <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '12px' }}>
                          Did you receive the payment? Confirm only after verifying in your UPI app.
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={async () => {
                              try {
                                setProcessingSessionId(s.id);
                                setProcessingAction('confirmPayment');
                                await sessionService.confirmPayment(s.id);
                                triggerToast('Payment confirmed!');
                                fetchInitialData();
                              } catch (err) {
                                triggerToast(err.message || 'Failed to confirm payment');
                              } finally {
                                setProcessingSessionId(null);
                                setProcessingAction(null);
                              }
                            }}
                            disabled={!!processingSessionId}
                            style={{ flex: 1, padding: '10px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: processingSessionId ? 'not-allowed' : 'pointer', opacity: processingSessionId ? 0.6 : 1 }}
                          >
                            {processingSessionId === s.id && processingAction === 'confirmPayment' ? 'Confirming...' : 'Yes, Received'}
                          </button>
                          <button
                            onClick={() => handleReport(s.topic + ' · ' + s.name)}
                            style={{ flex: 1, padding: '10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            <IconFlag size={14} /> Raise Dispute
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: s.rawSession.teacherConfirmedPayment ? '#059669' : '#b45309', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
                        {s.rawSession.teacherConfirmedPayment ? (
                          <><IconCheck size={18} /> Payment Completed</>
                        ) : s.rawSession.studentMarkedPaid ? (
                          <><IconCheck size={18} /> Payment Completed by Student</>
                        ) : (
                          <>Waiting for student to mark session as paid</>
                        )}
                      </div>
                    )
                  )
                ) : null}

                {/* Rating input (always unlocked for Free/Swap; for Paid unlocked only once paid is true, or if teacher) */}
                {(isSwap || s.rawSession.studentMarkedPaid || s.role === 'Teaching') ? (
                  <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px', border: '1px solid #f3f4f6' }}>
                    
                    {s.rawSession.hasReviewed ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '12px', fontWeight: 600 }}>
                        <IconCheck size={16} /> Review Submitted! Thank you.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>Reviews are unlocked for this session.</span>
                        <button 
                          onClick={() => {
                            setSelectedSessionForReview(s);
                            setReviewModalOpen(true);
                          }}
                          style={{ 
                            padding: '6px 14px', 
                            background: '#1d4ed8', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '8px', 
                            fontSize: '12px', 
                            fontWeight: 700, 
                            cursor: 'pointer' 
                          }}
                        >
                          Submit Review
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>
                    Review section will unlock once payment has been completed.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="sessions" className="pg on" style={{ padding: '32px 40px', background: 'linear-gradient(180deg, #fafafa 0%, #f8f9ff 100%)', minHeight: '100vh', boxSizing: 'border-box', overflowY: 'auto' }}>
      <ReportSessionModal />

      {/* Coming up soon Section */}
      <div style={{ marginBottom: '28px' }}>
        <div 
          style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setIsSoonOpen(!isSoonOpen)}
        >
          <span>{isSoonOpen ? '▼' : '▶'}</span> Coming up soon ({upcomingSoon.length})
        </div>
        
        {isSoonOpen && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {upcomingSoon.map((s, idx) => renderSessionCard(s, idx))}
            
            {upcomingSoon.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 30px -5px rgba(0,0,0,.04)' }}>
                <IconCalendarMonth size={28} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>No upcoming sessions</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', maxWidth: '280px' }}>No sessions scheduled for the next 48 hours. Ready to exchange skills?</div>
                <button onClick={() => navigate('/app/marketplace')} style={{ padding: '8px 16px', borderRadius: '10px', background: '#2563eb', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Browse Marketplace</button>
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
          <span>{isAllOpen ? '▼' : '▶'}</span> All Scheduled Sessions ({activeSessions.length})
        </div>
        
        {isAllOpen && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activeSessions.map((s, idx) => renderSessionCard(s, idx))}
            
            {activeSessions.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 30px -5px rgba(0,0,0,.04)' }}>
                <IconCalendarMonth size={28} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>No other active sessions</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', maxWidth: '280px' }}>Your active skill exchanges will appear here.</div>
                <button onClick={() => navigate('/app/marketplace')} style={{ padding: '8px 16px', borderRadius: '10px', background: '#2563eb', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Find Swaps</button>
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
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {pastSessions.map((s, idx) => renderSessionCard(s, idx))}
            
            {pastSessions.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 30px -5px rgba(0,0,0,.04)' }}>
                <IconCalendarMonth size={28} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>No past sessions</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', maxWidth: '280px' }}>History of your completed and cancelled sessions will be displayed here.</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleSession && (
        <ModalWrapper isOpen={true} onClose={() => setRescheduleSession(null)} maxWidth="400px" zIndex={1000}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
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
                disabled={!!processingSessionId}
                style={{ flex: 1, padding: '10px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', cursor: processingSessionId ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '13px', opacity: processingSessionId ? 0.6 : 1 }}
              >
                Cancel
              </button>
              <button 
                onClick={handleRescheduleSubmit}
                disabled={!!processingSessionId}
                style={{ flex: 1, padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: processingSessionId ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '13px', opacity: processingSessionId ? 0.6 : 1 }}
              >
                {processingSessionId === rescheduleSession?.id && processingAction === 'reschedule' ? 'Proposing...' : 'Propose'}
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Cancellation Modal */}
      {cancelSessionItem && (
        <ModalWrapper isOpen={true} onClose={() => setCancelSessionItem(null)} maxWidth="400px" zIndex={1000}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>Cancel Session</h3>
              <button onClick={() => setCancelSessionItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}><IconX size={20} /></button>
            </div>
            
            <p style={{ fontSize: '13px', color: '#4b5563', margin: '0 0 16px' }}>
              Please select the reason for cancelling this session. Both participants will be notified.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {['Scheduling conflict', 'No longer interested', 'Emergency', 'Other'].map(reason => (
                <label key={reason} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
                  <input 
                    type="radio" 
                    name="cancelReason" 
                    value={reason} 
                    checked={cancelReason === reason} 
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  {reason}
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setCancelSessionItem(null)}
                disabled={!!processingSessionId}
                style={{ flex: 1, padding: '10px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', cursor: processingSessionId ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '13px', opacity: processingSessionId ? 0.6 : 1 }}
              >
                Go Back
              </button>
              <button 
                onClick={handleCancelSubmit}
                disabled={!!processingSessionId}
                style={{ flex: 1, padding: '10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: processingSessionId ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '13px', opacity: processingSessionId ? 0.6 : 1 }}
              >
                {processingSessionId === cancelSessionItem?.id && processingAction === 'cancel' ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      <ReviewModal 
        isOpen={reviewModalOpen} 
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedSessionForReview(null);
          fetchInitialData();
        }}
        session={selectedSessionForReview}
        onSubmit={() => {
          setReviewModalOpen(false);
          setSelectedSessionForReview(null);
          fetchInitialData();
        }}
      />
    </div>
  );
};

export default Sessions;