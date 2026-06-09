import React from 'react';
import { useAppData } from '../context/AppDataContext';
import RequestsCardV2 from '../components/common/RequestsCardV2';
import SkillSwapModal from '../components/modals/SkillSwapModal';

const Requests = () => {
  const { requests, acceptRequest, declineRequest } = useAppData();
  const [swapModalRequest, setSwapModalRequest] = React.useState(null);

  const incomingRequests = requests.filter(r => r.direction === 'incoming');
  const outgoingRequests = requests.filter(r => r.direction === 'outgoing');

  return (
    <>
      <div id="requests" className="pg on" style={{ padding: '32px 40px', background: '#F4F5F9', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Sent by you</div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {outgoingRequests.map(req => (
            <RequestsCardV2
              key={req.id}
              avatarProps={{ initials: req.init, bg: req.bg, color: req.col, size: '32px', fontSize: '12px' }}
              title={req.title}
              subtitle={req.sub}
              status={req.status}
              type="outgoing"
            />
          ))}

          {outgoingRequests.length === 0 && (
            <div style={{ fontSize: '14px', color: '#6b7280', padding: '48px 0', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              You haven't sent any requests yet.
            </div>
          )}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Incoming requests</div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {incomingRequests.map(req => (
            <RequestsCardV2
              key={req.id}
              avatarProps={{ initials: req.init, bg: req.bg, color: req.col, size: '32px', fontSize: '12px' }}
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
                  acceptRequest(req.id);
                }
              }}
              onDecline={() => declineRequest(req.id)}
            />
          ))}
          
          {incomingRequests.length === 0 && (
            <div style={{ fontSize: '14px', color: '#6b7280', padding: '48px 0', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              No incoming requests right now.
            </div>
          )}
        </div>
      </div>

    </div>
      
      {swapModalRequest && (
        <SkillSwapModal 
          isOpen={true} 
          onClose={() => setSwapModalRequest(null)} 
          request={swapModalRequest}
          onConfirm={(reqId, schedule) => {
            acceptRequest(reqId, { hideToast: true });
          }}
        />
      )}
    </>
  );
};

export default Requests;
