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

  // Ref tracks session IDs whose review popup was already opened this page session.
  // Every code path that opens the review modal MUST add the ID here first.
  // This is the single guard against duplicate review popups.
  const shownReviewIds = useRef(new Set());
  // Ref tracks session IDs for which PAYMENT_WAITING was already shown to avoid repeated info banners.
  const shownPaymentWaitingIds = useRef(new Set());

  const [snoozedSessions, setSnoozedSessions] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('snoozedSessions') || '{}');
      const now = Date.now();
      const cleaned = {};
      Object.keys(stored).forEach(key => {
        if (stored[key] > now) cleaned[key] = stored[key];
      });
      return cleaned;
    } catch { return {}; }
  });

  const handleSnooze = (sessionId) => {
    const snoozeUntil = Date.now() + 10 * 60 * 1000;
    const updated = { ...snoozedSessions, [sessionId]: snoozeUntil };
    setSnoozedSessions(updated);
    localStorage.setItem('snoozedSessions', JSON.stringify(updated));
    setActivePopup(null);
  };

  // ─── Helper: open review modal (always marks shownReviewIds first) ────────────
  const openReviewModal = (id, rawSession, topic, name, role) => {
    if (shownReviewIds.current.has(id)) return; // already shown, skip
    shownReviewIds.current.add(id);
    setReviewModalData({ id, rawSession, topic, name, role, status: 'COMPLETED' });
  };

  // ─── Helper: detect if a session is a swap ────────────────────────────────────
  const detectIsSwap = (rawSession) => {
    if (rawSession.swapGroupId) return true;
    const req = requestsData.find(r => r.id === rawSession.exchangeId);
    return req && req.rawReq?.type === 'SWAP';
  };

  // ─── Helper: detect if session requires payment ───────────────────────────────
  const detectRequiresPayment = (rawSession) => {
    if (rawSession.requiresPayment != null) return rawSession.requiresPayment;
    // Fallback for old sessions without the field:
    // if payment was auto-settled (free), both flags will be true
    if (rawSession.studentMarkedPaid && rawSession.teacherConfirmedPayment) return false;
    // if it's a swap, no payment
    if (detectIsSwap(rawSession)) return false;
    // Otherwise assume paid (conservative)
    return true;
  };

  // ─── POLLING FALLBACK ────────────────────────────────────────────────────────
  // Runs on every sessionsData/requestsData refresh.
  // This is the reliable fallback for missed WS events and page reloads.
  useEffect(() => {
    if (!sessionsData || !user?.userId) return;

    // 1. COMPLETION_REQUESTED — the other person confirmed, WE haven't yet
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
      if (!activePopup || activePopup.type !== 'COMPLETION_REQUESTED' || activePopup.session?.id !== pendingCompletion.id) {
        setActivePopup({ type: 'COMPLETION_REQUESTED', session: { id: pendingCompletion.id, topic: pendingCompletion.topic } });
      }
      return;
    }

    // 2. PAYMENT states — only for sessions that require payment
    const pendingPayment = sessionsData.find(s => {
      if (s.status !== 'COMPLETED') return false;
      const requiresPayment = detectRequiresPayment(s.rawSession);
      if (!requiresPayment) return false;
      const isTeacher = s.rawSession.teacherId === user.userId;
      const isStudent = s.rawSession.studentId === user.userId;
      if (isStudent && !s.rawSession.studentMarkedPaid) return true;
      if (isTeacher && s.rawSession.studentMarkedPaid && !s.rawSession.teacherConfirmedPayment) return true;
      return false;
    });

    if (pendingPayment) {
      const isTeacher = pendingPayment.rawSession.teacherId === user.userId;
      if (isTeacher) {
        // Teacher waiting for student payment — only show once
        if (!shownPaymentWaitingIds.current.has(pendingPayment.id) &&
            (!activePopup || activePopup.type !== 'PAYMENT_SUBMITTED_TEACHER' && activePopup.type !== 'PAYMENT_WAITING')) {
          if (pendingPayment.rawSession.studentMarkedPaid) {
            // Student already paid, teacher needs to confirm
            setActivePopup({ type: 'PAYMENT_SUBMITTED_TEACHER', session: { id: pendingPayment.id, topic: pendingPayment.topic, studentName: pendingPayment.rawSession.studentName } });
          } else {
            // Waiting for student to pay
            shownPaymentWaitingIds.current.add(pendingPayment.id);
            setActivePopup({ type: 'PAYMENT_WAITING', session: { id: pendingPayment.id, topic: pendingPayment.topic } });
          }
        }
      } else {
        if (!activePopup || activePopup.type !== 'PAYMENT_NEEDED' || activePopup.session?.id !== pendingPayment.id) {
          setActivePopup({ type: 'PAYMENT_NEEDED', session: { id: pendingPayment.id, topic: pendingPayment.topic } });
        }
      }
      return;
    }

    // 3. REVIEW — session complete, payment done (or not needed), not yet reviewed
    if (!reviewModalData) {
      const pendingReview = sessionsData.find(s => {
        if (s.status !== 'COMPLETED') return false;
        if (shownReviewIds.current.has(s.id)) return false;
        const requiresPayment = detectRequiresPayment(s.rawSession);
        const paymentDone = !requiresPayment || (s.rawSession.studentMarkedPaid && s.rawSession.teacherConfirmedPayment);
        if (!paymentDone) return false;
        const hasReviewed = s.rawSession.hasReviewed ||
          (s.rawSession.reviews && s.rawSession.reviews.some(r => r.reviewerId === user.userId));
        return !hasReviewed;
      });

      if (pendingReview) {
        const isTeacher = pendingReview.rawSession.teacherId === user.userId;
        openReviewModal(
          pendingReview.id,
          pendingReview.rawSession,
          pendingReview.topic,
          isTeacher ? (pendingReview.rawSession.studentName || 'Student') : (pendingReview.rawSession.teacherName || 'Teacher'),
          isTeacher ? 'Teaching' : 'Learning'
        );
      }
    }

  }, [sessionsData, requestsData, user]); // intentionally excludes activePopup/reviewModalData — use refs for guards

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
  // WS events are used for immediate, real-time reactions.
  // AppDataContext also calls fetchInitialData() on these events, so the polling
  // fallback will run with fresh data shortly after. We avoid duplicates via refs.
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
      // Immediately show popup to the person who hasn't confirmed yet
      const weConfirmed = isTeacher ? raw.teacherConfirmedCompletion : raw.studentConfirmedCompletion;
      const requesterIsTeacher = raw.teacherConfirmedCompletion;
      const shouldShow = !weConfirmed && ((isStudent && requesterIsTeacher) || (isTeacher && !requesterIsTeacher));
      if (shouldShow) {
        setActivePopup({ type: 'COMPLETION_REQUESTED', session: { id: sessionId, topic } });
      }

    } else if (sessionEvent.type === 'SESSION_BOTH_CONFIRMED') {
      // Backend now broadcasts finalSession (with correct studentMarkedPaid/teacherConfirmedPayment/requiresPayment)
      setActivePopup(null);

      // Determine payment requirement directly from the final session state
      const requiresPayment = raw.requiresPayment != null
        ? raw.requiresPayment
        : !(raw.studentMarkedPaid && raw.teacherConfirmedPayment); // auto-settled = free

      if (requiresPayment) {
        // Paid session
        if (isStudent) {
          setActivePopup({ type: 'PAYMENT_NEEDED', session: { id: sessionId, topic } });
        } else if (isTeacher) {
          shownPaymentWaitingIds.current.add(sessionId);
          setActivePopup({ type: 'PAYMENT_WAITING', session: { id: sessionId, topic } });
        }
      } else {
        // Free or Swap — show review for BOTH parties
        openReviewModal(
          sessionId, raw, topic,
          isTeacher ? (raw.studentName || 'Student') : (raw.teacherName || 'Teacher'),
          myRole
        );
      }

    } else if (sessionEvent.type === 'PAYMENT_SUBMITTED') {
      if (isTeacher) {
        setActivePopup({ type: 'PAYMENT_SUBMITTED_TEACHER', session: { id: sessionId, topic, studentName: raw.studentName } });
      } else {
        setActivePopup(null); // student already handled by handleMarkPaid → review modal
      }

    } else if (sessionEvent.type === 'PAYMENT_CONFIRMED') {
      setActivePopup(null);
      // Student needs review after teacher confirms payment
      if (isStudent) {
        const localSession = sessionsData?.find(s => s.id === sessionId);
        const alreadyReviewed = localSession?.rawSession?.hasReviewed ||
          (localSession?.rawSession?.reviews && localSession.rawSession.reviews.some(r => r.reviewerId === user.userId));
        if (!alreadyReviewed) {
          openReviewModal(
            sessionId,
            localSession?.rawSession || raw,
            localSession?.topic || topic,
            localSession?.rawSession?.teacherName || raw.teacherName || 'Teacher',
            'Learning'
          );
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
        openReviewModal(
          sessionId,
          sessionToReview.rawSession,
          sessionToReview.topic,
          sessionToReview.rawSession.teacherName || 'Teacher',
          'Learning'
        );
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
        openReviewModal(
          sessionId,
          sessionToReview.rawSession,
          sessionToReview.topic,
          sessionToReview.rawSession.studentName || 'Student',
          'Teaching'
        );
      }
    } catch (err) {
      console.error('Failed to confirm payment', err);
    }
  };

  const handleAcceptRequest = async (req) => {
    try {
      if (req.type?.toLowerCase().includes('chat')) {
        await chatRequestService.acceptRequest(req.id);
      } else if (req.type?.toLowerCase().includes('swap')) {
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
      if (req.type?.toLowerCase().includes('chat')) {
        await chatRequestService.rejectRequest(req.id);
      } else if (req.type?.toLowerCase().includes('swap')) {
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

  const pendingRequests = requestsData?.filter(r =>
    r.direction === 'incoming' && r.status === 'pending' && !dismissedRequests.includes(r.id)
  ) || [];
  const activeRequest = pendingRequests.length > 0 ? pendingRequests[0] : null;

  if (!activePopup && !reviewModalData && !activeRequest) return null;

  return (
    <>
      {/* Incoming request popup — only shown when no lifecycle popup is active */}
      {!activePopup && !reviewModalData && activeRequest && (() => {
        let reqType = 'Session Request';
        let isChat = false;
        if (activeRequest.type?.toLowerCase().includes('swap')) reqType = 'Swap Request';
        else if (activeRequest.type?.toLowerCase().includes('chat')) { reqType = 'Chat Request'; isChat = true; }
        else if (activeRequest.otherUserExtras?.listingType?.includes('TEACH')) reqType = 'Teach Request';
        else if (activeRequest.otherUserExtras?.listingType?.includes('LEARN')) reqType = 'Learn Request';

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
            onClose={() => setDismissedRequests(prev => [...prev, activeRequest.id])}
          />
        );
      })()}

      {/* Session scheduled end time reached — prompt to mark complete */}
      {activePopup?.type === 'END_REACHED' && (
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

      {/* Other party already confirmed — asking us to confirm */}
      {activePopup?.type === 'COMPLETION_REQUESTED' && (
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

      {/* Student: make payment */}
      {activePopup?.type === 'PAYMENT_NEEDED' && (
        <PaymentModal
          isOpen={true}
          session={activePopup.session}
          onClose={() => setActivePopup(null)}
          onMarkPaid={handleMarkPaid}
        />
      )}

      {/* Teacher: waiting for student to pay */}
      {activePopup?.type === 'PAYMENT_WAITING' && (
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

      {/* Teacher: student claims payment sent */}
      {activePopup?.type === 'PAYMENT_SUBMITTED_TEACHER' && (
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

      {/* Review modal — shown exactly once per session per page session */}
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
