import React, { useEffect, useState, useRef } from 'react';
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

  // Tracks session IDs for which the review popup has been shown this page session.
  // ANY code path that opens the review modal must add the ID here first.
  // This prevents the polling fallback from re-opening an already-shown review.
  const shownReviewIds = useRef(new Set());

  const [snoozedSessions, setSnoozedSessions] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('snoozedSessions') || '{}');
      const now = Date.now();
      const cleaned = {};
      Object.keys(stored).forEach(key => {
        if (stored[key] > now) cleaned[key] = stored[key];
      });
      return cleaned;
    } catch {
      return {};
    }
  });

  // Helper: open the review modal for a session, always marking it as shown first
  const openReviewModal = (sessionObj, myRole) => {
    const id = sessionObj.id || sessionObj._id;
    shownReviewIds.current.add(id);
    const isTeacher = sessionObj.rawSession
      ? sessionObj.rawSession.teacherId === user?.userId
      : sessionObj.teacherId === user?.userId;
    setReviewModalData({
      id,
      rawSession: sessionObj.rawSession || sessionObj,
      topic: sessionObj.topic || sessionObj.topic || 'Skill Session',
      name: myRole === 'Teaching'
        ? (sessionObj.rawSession?.studentName || sessionObj.studentName || 'Student')
        : (sessionObj.rawSession?.teacherName || sessionObj.teacherName || 'Teacher'),
      role: myRole,
      status: 'COMPLETED'
    });
  };

  const handleSnooze = (sessionId) => {
    const snoozeUntil = Date.now() + 10 * 60 * 1000;
    const updated = { ...snoozedSessions, [sessionId]: snoozeUntil };
    setSnoozedSessions(updated);
    localStorage.setItem('snoozedSessions', JSON.stringify(updated));
    setActivePopup(null);
  };

  // ─── POLLING FALLBACK ────────────────────────────────────────────────────────
  // Runs on every sessionsData refresh. Catches states where WS events were missed
  // (e.g. page reload, tab was in background).
  useEffect(() => {
    if (!sessionsData || !user?.userId) return;

    // 1. Completion pending: the OTHER person confirmed but WE haven't yet
    const pendingCompletion = sessionsData.find(s => {
      if (s.status !== 'SCHEDULED') return false;
      const isTeacher = s.rawSession.teacherId === user.userId;
      const isStudent = s.rawSession.studentId === user.userId;
      const tConf = s.rawSession.teacherConfirmedCompletion;
      const sConf = s.rawSession.studentConfirmedCompletion;
      if (isTeacher && sConf && !tConf) return true;
      if (isStudent && tConf && !sConf) return true;
      return false;
    });

    if (pendingCompletion) {
      // Don't overwrite an existing popup to avoid flicker
      if (!activePopup || activePopup.type !== 'COMPLETION_REQUESTED') {
        setActivePopup({
          type: 'COMPLETION_REQUESTED',
          session: { id: pendingCompletion.id, topic: pendingCompletion.topic }
        });
      }
      return;
    }

    // 2. Payment pending for paid sessions
    const pendingPayment = sessionsData.find(s => {
      const req = requestsData.find(r => r.id === s.rawSession.exchangeId);
      const isSwap = !!s.rawSession.swapGroupId || (req && req.rawReq?.type === 'SWAP');
      const reqPayment = s.rawSession.requiresPayment != null ? s.rawSession.requiresPayment : !isSwap;

      if (s.status !== 'COMPLETED') return false;
      if (!reqPayment) return false; // free/swap — no payment needed

      const isTeacher = s.rawSession.teacherId === user.userId;
      const isStudent = s.rawSession.studentId === user.userId;
      if (isStudent && !s.rawSession.studentMarkedPaid) return true;
      if (isTeacher && s.rawSession.studentMarkedPaid && !s.rawSession.teacherConfirmedPayment) return true;
      return false;
    });

    if (pendingPayment) {
      const isTeacher = pendingPayment.rawSession.teacherId === user.userId;
      const newType = isTeacher ? 'PAYMENT_SUBMITTED_TEACHER' : 'PAYMENT_NEEDED';
      if (!activePopup || activePopup.type !== newType) {
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
      }
      return;
    }

    // 3. Review pending — show once per session per page load
    if (!reviewModalData) {
      const pendingReview = sessionsData.find(s => {
        if (s.status !== 'COMPLETED') return false;
        if (shownReviewIds.current.has(s.id)) return false;

        const req = requestsData.find(r => r.id === s.rawSession.exchangeId);
        const isSwap = !!s.rawSession.swapGroupId || (req && req.rawReq?.type === 'SWAP');
        const reqPayment = s.rawSession.requiresPayment != null ? s.rawSession.requiresPayment : !isSwap;

        const paymentDone = !reqPayment || (s.rawSession.studentMarkedPaid && s.rawSession.teacherConfirmedPayment);
        if (!paymentDone) return false;

        const hasReviewed = s.rawSession.hasReviewed ||
          (s.rawSession.reviews && s.rawSession.reviews.some(r => r.reviewerId === user.userId));
        return !hasReviewed;
      });

      if (pendingReview) {
        const isTeacher = pendingReview.rawSession.teacherId === user.userId;
        openReviewModal(pendingReview, isTeacher ? 'Teaching' : 'Learning');
      }
    }

  }, [sessionsData, requestsData, user]); // NOTE: no activePopup or reviewModalData here — handled by shownReviewIds ref

  // ─── TIME-BASED END REACHED ──────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionsData || !user?.userId) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const recentlyEnded = sessionsData.find(s => {
        if (s.status !== 'SCHEDULED') return false;
        const isTeacher = s.rawSession.teacherId === user.userId;
        const weConfirmed = isTeacher ? s.rawSession.teacherConfirmedCompletion : s.rawSession.studentConfirmedCompletion;
        if (weConfirmed) return false;
        const end = s.rawSession.scheduledEnd;
        const snoozeUntil = snoozedSessions[s.id];
        if (snoozeUntil && now < snoozeUntil) return false;
        return end && now >= end && (now - end) < 3600000;
      });

      if (recentlyEnded && !activePopup) {
        setActivePopup({ type: 'END_REACHED', session: recentlyEnded });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [sessionsData, user, activePopup, snoozedSessions]);

  // ─── WEBSOCKET EVENTS ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionEvent || !user?.userId) return;
    const raw = sessionEvent.session;
    if (!raw) return;

    const sessionId = raw._id || raw.id;
    if (!sessionId) return;

    const isTeacher = raw.teacherId === user.userId;
    const isStudent = raw.studentId === user.userId;
    if (!isTeacher && !isStudent) return;

    const topic = raw.topic || 'Skill Session';
    const myRole = isTeacher ? 'Teaching' : 'Learning';

    if (sessionEvent.type === 'COMPLETION_REQUESTED') {
      // Show popup only to the person who hasn't confirmed yet
      const weConfirmed = isTeacher ? raw.teacherConfirmedCompletion : raw.studentConfirmedCompletion;
      const requesterIsTeacher = raw.teacherConfirmedCompletion;
      const shouldShow = !weConfirmed && (
        (isStudent && requesterIsTeacher) || (isTeacher && !requesterIsTeacher)
      );
      if (shouldShow) {
        setActivePopup({ type: 'COMPLETION_REQUESTED', session: { id: sessionId, topic } });
      }

    } else if (sessionEvent.type === 'SESSION_BOTH_CONFIRMED') {
      const req = requestsData.find(r => r.id === raw.exchangeId);
      const isSwap = !!raw.swapGroupId || (req && req.rawReq?.type === 'SWAP');
      const requiresPayment = raw.requiresPayment != null ? raw.requiresPayment : !isSwap;

      setActivePopup(null); // clear any existing popup first

      if (requiresPayment) {
        if (isStudent) {
          setActivePopup({ type: 'PAYMENT_NEEDED', session: { id: sessionId, topic } });
        } else if (isTeacher) {
          setActivePopup({ type: 'PAYMENT_WAITING', session: { id: sessionId, topic } });
        }
      } else {
        // Free or Swap — go straight to review
        // Mark as shown so polling fallback won't re-open it
        shownReviewIds.current.add(sessionId);
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
        setActivePopup(null); // student already sees review via handleMarkPaid
      }

    } else if (sessionEvent.type === 'PAYMENT_CONFIRMED') {
      // Teacher confirmed payment → both can now review
      // Mark as shown here so polling doesn't duplicate
      shownReviewIds.current.add(sessionId);
      setActivePopup(null);
      // Review is opened by handleConfirmPayment for teacher, and
      // fetchInitialData will populate polling for student with the right hasReviewed=false state.
      // But to be safe: open for student here too since they get this event
      if (isStudent) {
        const localSession = sessionsData?.find(s => s.id === sessionId);
        if (localSession) {
          const alreadyReviewed = localSession.rawSession?.hasReviewed ||
            (localSession.rawSession?.reviews && localSession.rawSession.reviews.some(r => r.reviewerId === user.userId));
          if (!alreadyReviewed) {
            setReviewModalData({
              id: sessionId,
              rawSession: localSession.rawSession,
              topic: localSession.topic,
              name: localSession.rawSession.teacherName || 'Teacher',
              role: 'Learning',
              status: 'COMPLETED'
            });
          }
        }
      }
    }

  }, [sessionEvent, user]);

  // ─── ACTION HANDLERS ─────────────────────────────────────────────────────────

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
    const sessionToReview = sessionsData?.find(s => s.id === sessionId);
    setActivePopup(null);
    try {
      await sessionService.markPaid(sessionId);
      window.dispatchEvent(new CustomEvent('markNotificationAsRead', {
        detail: { sourceType: 'SESSION', sourceId: sessionId }
      }));
      fetchInitialData();

      // Student goes straight to review after paying
      if (sessionToReview) {
        shownReviewIds.current.add(sessionId); // prevent polling from re-opening
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
    const sessionToReview = sessionsData?.find(s => s.id === sessionId);
    setActivePopup(null);
    try {
      await sessionService.confirmPayment(sessionId);
      window.dispatchEvent(new CustomEvent('markNotificationAsRead', {
        detail: { sourceType: 'SESSION', sourceId: sessionId }
      }));
      fetchInitialData();

      // Teacher goes straight to review after confirming
      if (sessionToReview) {
        shownReviewIds.current.add(sessionId); // prevent polling from re-opening
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
        detail: { sourceType: req.type?.toLowerCase().includes('chat') ? 'CHAT_REQUEST' : 'EXCHANGE', sourceId: req.id }
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
        detail: { sourceType: req.type?.toLowerCase().includes('chat') ? 'CHAT_REQUEST' : 'EXCHANGE', sourceId: req.id }
      }));
      fetchInitialData();
    } catch (error) {
      console.error('Failed to decline request:', error);
    }
  };

  const handleDismissRequestPopup = (reqId) => {
    setDismissedRequests(prev => [...prev, reqId]);
  };

  const pendingRequests = requestsData?.filter(r =>
    r.direction === 'incoming' && r.status === 'pending' && !dismissedRequests.includes(r.id)
  ) || [];
  const activeRequest = pendingRequests.length > 0 ? pendingRequests[0] : null;

  if (!activePopup && !reviewModalData && !activeRequest) return null;

  return (
    <>
      {/* Incoming session/swap/chat request popup — lowest priority, only when nothing else showing */}
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
            badge={`NEW ${reqType.toUpperCase()}${remainingCount > 0 ? ` (+${remainingCount} more)` : ''}`}
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

      {/* Scheduled end reached — ask user to confirm completion */}
      {activePopup && activePopup.type === 'END_REACHED' && (
        <ConfirmModal
          isOpen={true}
          title={`Has ${activePopup.session.topic || 'the session'} been completed?`}
          message="The scheduled time has ended. Did you complete the session successfully?"
          confirmText="Yes, Completed"
          cancelText="Snooze (10 min)"
          onConfirm={() => handleMarkCompletion(activePopup.session.id)}
          onClose={() => handleSnooze(activePopup.session.id)}
        />
      )}

      {/* Other person already marked — asking us to confirm */}
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

      {/* Student: pay the teacher */}
      {activePopup && activePopup.type === 'PAYMENT_NEEDED' && (
        <PaymentModal
          isOpen={true}
          session={activePopup.session}
          onClose={() => setActivePopup(null)}
          onMarkPaid={handleMarkPaid}
        />
      )}

      {/* Teacher: waiting for student payment */}
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

      {/* Teacher: student claims payment was made */}
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

      {/* Review modal — shown exactly once per session */}
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
