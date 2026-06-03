import React from 'react';
import { useAppData } from '../context/AppDataContext';
import Avatar from '../components/common/Avatar';

const Requests = () => {
  const { requests, acceptRequest, declineRequest } = useAppData();

  const incomingRequests = requests.filter(r => r.direction === 'incoming');
  const outgoingRequests = requests.filter(r => r.direction === 'outgoing');

  return (
    <div id="requests" className="pg on">
      {/* Incoming Requests */}
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '9px' }}>
        {incomingRequests.length} pending request{incomingRequests.length !== 1 ? 's' : ''}
      </div>
      
      {incomingRequests.map(req => (
        <div className="rcard" key={req.id}>
          <Avatar letters={req.init} bgColor={req.bg} textColor={req.col} size="32px" fontSize="11px" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>{req.title}</div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{req.sub}</div>
            <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '20px', background: req.typeCls === 'c-code' ? '#E1F5EE' : '#EEEDFE', color: req.typeCls === 'c-code' ? '#085041' : '#3C3489', marginTop: '4px', display: 'inline-block' }}>
              {req.type}
            </span>
          </div>
          {req.status === 'pending' ? (
            <div style={{ display: 'flex', gap: '5px' }}>
              <button 
                style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '7px', border: 'none', background: '#E1F5EE', color: '#0F6E56', fontWeight: 500, cursor: 'pointer' }}
                onClick={() => acceptRequest(req.id)}
              >
                Accept
              </button>
              <button 
                style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '7px', border: '0.5px solid rgba(0,0,0,.1)', background: 'none', color: '#888', cursor: 'pointer' }}
                onClick={() => declineRequest(req.id)}
              >
                Decline
              </button>
            </div>
          ) : (
            <span style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '20px', background: '#E1F5EE', color: '#0F6E56' }}>Accepted</span>
          )}
        </div>
      ))}
      
      {incomingRequests.length === 0 && (
        <div style={{ fontSize: '12px', color: '#888', padding: '20px 0', textAlign: 'center', background: '#fff', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,.08)' }}>
          No incoming requests right now.
        </div>
      )}

      <div className="sep"></div>

      {/* Outgoing Requests */}
      <div style={{ fontSize: '12px', fontWeight: 500, color: '#222', marginBottom: '8px' }}>Sent requests</div>
      
      {outgoingRequests.map(req => (
        <div className="rcard" key={req.id}>
          <Avatar letters={req.init} bgColor={req.bg} textColor={req.col} size="32px" fontSize="11px" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>{req.title}</div>
            <div style={{ fontSize: '11px', color: '#888' }}>{req.sub}</div>
          </div>
          <span style={{ 
            fontSize: '11px', padding: '3px 9px', borderRadius: '20px', 
            background: req.status === 'Confirmed' ? '#E1F5EE' : '#FAEEDA', 
            color: req.status === 'Confirmed' ? '#0F6E56' : '#633806' 
          }}>
            {req.status}
          </span>
        </div>
      ))}

      {outgoingRequests.length === 0 && (
        <div style={{ fontSize: '12px', color: '#888', padding: '20px 0', textAlign: 'center', background: '#fff', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,.08)' }}>
          You haven't sent any requests yet.
        </div>
      )}
    </div>
  );
};

export default Requests;
