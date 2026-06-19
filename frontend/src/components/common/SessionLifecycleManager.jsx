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
  const { sessionEvent, sessionsData, requestsData, fetchInitialData, triggerToast, pendingReviewRequest, setPendingReviewRequest } = useAppData();

  const [activePopup, setActivePopup] = useState(null);
  const [reviewModalData, setReviewModalData] = useState(null);
  const [dismissedRequests, setDismissedRequests] = useState([]);
  const [processingLifecycleAction, setProcessingLifecycleAction] = useState(null);

  const dismissedPopupIds = useRef(new Map());

  // Use sessionStorage to persist shown modals across page navigation/reloads
  const getStoredSet = (key) => {
    try { return new Set(JSON.parse(sessionStorage.getItem(key) || '[]')); }
    catch { return new Set(); }
  };
  const saveStoredSet = (key, set) => {
    sessionStorage.setItem(key, JSON.stringify([...set]));
  };

  const shownReviewIds = useRef(getStoredSet('shownReviewIds'));
  const shownPaymentWaitingIds = useRef(getStoredSet('shownPaymentWaitingIds'));

  const addShownReviewId = (id) => {
    shownReviewIds.current.add(id);
    saveStoredSet('shownReviewIds', shownReviewIds.current);
  };
  const addShownPaymentWaitingId = (id) => {
    shownPaymentWaitingIds.current.add(id);
    saveStoredSet('shownPaymentWaitingIds', shownPaymentWaitingIds.current);
  };

  const [snoozedSessions, setSnoozedSessions] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('snoozedSessions') || '{}');
      const now = Date.now();
      const cleaned = {};
      Object.keys(stored).forEach(k => { if (stored[k] > now) cleaned[k] = stored[k]; });
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

  // Open the review modal — single gateway, always checks shownReviewIds first
  // bypassGuard: manual user intent (card button) bypasses the early-return
  // but still populates shownReviewIds to prevent auto-polling from re-opening
  const openReviewModal = (id, rawSession, topic, name, role, bypassGuard = false) => {
    if (!bypassGuard && shownReviewIds.current.has(id)) return;
    if (!shownReviewIds.current.has(id)) {
      addShownReviewId(id);
    }
    // Use functional setter: if a review modal is already open, don't overwrite
    setReviewModalData(prev => prev ?? { id, rawSession, topic, name, role, status: 'COMPLETED' });
  };

  // Detect if a session requires payment based on its current stored fields
  const requiresPaymentFor = (rawSession) => {
    if (rawSession.requiresPayment != null) return rawSession.requiresPayment;
    // Fallback for old sessions: if backend auto-settled payment, it's free
    if (rawSession.studentMarkedPaid && rawSession.teacherConfirmedPayment) return false;
    // Check if it's a swap via requestsData
    const req = requestsData.find(r => r.id === rawSession.exchangeId);
    if (rawSession.swapGroupId || (req && req.rawReq?.type === 'SWAP')) return false;
    return true; // conservative default
  };

  // ─── POLLING (data-driven, single source of truth) ───────────────────────────
  // Runs on every sessionsData/requestsData refresh.
  // Uses functional setters throughout — if current state already matches, React
  // returns the same reference and skips the re-render, preventing modal flicker.
  useEffect(() => {
    if (!sessionsData || !user?.userId) return;

    // Clean stale dismissed entries (> 5 seconds old)
    const now = Date.now();
    dismissedPopupIds.current.forEach((ts, key) => {
      if (now - ts > 5000) dismissedPopupIds.current.delete(key);
    });

    // ── 1. COMPLETION_REQUESTED ───────────────────────────────────────────────
    // The other person confirmed but WE haven't yet
    const pendingCompletion = sessionsData.find(s => {
      if (s.status !== 'SCHEDULED') return false;
      const iT = s.rawSession.teacherId === user.userId;
      const iS = s.rawSession.studentId === user.userId;
      const tC = s.rawSession.teacherConfirmedCompletion;
      const sC = s.rawSession.studentConfirmedCompletion;
      return (iT && sC && !tC) || (iS && tC && !sC);
    });

    if (pendingCompletion) {
      if (!dismissedPopupIds.current.has(`${pendingCompletion.id}:COMPLETION_REQUESTED`)) {
        setActivePopup(prev => {
          if (prev?.type === 'COMPLETION_REQUESTED' && prev?.session?.id === pendingCompletion.id) return prev;
          return { type: 'COMPLETION_REQUESTED', session: { id: pendingCompletion.id, topic: pendingCompletion.topic } };
        });
      }
      return;
    }

    // ── 2. PAYMENT states (paid sessions only) ────────────────────────────────
    let paymentPopup = null;
    for (const s of sessionsData) {
      if (s.status !== 'COMPLETED') continue;
      if (!requiresPaymentFor(s.rawSession)) continue;

      const iT = s.rawSession.teacherId === user.userId;
      const iS = s.rawSession.studentId === user.userId;
      const sPaid = s.rawSession.studentMarkedPaid;
      const tConf = s.rawSession.teacherConfirmedPayment;

      if (iS && !sPaid) {
        // Student needs to pay
        paymentPopup = { type: 'PAYMENT_NEEDED', session: { id: s.id, topic: s.topic } };
        break;
      }
      if (iT && sPaid && !tConf) {
        // Teacher needs to confirm receipt
        paymentPopup = { type: 'PAYMENT_SUBMITTED_TEACHER', session: { id: s.id, topic: s.topic, studentName: s.rawSession.studentName } };
        break;
      }
      if (iT && !sPaid && !shownPaymentWaitingIds.current.has(s.id)) {
        // Teacher waiting for student to pay — show once only
        addShownPaymentWaitingId(s.id);
        paymentPopup = { type: 'PAYMENT_WAITING', session: { id: s.id, topic: s.topic } };
        break;
      }
    }

    if (paymentPopup) {
      if (!dismissedPopupIds.current.has(`${paymentPopup.session.id}:${paymentPopup.type}`)) {
        setActivePopup(prev => {
          if (prev?.type === paymentPopup.type && prev?.session?.id === paymentPopup.session.id) return prev;
          return paymentPopup;
        });
      }
      return;
    }

    // ── 3. Clear stale lifecycle popup if session state no longer needs it ────
    setActivePopup(prev => {
      if (!prev) return prev;
      const lifecycleTypes = ['COMPLETION_REQUESTED', 'PAYMENT_NEEDED', 'PAYMENT_WAITING', 'PAYMENT_SUBMITTED_TEACHER'];
      if (lifecycleTypes.includes(prev.type)) return null; // clear stale popup
      return prev; // keep END_REACHED, etc.
    });

    // ── 4. REVIEW ─────────────────────────────────────────────────────────────
    const pendingReview = sessionsData.find(s => {
      if (s.status !== 'COMPLETED') return false;
      if (shownReviewIds.current.has(s.id)) return false;
      const reqPayment = requiresPaymentFor(s.rawSession);
      const paymentDone = !reqPayment || (s.rawSession.studentMarkedPaid && s.rawSession.teacherConfirmedPayment);
      if (!paymentDone) return false;
      const reviewed = s.rawSession.hasReviewed ||
        (s.rawSession.reviews && s.rawSession.reviews.some(r => r.reviewerId === user.userId));
      return !reviewed;
    });

    if (pendingReview) {
      const iT = pendingReview.rawSession.teacherId === user.userId;
      openReviewModal(
        pendingReview.id,
        pendingReview.rawSession,
        pendingReview.topic,
        pendingReview.name, // Use the actual name mapped in AppDataContext
        iT ? 'Teaching' : 'Learning'
      );
    }

  }, [sessionsData, requestsData, user]);
  // NOTE: activePopup intentionally NOT in deps — functional setters make this safe

  // ─── TIME-BASED END REACHED ──────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionsData || !user?.userId) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const ended = sessionsData.find(s => {
        if (s.status !== 'SCHEDULED') return false;
        const iT = s.rawSession.teacherId === user.userId;
        const weConfirmed = iT ? s.rawSession.teacherConfirmedCompletion : s.rawSession.studentConfirmedCompletion;
        if (weConfirmed) return false;
        const end = s.rawSession.scheduledEnd;
        const snoozeUntil = snoozedSessions[s.id];
        if (snoozeUntil && now < snoozeUntil) return false;
        return end && now >= end && (now - end) < 3600000;
      });
      if (ended) {
        setActivePopup(prev => {
          if (prev?.type === 'END_REACHED' && prev?.session?.id === ended.id) return prev;
          if (prev) return prev; // don't overwrite an existing popup
          return { type: 'END_REACHED', session: ended };
        });
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [sessionsData, user, snoozedSessions]);

  // ─── WEBSOCKET EVENTS ────────────────────────────────────────────────────────
  // The WS handler ONLY handles COMPLETION_REQUESTED for immediate real-time feel.
  // All other events: AppDataContext already calls fetchInitialData() which updates
  // sessionsData, and the polling above handles showing the correct popup.
  // This eliminates race conditions between WS handler and polling.
  useEffect(() => {
    if (!sessionEvent || !user?.userId) return;
    const raw = sessionEvent.session;
    if (!raw) return;
    const sessionId = raw._id || raw.id;
    if (!sessionId) return;

    const isTeacher = raw.teacherId === user.userId;
    const isStudent = raw.studentId === user.userId;
    if (!isTeacher && !isStudent) return;

    if (sessionEvent.type === 'COMPLETION_REQUESTED') {
      const weConfirmed = isTeacher ? raw.teacherConfirmedCompletion : raw.studentConfirmedCompletion;
      const requesterIsTeacher = raw.teacherConfirmedCompletion;
      const shouldShow = !weConfirmed && ((isStudent && requesterIsTeacher) || (isTeacher && !requesterIsTeacher));
      if (shouldShow) {
        const topic = raw.topic || 'Skill Session';
        setActivePopup(prev => {
          if (prev?.type === 'COMPLETION_REQUESTED' && prev?.session?.id === sessionId) return prev;
          return { type: 'COMPLETION_REQUESTED', session: { id: sessionId, topic } };
        });
      }
    } else if (sessionEvent.type === 'PAYMENT_REMINDER') {
      const remindedBy = raw.remindedBy || 'Someone';
      triggerToast(remindedBy + ' reminded you to complete payment.');
      // Clear any snooze so the polling effect re-shows the payment popup for this session
      if (snoozedSessions.current.has(sessionId)) {
        snoozedSessions.current.delete(sessionId);
      }
    }
    // All other types (SESSION_BOTH_CONFIRMED, PAYMENT_SUBMITTED, PAYMENT_CONFIRMED, etc.)
    // are handled by the polling useEffect after fetchInitialData() refreshes sessionsData.

  }, [sessionEvent, user]);

  // ─── MANUAL REVIEW REQUEST (from Sessions.jsx card button) ────────────────────
  // bypassGuard=true: explicit user intent overrides shownReviewIds suppression
  useEffect(() => {
    if (!pendingReviewRequest) return;
    const { id, rawSession, topic, name, role } = pendingReviewRequest;
    openReviewModal(id, rawSession, topic, name, role === 'Teaching' ? 'Teaching' : 'Learning', true);
    setPendingReviewRequest(null);
  }, [pendingReviewRequest, setPendingReviewRequest]);

  // ─── ACTION HANDLERS ─────────────────────────────────────────────────────────

  const handleMarkCompletion = async (sessionId) => {
    dismissedPopupIds.current.set(`${sessionId}:COMPLETION_REQUESTED`, Date.now());
    setActivePopup(null);
    setProcessingLifecycleAction('completing');
    try {
      await sessionService.markCompletion(sessionId);
      window.dispatchEvent(new CustomEvent('markNotificationAsRead', { detail: { sourceType: 'SESSION', sourceId: sessionId } }));
      fetchInitialData();
    } catch (err) { console.error('Failed to mark completion', err); }
    finally { setProcessingLifecycleAction(null); }
  };

  const handleMarkPaid = async (sessionId) => {
    const s = sessionsData?.find(x => x.id === sessionId);
    dismissedPopupIds.current.set(`${sessionId}:PAYMENT_NEEDED`, Date.now());
    setActivePopup(null);
    setProcessingLifecycleAction('paying');
    try {
      await sessionService.markPaid(sessionId);
      window.dispatchEvent(new CustomEvent('markNotificationAsRead', { detail: { sourceType: 'SESSION', sourceId: sessionId } }));
      fetchInitialData();
      if (s) openReviewModal(sessionId, s.rawSession, s.topic, s.name || 'Teacher', 'Learning');
    } catch (err) { console.error('Failed to mark paid', err); }
    finally { setProcessingLifecycleAction(null); }
  };

  const handleConfirmPayment = async (sessionId) => {
    const s = sessionsData?.find(x => x.id === sessionId);
    dismissedPopupIds.current.set(`${sessionId}:PAYMENT_SUBMITTED_TEACHER`, Date.now());
    setActivePopup(null);
    setProcessingLifecycleAction('confirmingPayment');
    try {
      await sessionService.confirmPayment(sessionId);
      window.dispatchEvent(new CustomEvent('markNotificationAsRead', { detail: { sourceType: 'SESSION', sourceId: sessionId } }));
      fetchInitialData();
      if (s) openReviewModal(sessionId, s.rawSession, s.topic, s.name || 'Student', 'Teaching');
    } catch (err) { console.error('Failed to confirm payment', err); }
    finally { setProcessingLifecycleAction(null); }
  };

  const handleAcceptRequest = async (req) => {
    try {
      if (req.type?.toLowerCase().includes('chat')) await chatRequestService.acceptRequest(req.id);
      else if (req.type?.toLowerCase().includes('swap')) await exchangeService.acceptSwap(req.id);
      else await exchangeService.acceptRequest(req.id);
      setDismissedRequests(prev => [...prev, req.id]);
      window.dispatchEvent(new CustomEvent('markNotificationAsRead', {
        detail: { sourceType: req.type?.toLowerCase().includes('chat') ? 'CHAT_REQUEST' : 'EXCHANGE', sourceId: req.id }
      }));
      fetchInitialData();
    } catch (e) { console.error('Failed to accept request:', e); }
  };

  const handleDeclineRequest = async (req) => {
    try {
      if (req.type?.toLowerCase().includes('chat')) await chatRequestService.rejectRequest(req.id);
      else if (req.type?.toLowerCase().includes('swap')) await exchangeService.rejectExchange(req.id);
      else await exchangeService.rejectRequest(req.id);
      setDismissedRequests(prev => [...prev, req.id]);
      window.dispatchEvent(new CustomEvent('markNotificationAsRead', {
        detail: { sourceType: req.type?.toLowerCase().includes('chat') ? 'CHAT_REQUEST' : 'EXCHANGE', sourceId: req.id }
      }));
      fetchInitialData();
    } catch (e) { console.error('Failed to decline request:', e); }
  };

  const pendingRequests = requestsData?.filter(r =>
    r.direction === 'incoming' && r.status === 'pending' && !dismissedRequests.includes(r.id)
  ) || [];
  const activeRequest = pendingRequests.length > 0 ? pendingRequests[0] : null;

  if (!activePopup && !reviewModalData && !activeRequest) return null;

  return (
    <>
      {/* Incoming request — only when no lifecycle popup is active */}
      {!activePopup && !reviewModalData && activeRequest && (() => {
        let reqType = 'Session Request';
        let isChat = false;
        let subtitleText = '';
        if (activeRequest.type?.toLowerCase().includes('swap')) {
          reqType = 'Swap Request';
          subtitleText = `Wants to book ${activeRequest.otherUserExtras?.listingTitle || 'Skill Session'}`;
        } else if (activeRequest.type?.toLowerCase().includes('chat')) {
          reqType = 'Chat Request';
          isChat = true;
          subtitleText = 'Wants to chat with you';
        } else if (activeRequest.type?.toLowerCase().includes('offer to teach') || activeRequest.otherUserExtras?.listingType?.includes('LEARN')) {
          reqType = 'Offer to Teach';
          subtitleText = `Offered to teach you ${activeRequest.otherUserExtras?.listingTitle || 'Skill Session'}`;
        } else {
          subtitleText = `Wants to book ${activeRequest.otherUserExtras?.listingTitle || 'Skill Session'}`;
        }
        const remaining = pendingRequests.length - 1;
        return (
          <GlobalNotificationPopup
            title={activeRequest.name || 'Unknown User'}
            subtitle={subtitleText}
            badge={`NEW ${reqType.toUpperCase()}${remaining > 0 ? ` (+${remaining} more)` : ''}`}
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

      {activePopup?.type === 'END_REACHED' && (
        <ConfirmModal
          isOpen={true}
          title={`Has ${activePopup.session?.topic || 'the session'} been completed?`}
          message="The scheduled time has ended. Did you complete the session successfully?"
          confirmText="Yes, Completed"
          cancelText="Snooze (10 min)"
          onConfirm={() => handleMarkCompletion(activePopup.session.id)}
          onClose={() => handleSnooze(activePopup.session.id)}
          confirmDisabled={processingLifecycleAction === 'completing'}
          confirmLoadingText="Confirming..."
        />
      )}

      {activePopup?.type === 'COMPLETION_REQUESTED' && (
        <ConfirmModal
          isOpen={true}
          title="Session marked as completed"
          message={`The other participant marked "${activePopup.session.topic}" as completed. Please confirm.`}
          confirmText="Confirm Completion"
          cancelText="Dispute"
          onConfirm={() => handleMarkCompletion(activePopup.session.id)}
          onClose={() => setActivePopup(null)}
          confirmDisabled={processingLifecycleAction === 'completing'}
          confirmLoadingText="Confirming..."
        />
      )}

      {activePopup?.type === 'PAYMENT_NEEDED' && (
        <PaymentModal
          isOpen={true}
          session={activePopup.session}
          onClose={() => setActivePopup(null)}
          onMarkPaid={handleMarkPaid}
        />
      )}

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

      {activePopup?.type === 'PAYMENT_SUBMITTED_TEACHER' && (
        <ConfirmModal
          isOpen={true}
          title="Verify Payment"
          message={`${activePopup.session.studentName || 'Student'} claims payment was sent for "${activePopup.session.topic}". Did you receive it?`}
          confirmText="Yes, Received"
          cancelText="Not Yet"
          onConfirm={() => handleConfirmPayment(activePopup.session.id)}
          onClose={() => setActivePopup(null)}
          confirmDisabled={processingLifecycleAction === 'confirmingPayment'}
          confirmLoadingText="Confirming..."
        />
      )}

      {reviewModalData && (
        <ReviewModal
          isOpen={true}
          onClose={() => { setReviewModalData(null); setPendingReviewRequest(null); }}
          session={reviewModalData}
          onSubmit={() => { setReviewModalData(null); setPendingReviewRequest(null); fetchInitialData(); }}
        />
      )}
    </>
  );
};

export default SessionLifecycleManager;
