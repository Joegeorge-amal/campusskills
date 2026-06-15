import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import RequestsCardV2 from '../components/common/RequestsCardV2';
import SkillSwapModal from '../components/modals/SkillSwapModal';
import { exchangeService } from '../services/exchangeService';
import { chatRequestService } from '../services/chatRequestService';

// Helper to get initials
const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const Requests = () => {
  const { user } = useAuth();
  const { triggerToast, requestsData, isRequestsLoading: loading, fetchInitialData } = useAppData();
  
      const [swapModalRequest, setSwapModalRequest] = useState(null);
  
  const [isIncomingOpen, setIsIncomingOpen] = useState(true);
  const [isSentOpen, setIsSentOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  

  const handleAccept = async (reqId, hideToast = false) => {
    try {
      const req = requestsData.find(r => r.id === reqId);
      if (req.type === 'Chat request') {
        await chatRequestService.acceptRequest(reqId);
      } else {
        await exchangeService.acceptExchange(reqId);
      }
      if (!hideToast) triggerToast('Request accepted successfully!');
      fetchInitialData();
    } catch (err) {
      triggerToast('Failed to accept request');
    }
  };

  const handleDecline = async (reqId) => {
    try {
      const req = requestsData.find(r => r.id === reqId);
      if (req.type === 'Chat request') {
        await chatRequestService.rejectRequest(reqId);
      } else {
        await exchangeService.rejectExchange(reqId);
      }
      triggerToast('Request declined.');
      fetchInitialData();
    } catch (err) {
      triggerToast('Failed to decline request');
    }
  };

  const handleCancel = async (reqId) => {
    try {
      const req = requestsData.find(r => r.id === reqId);
      if (req.type === 'Chat request') {
        // chatRequestService doesn't have cancel yet, so fallback to reject if needed or ignore
        // Actually, we should just use cancelExchange for exchanges
      } else {
        await exchangeService.cancelExchange(reqId);
      }
      triggerToast('Request cancelled.');
      fetchInitialData();
    } catch (err) {
      triggerToast('Failed to cancel request');
    }
  };

  const historyStatuses = ['accepted', 'confirmed', 'declined', 'rejected', 'cancelled', 'completed'];
  
  const activeRequests = requestsData.filter(r => !historyStatuses.includes(r.status));
  const incomingRequests = activeRequests.filter(r => r.direction === 'incoming');
  const outgoingRequests = activeRequests.filter(r => r.direction === 'outgoing');
  const historyRequests = requestsData
    .filter(r => historyStatuses.includes(r.status))
    .sort((a, b) => {
      const aTime = a.rawReq?.updatedAt || a.rawReq?.createdAt || 0;
      const bTime = b.rawReq?.updatedAt || b.rawReq?.createdAt || 0;
      return bTime - aTime;
    });

  return (
    <>
      <div id="requests" className="pg on" style={{ padding: '32px 40px', backgroundColor: 'var(--cs-bg-light)', backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px)', backgroundSize: '24px 24px', minHeight: '100vh', boxSizing: 'border-box' }}>
      
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
                  <RequestsCardV2
                    key={req.id}
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
                      } else {
                        handleAccept(req.id);
                      }
                    }}
                    onDecline={() => handleDecline(req.id)}
                    reqDetails={req.rawReq}
                    otherUser={req.otherUser}
                    otherUserStats={req.otherUserStats}
                    otherUserExtras={req.otherUserExtras}
                  />
                ))}
                
                {incomingRequests.length === 0 && (
                  <div style={{ fontSize: '14px', color: '#6b7280', padding: '48px 0', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    No incoming requests right now.
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
              <span>{isSentOpen ? '▼' : '▶'}</span> Sent by you ({outgoingRequests.length})
            </div>
            
            {isSentOpen && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {outgoingRequests.map(req => (
                  <RequestsCardV2
                    key={req.id}
                    avatarProps={{ initials: req.init, bg: req.bg, color: req.col, backgroundImage: req.otherUser?.avatarImg || req.otherUser?.profilePicture, size: '32px', fontSize: '12px' }}
                    title={req.title}
                    subtitle={req.sub}
                    status={req.status}
                    type="outgoing"
                    reqDetails={req.rawReq}
                    otherUser={req.otherUser}
                    otherUserStats={req.otherUserStats}
                    otherUserExtras={req.otherUserExtras}
                    onCancel={() => handleCancel(req.id)}
                  />
                ))}

                {outgoingRequests.length === 0 && (
                  <div style={{ fontSize: '14px', color: '#6b7280', padding: '48px 0', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    You haven't sent any requests yet.
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
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {historyRequests.map(req => (
                  <RequestsCardV2
                    key={req.id}
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
                ))}
                
                {historyRequests.length === 0 && (
                  <div style={{ fontSize: '14px', color: '#6b7280', padding: '48px 0', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    No past requests found.
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
            title: swapModalRequest.title,
            sub: swapModalRequest.sub,
            status: swapModalRequest.status,
            type: swapModalRequest.type,
            typeCls: swapModalRequest.typeCls,
            init: swapModalRequest.init,
            bg: swapModalRequest.bg,
            col: swapModalRequest.col
          }}
          onConfirm={(reqId, schedule) => {
            handleAccept(reqId, true);
          }}
        />
      )}
    </>
  );
};

export default Requests;
