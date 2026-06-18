import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import RequestsCardV2 from '../components/common/RequestsCardV2';
import SkillSwapModal from '../components/modals/SkillSwapModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import { exchangeService } from '../services/exchangeService';
import { chatRequestService } from '../services/chatRequestService';
import { IconX, IconArrowsRightLeft } from '@tabler/icons-react';

// Helper to get initials
const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const Requests = () => {
  const { user } = useAuth();
  const { triggerToast, requestsData, isRequestsLoading: loading, fetchInitialData, searchQuery } = useAppData();
  
  const [swapModalRequest, setSwapModalRequest] = useState(null);
  const [declineConfirmReq, setDeclineConfirmReq] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [processingAction, setProcessingAction] = useState(null); // 'accept', 'decline', 'cancel'
  
  const [bookingModalReq, setBookingModalReq] = useState(null);

  const [isIncomingOpen, setIsIncomingOpen] = useState(true);
  const [isSentOpen, setIsSentOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const location = useLocation();
  const highlightedRequestId = location.state?.highlightRequestId;
  const [activeHighlightId, setActiveHighlightId] = useState(null);

  useEffect(() => {
    if (highlightedRequestId && requestsData && requestsData.length > 0) {
      setActiveHighlightId(highlightedRequestId);
      const req = requestsData.find(r => r.id === highlightedRequestId);
      if (req) {
        const historyStatuses = ['accepted', 'confirmed', 'declined', 'rejected', 'cancelled', 'completed'];
        const isHistory = historyStatuses.includes(req.status);
        if (isHistory) {
          setIsHistoryOpen(true);
        } else if (req.direction === 'incoming') {
          setIsIncomingOpen(true);
        } else if (req.direction === 'outgoing') {
          setIsSentOpen(true);
        }
        
        setTimeout(() => {
          const el = document.getElementById(`request-${highlightedRequestId}`);
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
  }, [highlightedRequestId, requestsData]);

  const handleAccept = async (reqId, hideToast = false, payload = {}) => {
    if (processingId) return;
    try {
      setProcessingId(reqId);
      setProcessingAction('accept');
      const req = requestsData.find(r => r.id === reqId);
      if (!req) {
        throw new Error('Request not found in current data');
      }
      if (req.type === 'Chat request') {
        await chatRequestService.acceptRequest(reqId);
      } else {
        await exchangeService.acceptExchange(reqId, payload);
      }
      if (!hideToast) triggerToast('Request accepted successfully!');
      window.dispatchEvent(new CustomEvent('markNotificationAsRead', { 
        detail: { sourceType: req.type === 'Chat request' ? 'CHAT_REQUEST' : 'EXCHANGE', sourceId: reqId } 
      }));
      fetchInitialData();
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to accept request';
      triggerToast(msg);
      console.error('Accept error:', err);
      throw err;
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleDeclineClick = (reqId) => {
    const req = requestsData.find(r => r.id === reqId);
    setDeclineConfirmReq(req);
  };

  const executeDecline = async (reqId) => {
    if (processingId) return;
    try {
      setProcessingId(reqId);
      setProcessingAction('decline');
      const req = requestsData.find(r => r.id === reqId);
      if (req.type === 'Chat request') {
        await chatRequestService.rejectRequest(reqId);
      } else {
        await exchangeService.rejectExchange(reqId);
      }
      triggerToast('Request declined.');
      window.dispatchEvent(new CustomEvent('markNotificationAsRead', { 
        detail: { sourceType: req.type === 'Chat request' ? 'CHAT_REQUEST' : 'EXCHANGE', sourceId: reqId } 
      }));
      fetchInitialData();
    } catch (err) {
      triggerToast('Failed to decline request');
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleCancel = async (reqId) => {
    if (processingId) return;
    try {
      setProcessingId(reqId);
      setProcessingAction('cancel');
      const req = requestsData.find(r => r.id === reqId);
      if (req.type === 'Chat request') {
        // chatRequestService doesn't have cancel yet
      } else {
        await exchangeService.cancelExchange(reqId);
      }
      triggerToast('Request cancelled.');
      fetchInitialData();
    } catch (err) {
      triggerToast('Failed to cancel request');
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleSwapConfirm = async (requestId, swapData) => {
    try {
      await exchangeService.acceptExchange(requestId, swapData);
      triggerToast('Skill swap accepted! Sessions have been scheduled.');
    } catch (e) {
      console.error(e);
      triggerToast('Failed to accept swap');
      throw e;
    }
  };

  const historyStatuses = ['accepted', 'confirmed', 'declined', 'rejected', 'cancelled', 'completed'];
  
  const filteredRequests = requestsData.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    
    const listingTitleMatch = r.otherUserExtras?.listingTitle?.toLowerCase().includes(q);
    const participantMatch = r.name?.toLowerCase().includes(q) || r.otherUser?.name?.toLowerCase().includes(q);
    
    return listingTitleMatch || participantMatch;
  });

  const activeRequests = filteredRequests.filter(r => !historyStatuses.includes(r.status));
  const incomingRequests = activeRequests.filter(r => r.direction === 'incoming');
  const outgoingRequests = activeRequests.filter(r => r.direction === 'outgoing');
  const historyRequests = filteredRequests
    .filter(r => historyStatuses.includes(r.status))
    .sort((a, b) => {
      const aTime = a.rawReq?.updatedAt || a.rawReq?.createdAt || 0;
      const bTime = b.rawReq?.updatedAt || b.rawReq?.createdAt || 0;
      return bTime - aTime;
    });

  return (
    <>
      <div id="requests" className="pg on" style={{ padding: '32px 40px', background: 'linear-gradient(180deg, #fafafa 0%, #f8f9ff 100%)', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#6b7280' }}>Loading requests...</div>
      ) : (
        <>
          <div style={{ marginBottom: '28px' }}>
            <div 
              style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setIsIncomingOpen(!isIncomingOpen)}
            >
              <span>{isIncomingOpen ? '▼' : '▶'}</span> Incoming requests ({incomingRequests.length})
            </div>
            
            {isIncomingOpen && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {incomingRequests.map(req => (
                  <div 
                    key={req.id}
                    id={`request-${req.id}`}
                    style={{
                      background: req.id === activeHighlightId ? '#f0f7ff' : 'transparent',
                      borderRadius: '16px',
                      padding: req.id === activeHighlightId ? '6px' : '0',
                      border: req.id === activeHighlightId ? '2px solid #3b82f6' : 'none',
                      transition: 'all 0.5s ease',
                      marginBottom: '12px'
                    }}
                  >
                    <RequestsCardV2
                      avatarProps={{ initials: req.init, bg: req.bg, color: req.col, backgroundImage: req.otherUser?.avatarImg || req.otherUser?.profilePicture, size: '32px', fontSize: '12px' }}
                      title={req.title}
                      subtitle={req.sub}
                      tagText={req.type}
                      tagType={req.typeCls === 'c-code' ? 'success' : 'primary'}
                      status={req.status}
                      type="incoming"
                      onAccept={() => {
                        if (req.type === 'Skill swap request') {
                          setSwapModalRequest(req);
                        } else if (req.type === 'Chat request') {
                          handleAccept(req.id);
                        } else {
                          setBookingModalReq(req);
                        }
                      }}
                      onDecline={() => handleDeclineClick(req.id)}
                      reqDetails={req.rawReq}
                      otherUser={req.otherUser}
                      otherUserStats={req.otherUserStats}
                      otherUserExtras={req.otherUserExtras}
                      actionLoading={processingId === req.id ? processingAction : null}
                    />
                  </div>
                ))}
                
                {incomingRequests.length === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 30px -5px rgba(0,0,0,.04)' }}>
                    <IconArrowsRightLeft size={28} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>No incoming requests</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', maxWidth: '280px' }}>No incoming requests right now. Explore the marketplace to send requests to others!</div>
                    <button onClick={() => navigate('/app/marketplace')} style={{ padding: '8px 16px', borderRadius: '10px', background: '#2563eb', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Browse Marketplace</button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '28px' }}>
            <div 
              style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setIsSentOpen(!isSentOpen)}
            >
              <span>{isSentOpen ? '▼' : '▶'}</span> Sent Requests ({outgoingRequests.length})
            </div>
            
            {isSentOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {outgoingRequests.map(req => (
                  <div key={req.id}>
                    <RequestsCardV2
                      id={req.id}
                      avatarProps={{ initials: req.init, bg: req.bg, color: req.col, backgroundImage: req.otherUser?.avatarImg || req.otherUser?.profilePicture, size: '32px', fontSize: '12px' }}
                      title={req.title}
                      subtitle={req.sub}
                      status={req.status}
                      type="outgoing"
                      reqDetails={req.rawReq}
                      otherUser={req.otherUser}
                      otherUserStats={req.otherUserStats}
                      otherUserExtras={req.otherUserExtras}
                      actionLoading={processingId === req.id ? processingAction : null}
                      onCancel={() => handleCancel(req.id)}
                    />
                  </div>
                ))}

                {outgoingRequests.length === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 30px -5px rgba(0,0,0,.04)' }}>
                    <IconArrowsRightLeft size={28} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>No sent requests</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', maxWidth: '280px' }}>You haven't sent any skill swap or session requests yet.</div>
                    <button onClick={() => navigate('/app/marketplace')} style={{ padding: '8px 16px', borderRadius: '10px', background: '#2563eb', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Find Swaps</button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <div 
              style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            >
              <span>{isHistoryOpen ? '▼' : '▶'}</span> History ({historyRequests.length})
            </div>
            
            {isHistoryOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {historyRequests.map(req => (
                  <div key={req.id}>
                    <RequestsCardV2
                      avatarProps={{ initials: req.init, bg: req.bg, color: req.col, backgroundImage: req.otherUser?.avatarImg || req.otherUser?.profilePicture, size: '32px', fontSize: '12px' }}
                      title={req.title}
                      subtitle={req.sub}
                      tagText={req.type}
                      tagType={req.typeCls === 'c-code' ? 'success' : 'primary'}
                      status={req.status}
                      type={req.direction}
                      reqDetails={req.rawReq}
                      otherUser={req.otherUser}
                      otherUserStats={req.otherUserStats}
                      otherUserExtras={req.otherUserExtras}
                    />
                  </div>
                ))}
                
                {historyRequests.length === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 30px -5px rgba(0,0,0,.04)' }}>
                    <IconArrowsRightLeft size={28} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>No past requests</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', maxWidth: '280px' }}>History of accepted, declined, or cancelled requests will appear here.</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

    </div>
      
      {swapModalRequest && (
        <SkillSwapModal 
          isOpen={true} 
          onClose={() => setSwapModalRequest(null)} 
          request={{
            id: swapModalRequest.id,
            name: swapModalRequest.name,
            title: swapModalRequest.title,
            sub: swapModalRequest.sub,
            status: swapModalRequest.status,
            type: swapModalRequest.type,
            typeCls: swapModalRequest.typeCls,
            init: swapModalRequest.init,
            bg: swapModalRequest.bg,
            col: swapModalRequest.col,
            rawReq: swapModalRequest.rawReq,
            otherUserExtras: swapModalRequest.otherUserExtras,
            otherUser: swapModalRequest.otherUser
          }}
          user={user}
          onConfirm={(reqId, payload) => {
            return handleAccept(reqId, true, payload);
          }}
        />
      )}

      {/* Booking Confirmation Modal */}
      {bookingModalReq && ReactDOM.createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px',
            maxWidth: '400px', width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                Accept Session Request
              </h3>
              <button onClick={() => setBookingModalReq(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
                <IconX size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                {bookingModalReq.name} wants to learn from you
              </div>

              {/* Skills */}
              {bookingModalReq.otherUserExtras?.listingTitle && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', fontSize: '13px', color: '#4b5563' }}>
                  <span style={{ fontWeight: 600, minWidth: '70px' }}>Topic:</span>
                  <span>{bookingModalReq.otherUserExtras.listingTitle}</span>
                </div>
              )}

              {/* Proposed Time */}
              {(() => {
                const rawReq = bookingModalReq.rawReq;
                const startTime = rawReq?.proposedStartTime;
                if (startTime) {
                  const d = new Date(startTime);
                  return (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', fontSize: '13px', color: '#4b5563' }}>
                      <span style={{ fontWeight: 600, minWidth: '70px' }}>Time:</span>
                      <span>{d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} at {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  );
                }
                const duration = rawReq?.preferredDurationMinutes;
                return (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', fontSize: '13px', color: '#6b7280' }}>
                    <span style={{ fontWeight: 600, minWidth: '70px' }}>Duration:</span>
                    <span>{duration ? `${duration} minutes` : 'TBD'}</span>
                  </div>
                );
              })()}

              {/* Message */}
              {bookingModalReq.message && (
                <div style={{ marginTop: '12px', padding: '12px', background: '#f9fafb', borderRadius: '8px', fontSize: '13px', color: '#374151', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' }}>Message</div>
                  {bookingModalReq.message}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setBookingModalReq(null)}
                style={{ flex: 1, padding: '10px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                Cancel
              </button>
              <button onClick={async () => {
                const reqId = bookingModalReq.id;
                setBookingModalReq(null);
                await handleAccept(reqId, false, {});
              }}
                disabled={!!processingId}
                style={{ flex: 1, padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: processingId ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '13px', opacity: processingId ? 0.6 : 1 }}>
                {processingId ? 'Accepting...' : 'Accept Request'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ConfirmModal
        isOpen={!!declineConfirmReq}
        onClose={() => setDeclineConfirmReq(null)}
        onConfirm={() => {
          const id = declineConfirmReq.id;
          setDeclineConfirmReq(null);
          executeDecline(id);
        }}
        title={declineConfirmReq?.type === 'Skill swap request' ? 'Decline Swap Request' : 'Decline Request'}
        message={`Are you sure you want to decline this ${declineConfirmReq?.type === 'Skill swap request' ? 'swap' : ''} request from ${declineConfirmReq?.name}?`}
        confirmText="Decline"
        isDanger={true}
      />
    </>
  );
};

export default Requests;
