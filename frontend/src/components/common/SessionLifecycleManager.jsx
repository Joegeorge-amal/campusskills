import React, { useEffect, useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { sessionService } from '../../services/sessionService';
import { chatRequestService } from '../../services/chatRequestService';
import { exchangeService } from '../../services/exchangeService';
import GlobalNotificationPopup from './GlobalNotificationPopup';
import ReviewModal from '../modals/ReviewModal';
import ConfirmModal from '../modals/ConfirmModal';
import PaymentModal from '../modals/PaymentModal';

const SessionLifecycleManager = () => {
  const { user } = useAuth();
  const { 
    sessionEvent, 
    sessionsData, 
    requestsData,
    fetchInitialData
  } = useAppData();
  
  const [activePopup, setActivePopup] = useState(null);
  const [reviewModalData, setReviewModalData] = useState(null);
  const [dismissedRequests, setDismissedRequests] = useState([]);
  const [snoozedSessions, setSnoozedSessions] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('snoozedSessions') || '{}');
      const now = Date.now();
      const cleaned = {};
      Object.keys(stored).forEach(key => {
        if (stored[key] > now) {
          cleaned[key] = stored[key];
        }
      });
      return cleaned;
    } catch {
      return {};
    }
  });

  const handleSnooze = (sessionId) => {
    const snoozeUntil = Date.now() + 10 * 60 * 1000; // 10 minutes
    const updated = { ...snoozedSessions, [sessionId]: snoozeUntil };
    setSnoozedSessions(updated);
    localStorage.setItem('snoozedSessions', JSON.stringify(updated));
    setActivePopup(null);
  };

  // Monitor for pending states on load or data refresh (handles reloads where WS events are lost)
  useEffect(() => {
    if (!sessionsData || !user?.userId) return;

    // Check for COMPLETION_REQUESTED
    const pendingCompletion = sessionsData.find(s => {
      if (s.status !== 'SCHEDULED') return false;
      const isTeacher = s.rawSession.teacherId === user.userId;
      const isStudent = s.rawSession.studentId === user.userId;
      const tConf = s.rawSession.teacherConfirmedCompletion;
      const sConf = s.rawSession.studentConfirmedCompletion;
      
      // If the OTHER person confirmed but WE haven't
      if (isTeacher && sConf && !tConf) return true;
      if (isStudent && tConf && !sConf) return true;
      return false;
    });

    if (pendingCompletion) {
      setActivePopup({
        type: 'COMPLETION_REQUESTED',
        session: { id: pendingCompletion.id, topic: pendingCompletion.topic }
      });
      return;
    }

    // Check for PAYMENT_NEEDED (Student) or PAYMENT_SUBMITTED_TEACHER (Teacher)
    const pendingPayment = sessionsData.find(s => {
      const req = requestsData.find(r => r.id === s.rawSession.exchangeId);
      const isSwap = !!s.rawSession.swapGroupId || (req && req.rawReq?.type === 'SWAP');
      const reqPayment = s.rawSession.requiresPayment != null ? s.rawSession.requiresPayment : !isSwap;
      
      if (s.status !== 'COMPLETED' || isSwap) return false;
      if (reqPayment === false) return false;
      const isTeacher = s.rawSession.teacherId === user.userId;
      const isStudent = s.rawSession.studentId === user.userId;
      
      if (isStudent && !s.rawSession.studentMarkedPaid) return true; // Student needs to pay
      if (isTeacher && s.rawSession.studentMarkedPaid && !s.rawSession.teacherConfirmedPayment) return true; // Teacher needs to verify
      return false;
    });

    if (pendingPayment) {
      const isTeacher = pendingPayment.rawSession.teacherId === user.userId;
      if (isTeacher) {
        setActivePopup({
          type: 'PAYMENT_SUBMITTED_TEACHER',
          session: { id: pendingPayment.id, topic: pendingPayment.topic, studentName: pendingPayment.rawSession.studentName }
        });
      } else {
        setActivePopup({
          type: 'PAYMENT_NEEDED',
          session: { id: pendingPayment.id, topic: pendingPayment.topic }
        });
      }
      return;
    }

  }, [sessionsData, user]);

  // Monitor for 'Session End Reached' locally since backend doesn't broadcast it currently
  useEffect(() => {
    if (!sessionsData || !user?.userId) return;

    const interval = setInterval(() => {
      const now = Date.now();
      
      // Find a session that just ended but hasn't been marked completed by us
      const recentlyEnded = sessionsData.find(s => {
        if (s.status !== 'SCHEDULED') return false;
        
        const isTeacher = s.rawSession.teacherId === user.userId;
        const weConfirmed = isTeacher ? s.rawSession.teacherConfirmedCompletion : s.rawSession.studentConfirmedCompletion;
        
        if (weConfirmed) return false;

        const end = s.rawSession.scheduledEnd;

        // Skip if this session is currently snoozed
        const snoozeUntil = snoozedSessions[s.id];
        if (snoozeUntil && now < snoozeUntil) return false;

        // Prompt if it ended in the last hour, and is past the end time
        return end && now >= end && (now - end) < 3600000;
      });

      if (recentlyEnded && !activePopup) {
        setActivePopup({
          type: 'END_REACHED',
          session: recentlyEnded
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [sessionsData, user, activePopup, snoozedSessions]);

  // React to WebSockets via sessionEvent
  useEffect(() => {
    if (!sessionEvent || !user?.userId) return;
    const raw = sessionEvent.session;
    if (!raw) return;

    const sessionId = raw._id || raw.id;
    if (!sessionId) return;

    // We use the raw session to construct the popup state
    const isTeacher = raw.teacherId === user.userId;
    const isStudent = raw.studentId === user.userId;
    if (!isTeacher && !isStudent) return; // Not our session

    const topic = raw.topic || 'Skill Session';
    const myRole = isTeacher ? 'Teaching' : 'Learning';

    if (sessionEvent.type === 'COMPLETION_REQUESTED') {
      const requesterIsTeacher = raw.teacherConfirmedCompletion;
      const weConfirmed = isTeacher ? raw.teacherConfirmedCompletion : raw.studentConfirmedCompletion;
      
      if (!weConfirmed && ((isStudent && requesterIsTeacher) || (isTeacher && !requesterIsTeacher))) {
        setActivePopup({
          type: 'COMPLETION_REQUESTED',
          session: { id: sessionId, topic }
        });
      }
    } else if (sessionEvent.type === 'SESSION_BOTH_CONFIRMED') {
      const req = requestsData.find(r => r.id === raw.exchangeId);
      const isSwap = !!raw.swapGroupId || (req && req.rawReq?.type === 'SWAP');
      const requiresPayment = raw.requiresPayment != null ? raw.requiresPayment : !isSwap;

      if (requiresPayment) {
        if (isStudent) {
          setActivePopup({
            type: 'PAYMENT_NEEDED',
            session: { id: sessionId, topic }
          });
        } else if (isTeacher) {
          setActivePopup({
            type: 'PAYMENT_WAITING',
            session: { id: sessionId, topic }
          });
        }
      } else {
        // Free or Swap session completed, jump straight to review
        setReviewModalData({
          id: sessionId,
          rawSession: raw,
          topic,
          name: isTeacher ? (raw.studentName || 'Student') : (raw.teacherName || 'Teacher'),
          role: myRole,
          status: 'COMPLETED'
        });
      }
    } else if (sessionEvent.type === 'PAYMENT_SUBMITTED') {
      if (isTeacher) {
        setActivePopup({
          type: 'PAYMENT_SUBMITTED_TEACHER',
          session: { id: sessionId, topic, studentName: raw.studentName }
        });
      } else {
        // As a student, after we submit payment, we should go straight to review
        // But since handleMarkPaid already does this, we don't strictly need to do anything here.
        // We'll clear the active popup just in case.
        setActivePopup(null);
      }
    } else if (sessionEvent.type === 'PAYMENT_CONFIRMED') {
      setActivePopup(null);
    }

  }, [sessionEvent, user]);

  const handleMarkCompletion = async (sessionId) => {
    setActivePopup(null);
    try {
      await sessionService.markCompletion(sessionId);
      window.dispatchEvent(new CustomEvent('markNotificationAsRead', { 
        detail: { sourceType: 'SESSION', sourceId: sessionId } 
      }));
      fetchInitialData();
    } catch (err) {
      console.error('Failed to mark completion', err);
    }
  };

  const handleMarkPaid = async (sessionId) => {
    // Find the session locally to populate the review modal
    const sessionToReview = sessionsData?.find(s => s.id === sessionId);
    setActivePopup(null);
    try {
      await sessionService.markPaid(sessionId);
      window.dispatchEvent(new CustomEvent('markNotificationAsRead', { 
        detail: { sourceType: 'SESSION', sourceId: sessionId } 
      }));
      fetchInitialData();
      
      // Immediately jump to review modal
      if (sessionToReview) {
        setReviewModalData({
          id: sessionId,
          rawSession: sessionToReview.rawSession,
          topic: sessionToReview.topic,
          name: sessionToReview.rawSession.teacherName || 'Teacher',
          role: 'Learning',
          status: 'COMPLETED'
        });
      }
    } catch (err) {
      console.error('Failed to mark paid', err);
    }
  };

  const handleConfirmPayment = async (sessionId) => {
    // Find the session locally to populate the review modal
    const sessionToReview = sessionsData?.find(s => s.id === sessionId);
    setActivePopup(null);
    try {
      await sessionService.confirmPayment(sessionId);
      window.dispatchEvent(new CustomEvent('markNotificationAsRead', { 
        detail: { sourceType: 'SESSION', sourceId: sessionId } 
      }));
      fetchInitialData();
      
      // Immediately jump to review modal
      if (sessionToReview) {
        setReviewModalData({
          id: sessionId,
          rawSession: sessionToReview.rawSession,
          topic: sessionToReview.topic,
          name: sessionToReview.rawSession.studentName || 'Student',
          role: 'Teaching',
          status: 'COMPLETED'
        });
      }
    } catch (err) {
      console.error('Failed to confirm payment', err);
    }
  };

  const handleAcceptRequest = async (req) => {
    try {
      if (req.type === 'Chat request' || (req.type && req.type.toLowerCase().includes('chat'))) {
        await chatRequestService.acceptRequest(req.id);
      } else if (req.type === 'Skill swap request' || (req.type && req.type.toLowerCase().includes('swap'))) {
        await exchangeService.acceptSwap(req.id);
      } else {
        await exchangeService.acceptRequest(req.id);
      }
      setDismissedRequests(prev => [...prev, req.id]);
      window.dispatchEvent(new CustomEvent('markNotificationAsRead', { 
        detail: { sourceType: req.type === 'Chat request' || (req.type && req.type.toLowerCase().includes('chat')) ? 'CHAT_REQUEST' : 'EXCHANGE', sourceId: req.id } 
      }));
      fetchInitialData();
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const handleDeclineRequest = async (req) => {
    try {
      if (req.type === 'Chat request' || (req.type && req.type.toLowerCase().includes('chat'))) {
        await chatRequestService.rejectRequest(req.id);
      } else if (req.type === 'Skill swap request' || (req.type && req.type.toLowerCase().includes('swap'))) {
        await exchangeService.rejectExchange(req.id);
      } else {
        await exchangeService.rejectRequest(req.id);
      }
      setDismissedRequests(prev => [...prev, req.id]);
      window.dispatchEvent(new CustomEvent('markNotificationAsRead', { 
        detail: { sourceType: req.type === 'Chat request' || (req.type && req.type.toLowerCase().includes('chat')) ? 'CHAT_REQUEST' : 'EXCHANGE', sourceId: req.id } 
      }));
      fetchInitialData();
    } catch (error) {
      console.error('Failed to decline request:', error);
    }
  };

  const handleDismissRequestPopup = (reqId) => {
    setDismissedRequests(prev => [...prev, reqId]);
  };

  const pendingRequests = requestsData?.filter(r => r.direction === 'incoming' && r.status === 'pending' && !dismissedRequests.includes(r.id)) || [];
  const activeRequest = pendingRequests.length > 0 ? pendingRequests[0] : null;

  if (!activePopup && !reviewModalData && !activeRequest) return null;

  return (
    <>
      {!activePopup && !reviewModalData && activeRequest && (() => {
        let reqType = 'Session Request';
        let isChat = false;
        if (activeRequest.type?.toLowerCase().includes('swap')) {
          reqType = 'Swap Request';
        } else if (activeRequest.type?.toLowerCase().includes('chat')) {
          reqType = 'Chat Request';
          isChat = true;
        } else if (activeRequest.otherUserExtras?.listingType === 'TEACH' || activeRequest.otherUserExtras?.listingType === 'TEACH_SWAP') {
          reqType = 'Teach Request';
        } else if (activeRequest.otherUserExtras?.listingType === 'LEARN' || activeRequest.otherUserExtras?.listingType === 'LEARN_SWAP') {
          reqType = 'Learn Request';
        }
        
        const listingTitle = activeRequest.otherUserExtras?.listingTitle || 'Skill Session';
        const subtitleText = isChat ? 'Wants to chat with you' : `Wants to book ${listingTitle}`;
        const remainingCount = pendingRequests.length - 1;

        return (
          <GlobalNotificationPopup
            title={activeRequest.name || 'Unknown User'}
            subtitle={subtitleText}
            badge={`NEW ${reqType.toUpperCase()} ${remainingCount > 0 ? `(+${remainingCount} more)` : ''}`}
            badgeColor="#1d4ed8"
            avatarInitials={activeRequest.init}
            avatarBg={activeRequest.bg}
            avatarColor={activeRequest.col}
            primaryButtonText="Accept"
            secondaryButtonText="Decline"
            onPrimaryClick={() => handleAcceptRequest(activeRequest)}
            onSecondaryClick={() => handleDeclineRequest(activeRequest)}
            onClose={() => handleDismissRequestPopup(activeRequest.id)}
          />
        );
      })()}

      {activePopup && activePopup.type === 'END_REACHED' && (
        <ConfirmModal
          isOpen={true}
          title={`Has ${activePopup.session.topic || 'the session'} been completed?`}
          message="The scheduled time has ended. Did you complete the session successfully?"
          confirmText="Yes, Completed"
          cancelText="Snooze"
          onConfirm={() => handleMarkCompletion(activePopup.session.id)}
          onClose={() => handleSnooze(activePopup.session.id)}
        />
      )}

      {activePopup && activePopup.type === 'COMPLETION_REQUESTED' && (
        <ConfirmModal
          isOpen={true}
          title="Session marked as completed"
          message={`The other participant marked "${activePopup.session.topic}" as completed. Please confirm.`}
          confirmText="Confirm Completion"
          cancelText="Dispute"
          onConfirm={() => handleMarkCompletion(activePopup.session.id)}
          onClose={() => setActivePopup(null)}
        />
      )}

      {activePopup && activePopup.type === 'PAYMENT_NEEDED' && (
        <PaymentModal
          isOpen={true}
          session={activePopup.session}
          onClose={() => setActivePopup(null)}
          onMarkPaid={handleMarkPaid}
        />
      )}

      {activePopup && activePopup.type === 'PAYMENT_WAITING' && (
        <GlobalNotificationPopup
          title="Waiting for payment"
          subtitle={`Session "${activePopup.session.topic}" is complete. Waiting for the student to submit payment.`}
          badge="PAYMENT PENDING"
          badgeColor="#4f46e5"
          secondaryButtonText="Dismiss"
          onSecondaryClick={() => setActivePopup(null)}
          onClose={() => setActivePopup(null)}
          autoCloseMs={6000}
        />
      )}

      {activePopup && activePopup.type === 'PAYMENT_SUBMITTED_TEACHER' && (
        <ConfirmModal
          isOpen={true}
          title="Verify Payment"
          message={`${activePopup.session.studentName || 'Student'} claims payment was sent for "${activePopup.session.topic}". Did you receive it?`}
          confirmText="Yes, Received"
          cancelText="Not Yet"
          onConfirm={() => handleConfirmPayment(activePopup.session.id)}
          onClose={() => setActivePopup(null)}
        />
      )}

      {/* Student submitted payment popup removed as student now reviews instead */}

      {reviewModalData && (
        <ReviewModal
          isOpen={true}
          onClose={() => setReviewModalData(null)}
          session={reviewModalData}
          onSubmit={() => {
            setReviewModalData(null);
            fetchInitialData();
          }}
        />
      )}
    </>
  );
};

export default SessionLifecycleManager;
