import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import RequestsCardV2 from '../components/common/RequestsCardV2';
import SkillSwapModal from '../components/modals/SkillSwapModal';
import { exchangeService } from '../services/exchangeService';
import { chatRequestService } from '../services/chatRequestService';
import { userService } from '../services/userService';
import { listingService } from '../services/listingService';

// Helper to get initials
const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const Requests = () => {
  const { user } = useAuth();
  const { triggerToast } = useAppData();
  
  const [loading, setLoading] = useState(true);
  const [requestsData, setRequestsData] = useState([]);
  const [swapModalRequest, setSwapModalRequest] = useState(null);
  
  const [isIncomingOpen, setIsIncomingOpen] = useState(true);
  const [isSentOpen, setIsSentOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      const [exchanges, chatReqsRes] = await Promise.all([
        exchangeService.getMyExchanges(),
        chatRequestService.getUserRequests()
      ]);

      const chatReqs = chatReqsRes.items || [];
      const allRawRequests = [...exchanges, ...chatReqs];
      
      // We need to fetch user profiles for the OTHER person in the request
      const otherUserIds = [...new Set(allRawRequests.map(req => {
        const myId = user.userId;
        if (req.initiatorId) { // It's an exchange
          return req.initiatorId === myId ? req.receiverId : req.initiatorId;
        } else { // It's a chat request
          return req.senderId === myId ? req.receiverId : req.senderId;
        }
      }).filter(Boolean))];

      const userProfilesMap = {};
      await Promise.all(otherUserIds.map(async (id) => {
        try {
          const res = await userService.getPublicProfile(id);
          userProfilesMap[id] = res;
        } catch (e) {
          console.error(`Failed to fetch profile for ${id}`);
        }
      }));

      // Fetch listings to get correct requested skill names
      const listingIds = [...new Set(allRawRequests.map(req => req.listingId).filter(Boolean))];
      const listingsMap = {};
      await Promise.all(listingIds.map(async (id) => {
        try {
          const res = await listingService.getListingById(id);
          listingsMap[id] = res;
        } catch (e) {
          console.error(`Failed to fetch listing for ${id}`);
        }
      }));

      // Map raw requests to the UI format
      const mappedRequests = allRawRequests.map(req => {
        const myId = user.userId;
        let isIncoming = false;
        let otherUserId = null;
        let isExchange = false;

        if (req.initiatorId) { // Exchange
          isExchange = true;
          isIncoming = req.receiverId === myId;
          otherUserId = isIncoming ? req.initiatorId : req.receiverId;
        } else { // Chat Request
          isIncoming = req.receiverId === myId;
          otherUserId = isIncoming ? req.senderId : req.receiverId;
        }

        const otherUserRes = userProfilesMap[otherUserId];
        const otherUser = otherUserRes?.profile || { name: 'Unknown User' };
        const otherUserStats = otherUserRes?.stats || {};
        
        // Calculate Profile Verification Status
        const userVerifiedSkills = otherUser.verifiedSkills || [];
        const profileSkills = otherUser.skillsOffered?.map(s => (s.name || s).trim().toLowerCase()) || [];
        const isProfileVerified = profileSkills.length > 0 && profileSkills.every(skillName => 
          userVerifiedSkills.map(vs => (vs.name || vs).trim().toLowerCase()).includes(skillName)
        );

        const otherUserExtras = {
          email: otherUserRes?.email,
          createdAt: otherUserRes?.createdAt,
          emailVerified: otherUserRes?.emailVerified,
          isProfileVerified
        };

        const listingInfo = listingsMap[req.listingId];
        if (listingInfo) {
          otherUserExtras.listingTitle = listingInfo.title;
          otherUserExtras.requestedSkill = listingInfo.offeredSkills?.[0]?.name || listingInfo.requestedSkills?.[0]?.name || listingInfo.title;
          otherUserExtras.listingType = listingInfo.listingType;
          otherUserExtras.listingRequestedSkill = listingInfo.requestedSkills?.[0]?.name;
        }
        if (req.offeredSkillName) {
          otherUserExtras.offeredSkillName = req.offeredSkillName;
        }
        
        let title = '';
        let sub = '';
        let tagText = '';
        let tagType = 'primary';
        
        if (isExchange) {
          if (req.type === 'SWAP') {
            title = isIncoming ? `${otherUser.name} proposed a skill swap` : `You proposed a skill swap to ${otherUser.name}`;
            tagText = 'Skill swap request';
            tagType = 'success'; // 'c-code' mapped to success
          } else {
            title = isIncoming ? `${otherUser.name} requested a session` : `You requested a session with ${otherUser.name}`;
            tagText = 'Session request';
          }
          sub = req.message || 'No additional message provided.';
        } else {
          title = isIncoming ? `${otherUser.name} wants to chat` : `You requested to chat with ${otherUser.name}`;
          tagText = 'Chat request';
          sub = req.message || 'No additional message provided.';
        }

        return {
          id: req.exchangeId || req._id, // Exchange has exchangeId, ChatRequest has _id
          rawReq: req,
          direction: isIncoming ? 'incoming' : 'outgoing',
          status: req.status.toLowerCase(), // PENDING -> pending
          title,
          sub,
          type: tagText,
          typeCls: tagType === 'success' ? 'c-code' : 'c-prim',
          init: getInitials(otherUser.name),
          bg: otherUser.avatarColor?.bg || '#eef2ff',
          col: otherUser.avatarColor?.text || '#1d4ed8',
          otherUser,
          otherUserStats,
          otherUserExtras
        };
      });

      setRequestsData(mappedRequests);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      fetchAllRequests();
    }
  }, [user]);

  const handleAccept = async (reqId, hideToast = false) => {
    try {
      const req = requestsData.find(r => r.id === reqId);
      if (req.type === 'Chat request') {
        await chatRequestService.acceptRequest(reqId);
      } else {
        await exchangeService.acceptExchange(reqId);
      }
      if (!hideToast) triggerToast('Request accepted successfully!');
      fetchAllRequests();
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
      fetchAllRequests();
    } catch (err) {
      triggerToast('Failed to decline request');
    }
  };

  const historyStatuses = ['accepted', 'confirmed', 'declined', 'cancelled', 'completed'];
  
  const activeRequests = requestsData.filter(r => !historyStatuses.includes(r.status));
  const incomingRequests = activeRequests.filter(r => r.direction === 'incoming');
  const outgoingRequests = activeRequests.filter(r => r.direction === 'outgoing');
  const historyRequests = requestsData.filter(r => historyStatuses.includes(r.status));

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
                  />
                ))}

                {outgoingRequests.length === 0 && (
                  <div style={{ fontSize: '14px', color: '#6b7280', padding: '48px 0', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    You haven't sent any active requests.
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
