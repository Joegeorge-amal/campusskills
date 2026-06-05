import React from 'react';
import { useAppData } from '../context/AppDataContext';
import RequestsCardV2 from '../components/common/RequestsCardV2';

const Requests = () => {
  const { requests, acceptRequest, declineRequest } = useAppData();

  const incomingRequests = requests.filter(r => r.direction === 'incoming');
  const outgoingRequests = requests.filter(r => r.direction === 'outgoing');

  return (
    <div id="requests" className="pg on" style={{ padding: '24px', background: '#f9fafb', minHeight: '100vh', maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>Sent by you</div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {outgoingRequests.map(req => (
            <RequestsCardV2
              key={req.id}
              avatarProps={{ initials: req.init, bg: req.bg, color: req.col, size: '40px', fontSize: '14px' }}
              title={req.title}
              subtitle={req.sub}
              status={req.status}
              type="outgoing"
            />
          ))}

          {outgoingRequests.length === 0 && (
            <div style={{ fontSize: '13px', color: '#9ca3af', padding: '32px 0', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px dashed #e5e7eb' }}>
              You haven't sent any requests yet.
            </div>
          )}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>Incoming requests</div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {incomingRequests.map(req => (
            <RequestsCardV2
              key={req.id}
              avatarProps={{ initials: req.init, bg: req.bg, color: req.col, size: '40px', fontSize: '14px' }}
              title={req.title}
              subtitle={req.sub}
              tagText={req.type}
              tagType={req.typeCls === 'c-code' ? 'success' : 'primary'}
              status={req.status}
              type="incoming"
              onAccept={() => acceptRequest(req.id)}
              onDecline={() => declineRequest(req.id)}
            />
          ))}
          
          {incomingRequests.length === 0 && (
            <div style={{ fontSize: '13px', color: '#9ca3af', padding: '32px 0', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px dashed #e5e7eb' }}>
              No incoming requests right now.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Requests;
