import React, { useEffect, useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { sessionService } from '../../services/sessionService';
import GlobalNotificationPopup from './GlobalNotificationPopup';
import ReviewModal from '../modals/ReviewModal';
import ConfirmModal from '../modals/ConfirmModal';

const SessionLifecycleManager = () => {
  const { user } = useAuth();
  const { 
    sessionEvent, 
    sessionsData, 
    requestsData,
    fetchInitialData,
    acceptRequest,
    declineRequest
  } = useAppData();
  
  const [activePopup, setActivePopup] = useState(null);
  const [reviewModalData, setReviewModalData] = useState(null);

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
      if (s.status !== 'COMPLETED' || !!s.rawSession.swapGroupId) return false;
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
  }, [sessionsData, user, activePopup]);

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
      const isSwap = !!raw.swapGroupId;
      if (!isSwap) {
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
        // Swap session completed, jump straight to review
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
        setActivePopup({
          type: 'PAYMENT_SUBMITTED_STUDENT',
          session: { id: sessionId, topic }
        });
      }
    } else if (sessionEvent.type === 'PAYMENT_CONFIRMED') {
      setActivePopup(null);
      setReviewModalData({
        id: sessionId,
        rawSession: raw,
        topic,
        name: isTeacher ? (raw.studentName || 'Student') : (raw.teacherName || 'Teacher'),
        role: myRole,
        status: 'COMPLETED'
      });
    }

  }, [sessionEvent, user]);

  const handleMarkCompletion = async (sessionId) => {
    setActivePopup(null);
    try {
      await sessionService.markCompletion(sessionId);
      fetchInitialData();
    } catch (err) {
      console.error('Failed to mark completion', err);
    }
  };

  const handleMarkPaid = async (sessionId) => {
    setActivePopup(null);
    try {
      await sessionService.markPaid(sessionId);
      fetchInitialData();
    } catch (err) {
      console.error('Failed to mark paid', err);
    }
  };

  const handleConfirmPayment = async (sessionId) => {
    setActivePopup(null);
    try {
      await sessionService.confirmPayment(sessionId);
      fetchInitialData();
    } catch (err) {
      console.error('Failed to confirm payment', err);
    }
  };

  const pendingRequests = requestsData?.filter(r => r.direction === 'incoming' && r.status === 'pending') || [];
  const activeRequest = pendingRequests.length > 0 ? pendingRequests[0] : null;

  if (!activePopup && !reviewModalData && !activeRequest) return null;

  return (
    <>
      {!activePopup && !reviewModalData && activeRequest && (() => {
        let reqType = 'Session Request';
        if (activeRequest.type?.toLowerCase().includes('swap')) {
          reqType = 'Swap Request';
        } else if (activeRequest.type?.toLowerCase().includes('chat')) {
          reqType = 'Chat Request';
        } else if (activeRequest.otherUserExtras?.listingType === 'TEACH' || activeRequest.otherUserExtras?.listingType === 'TEACH_SWAP') {
          reqType = 'Teach Request';
        } else if (activeRequest.otherUserExtras?.listingType === 'LEARN' || activeRequest.otherUserExtras?.listingType === 'LEARN_SWAP') {
          reqType = 'Learn Request';
        }
        
        const listingTitle = activeRequest.otherUserExtras?.listingTitle || 'Skill Session';
        const remainingCount = pendingRequests.length - 1;

        return (
          <GlobalNotificationPopup
            title={activeRequest.name || 'Unknown User'}
            subtitle={`Wants to book ${listingTitle}`}
            badge={`NEW REQUEST ${remainingCount > 0 ? `(+${remainingCount} more)` : ''}`}
            badgeColor="#1d4ed8"
            avatarInitials={activeRequest.init}
            avatarBg={activeRequest.bg}
            avatarColor={activeRequest.col}
            primaryButtonText="Accept"
            secondaryButtonText="Dismiss"
            onPrimaryClick={() => acceptRequest(activeRequest.id)}
            onSecondaryClick={() => declineRequest(activeRequest.id)}
            onClose={() => declineRequest(activeRequest.id)}
          />
        );
      })()}

      {activePopup && activePopup.type === 'END_REACHED' && (
        <ConfirmModal
          isOpen={true}
          title={`Has ${activePopup.session.topic || 'the session'} been completed?`}
          message="The scheduled time has ended. Did you complete the session successfully?"
          confirmText="Yes, Completed"
          cancelText="Dismiss"
          onConfirm={() => handleMarkCompletion(activePopup.session.id)}
          onClose={() => setActivePopup(null)}
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
        <ConfirmModal
          isOpen={true}
          title="Payment Required"
          message={`Session completed successfully. Please navigate to the Sessions tab to view UPI details and submit your payment for "${activePopup.session.topic}".`}
          confirmText="I've Paid"
          cancelText="Later"
          onConfirm={() => handleMarkPaid(activePopup.session.id)}
          onClose={() => setActivePopup(null)}
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

      {activePopup && activePopup.type === 'PAYMENT_SUBMITTED_STUDENT' && (
        <GlobalNotificationPopup
          title="Payment submitted"
          subtitle={`Waiting for the teacher to verify receipt for "${activePopup.session.topic}".`}
          badge="VERIFYING PAYMENT"
          badgeColor="#4f46e5"
          secondaryButtonText="Dismiss"
          onSecondaryClick={() => setActivePopup(null)}
          onClose={() => setActivePopup(null)}
          autoCloseMs={6000}
        />
      )}

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
