import React from 'react';
import { useAppData } from '../context/AppDataContext';
import RequestCard from '../components/common/RequestCard';

const Requests = () => {
  const { requests, acceptRequest, declineRequest } = useAppData();

  const incomingRequests = requests.filter(r => r.direction === 'incoming');
  const outgoingRequests = requests.filter(r => r.direction === 'outgoing');

  return (
    <div id="requests" className="pg on" style={{ padding: '24px', background: 'var(--cs-bg-light)', minHeight: '100vh', maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--cs-text-main)', marginBottom: '16px' }}>Incoming requests</div>
        <div style={{ fontSize: '13px', color: 'var(--cs-text-secondary)', marginBottom: '16px' }}>
          {incomingRequests.length} pending request{incomingRequests.length !== 1 ? 's' : ''}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {incomingRequests.map(req => (
            <RequestCard
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
            <div style={{ fontSize: '13px', color: 'var(--cs-text-inactive)', padding: '32px 0', textAlign: 'center', background: 'var(--cs-bg-white)', borderRadius: 'var(--cs-radius-lg)', border: '0.5px dashed var(--cs-border)' }}>
              No incoming requests right now.
            </div>
          )}
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--cs-border)', margin: '32px 0' }}></div>

      <div>
        <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--cs-text-main)', marginBottom: '16px' }}>Sent requests</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {outgoingRequests.map(req => (
            <RequestCard
              key={req.id}
              avatarProps={{ initials: req.init, bg: req.bg, color: req.col, size: '40px', fontSize: '14px' }}
              title={req.title}
              subtitle={req.sub}
              status={req.status}
              type="outgoing"
            />
          ))}

          {outgoingRequests.length === 0 && (
            <div style={{ fontSize: '13px', color: 'var(--cs-text-inactive)', padding: '32px 0', textAlign: 'center', background: 'var(--cs-bg-white)', borderRadius: 'var(--cs-radius-lg)', border: '0.5px dashed var(--cs-border)' }}>
              You haven't sent any requests yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Requests;
