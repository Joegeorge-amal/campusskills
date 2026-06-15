import React, { useState } from 'react';
import Avatar from './Avatar';
import { IconClock, IconAlertCircle, IconShieldCheckFilled, IconArrowsExchange } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';

const RequestsCardV2 = ({
  avatarProps,
  title,
  subtitle,
  tagText,
  tagType = 'primary',
  status,
  type = 'incoming',
  onAccept,
  onDecline,
  onCancel,
  reqDetails = {},
  otherUser = {},
  otherUserStats = {},
  otherUserExtras = {}
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();

  // Normalize status for comparisons
  const s = (status || '').toLowerCase();
  const isPending = s === 'pending' || s === 'requested';

  // Derived properties
  const rollNo = otherUserExtras.email ? otherUserExtras.email.split('@')[0].toUpperCase() : '';
  const memberSince = otherUserExtras.createdAt 
    ? new Date(otherUserExtras.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) 
    : '';
  
  // Extract the title/topic from the first proposed session
  const fallbackTitle = reqDetails.proposedSessions && reqDetails.proposedSessions.length > 0 
    ? reqDetails.proposedSessions[0].topic 
    : null;
    
  const requestTitle = otherUserExtras.listingTitle || fallbackTitle;
  const actualSkill = otherUserExtras.requestedSkill || fallbackTitle;

  const isLearnListing = otherUserExtras.listingType === 'LEARN' || otherUserExtras.listingType === 'LEARN_SWAP';
  const isSwap = reqDetails.type === 'SWAP';
  
  const listingOfferedSkill = otherUserExtras.offeredSkillName || fallbackTitle;
  const listingRequestedSkill = otherUserExtras.requestedSkill || fallbackTitle;
  const explicitOfferedSkill = reqDetails.offeredSkillName;

  let theirOffer = null;
  let myOffer = null;
  const otherName = otherUser.name ? otherUser.name.split(' ')[0] : 'User';
  
  if (type === 'incoming') {
    // This is MY listing. They are requesting me.
    if (isSwap) {
       theirOffer = explicitOfferedSkill || listingRequestedSkill || 'Unknown Skill';
       myOffer = listingOfferedSkill || 'Unknown Skill';
    } else if (isLearnListing) {
       theirOffer = explicitOfferedSkill || listingRequestedSkill || 'Unknown Skill';
    } else {
       myOffer = listingOfferedSkill || 'Unknown Skill';
    }
  } else { // outgoing
    // This is THEIR listing. I am requesting them.
    if (isSwap) {
       theirOffer = listingOfferedSkill || 'Unknown Skill';
       myOffer = explicitOfferedSkill || listingRequestedSkill || 'Unknown Skill';
    } else if (isLearnListing) {
       myOffer = explicitOfferedSkill || listingRequestedSkill || 'Unknown Skill';
    } else {
       theirOffer = listingOfferedSkill || 'Unknown Skill';
    }
  }

  const isTheirOfferVerified = theirOffer ? otherUser?.verifiedSkills?.map(s => (s.name || s).trim().toLowerCase())?.includes(theirOffer.trim().toLowerCase()) : false;
  const isMyOfferVerified = myOffer ? user?.verifiedSkills?.map(s => (s.name || s).trim().toLowerCase())?.includes(myOffer.trim().toLowerCase()) : false;

  const showDisclaimer = (theirOffer && !isTheirOfferVerified) || (myOffer && !isMyOfferVerified);

  const displayTheirOffer = theirOffer || 'Unknown Skill';
  const displayMyOffer = myOffer || 'Unknown Skill';

  const renderVerificationPill = (isVerified) => {
    if (isVerified) {
      return <span style={{ padding: '2px 8px', background: '#ecfdf5', color: '#059669', fontSize: '11px', display: 'flex', alignItems: 'center', borderRadius: '100px', fontWeight: 700, border: '1px solid #a7f3d0' }}>✓ Verified</span>;
    }
    return <span style={{ padding: '2px 8px', background: '#fefce8', color: '#b45309', fontSize: '11px', display: 'flex', alignItems: 'center', borderRadius: '100px', fontWeight: 700, border: '1px solid #fde047' }}>⚠️ Unverified</span>;
  };

  return (
    <div 
      style={{
        background: '#ffffff',
        border: isExpanded ? '1px solid #c7d2fe' : '1px solid #e5e7eb',
        borderRadius: '12px',
        marginBottom: '12px',
        boxShadow: isExpanded ? '0 8px 24px rgba(0, 0, 0, 0.06)' : '0 4px 12px rgba(0, 0, 0, 0.02)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* HEADER SECTION (Always visible) */}
      <div style={{
        padding: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        background: isExpanded ? '#f8fafc' : '#ffffff',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
          <div style={{ marginTop: '2px' }}>
            <Avatar {...avatarProps} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
              {title}
            </div>
            
            {/* Show short message preview if collapsed */}
            <div style={{ 
              fontSize: '13px', 
              color: '#6b7280', 
              marginBottom: '8px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '400px',
              opacity: isExpanded ? 0 : 1,
              height: isExpanded ? 0 : 'auto',
              transition: 'opacity 0.2s ease-in-out'
            }}>
              {subtitle}
            </div>

            {tagText && (
              <span style={{ 
                fontSize: '11px', 
                padding: '4px 10px', 
                borderRadius: '100px', 
                background: tagType === 'success' ? '#ecfdf5' : '#eff6ff', 
                color: tagType === 'success' ? '#059669' : '#1d4ed8',
                fontWeight: 600,
                display: 'inline-block',
                marginTop: isExpanded ? '4px' : '0'
              }}>
                {tagText}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons / Status Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', alignSelf: 'center' }}>
          
          {type === 'incoming' && isPending && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); onAccept(); }}
                style={{ padding: '6px 16px', background: '#1d4ed8', color: '#ffffff', border: 'none', borderRadius: '100px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#1e40af' }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#1d4ed8' }}
              >
                Accept
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDecline(); }}
                style={{ padding: '6px 16px', background: '#ffffff', color: '#1e40af', border: '1px solid #93c5fd', borderRadius: '100px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#eff6ff' }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff' }}
              >
                Decline
              </button>
            </div>
          )}

          {type === 'outgoing' && isPending && (
            <button 
              onClick={(e) => { e.stopPropagation(); if (onCancel) onCancel(); }}
              style={{ padding: '6px 16px', background: '#ffffff', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '100px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#fee2e2' }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff' }}
            >
              Cancel Request
            </button>
          )}

          <span style={{ 
            padding: '4px 12px', 
            background: s === 'confirmed' ? '#ecfdf5' : s === 'declined' || s === 'cancelled' ? '#fef2f2' : '#fef3c7', 
            color: s === 'confirmed' ? '#059669' : s === 'declined' || s === 'cancelled' ? '#ef4444' : '#d97706', 
            borderRadius: '100px',  
            fontWeight: 600, 
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textTransform: 'capitalize'
          }}>
            {s}
          </span>
        </div>
      </div>

      {/* EXPANDED SECTION (Animated with CSS Grid) */}
      <div style={{
        display: 'grid',
        gridTemplateRows: isExpanded ? '1fr' : '0fr',
        transition: 'grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ 
            padding: '24px', 
            borderTop: '1px solid #e5e7eb',
            background: '#ffffff',
            cursor: 'default' 
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              
              {/* Left Column: User Profile Info */}
              <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <Avatar {...avatarProps} size="64px" fontSize="24px" />
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {otherUser.name || 'Unknown User'}
                      {otherUserExtras.isProfileVerified && (
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '100px', border: '1px solid #a7f3d0' }}>
                          ✓ Verified Profile
                        </span>
                      )}
                    </div>
                    {rollNo && (
                      <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginTop: '2px' }}>
                        {rollNo}
                      </div>
                    )}
                    {otherUser.programme && (
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                        {otherUser.programme}
                      </div>
                    )}
                    <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                      <span style={{ color: '#f59e0b' }}>★</span> 
                      {otherUserStats.ratingAvg ? otherUserStats.ratingAvg.toFixed(1) : 'No ratings yet'} 
                      {otherUserStats.ratingCount > 0 && ` (${otherUserStats.ratingCount} reviews)`}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', fontWeight: 600, marginBottom: '4px' }}>Sessions</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>{otherUserStats.sessionsCompleted || 0}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', fontWeight: 600, marginBottom: '4px' }}>Member Since</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginTop: '2px' }}>{memberSince || 'Unknown'}</div>
                  </div>
                </div>

                {otherUser.verifiedSkills && otherUser.verifiedSkills.length > 0 && (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>Verified Skills</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {otherUser.verifiedSkills.map((sk, idx) => (
                        <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: '#ecfdf5', color: '#059669', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                          <IconShieldCheckFilled size={14} /> {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                  <button style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0 }}>
                    <IconAlertCircle size={14} /> Report User
                  </button>
                </div>
              </div>

              {/* Right Column: Request Info */}
              <div style={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
                {requestTitle && (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Listing</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                      {requestTitle}
                    </div>
                  </div>
                )}

                {(theirOffer || myOffer) && (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Request Details</div>
                    
                    {isSwap ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', gap: '24px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{`${otherName} OFFERS`}</div>
                          <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e3a8a', textAlign: 'center' }}>{displayTheirOffer}</div>
                          {renderVerificationPill(isTheirOfferVerified)}
                        </div>
                        
                        <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconArrowsExchange size={32} stroke={2} />
                        </div>
                        
                        <div style={{ flex: 1, minWidth: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.5px' }}>YOU TEACH</div>
                          <div style={{ fontSize: '20px', fontWeight: 800, color: '#065f46', textAlign: 'center' }}>{displayMyOffer}</div>
                          {renderVerificationPill(isMyOfferVerified)}
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {theirOffer && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>{`${otherName} OFFERS:`}</span>
                            <span style={{ padding: '4px 12px', background: '#eff6ff', color: '#1d4ed8', borderRadius: '100px', fontWeight: 700, fontSize: '14px', border: '1px solid #bfdbfe' }}>{theirOffer}</span>
                            {renderVerificationPill(isTheirOfferVerified)}
                          </div>
                        )}
                        
                        {myOffer && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>YOU TEACH:</span>
                            <span style={{ padding: '4px 12px', background: '#f0fdf4', color: '#065f46', borderRadius: '100px', fontWeight: 700, fontSize: '14px', border: '1px solid #bbf7d0' }}>{myOffer}</span>
                            {renderVerificationPill(isMyOfferVerified)}
                          </div>
                        )}
                      </div>
                    )}

                    {showDisclaimer && (
                      <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5, marginTop: '12px', background: '#fffbeb', padding: '12px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                        ⚠️ <strong>Skill Verification Notice:</strong> One or more skills in this request have not been verified by CampusSkills. You can still continue with this request, but we recommend reviewing the user's ratings, completed sessions, and profile information before accepting.
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Message</div>
                  <div style={{ 
                    background: '#f3f4f6', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    borderTopLeftRadius: type === 'incoming' ? '4px' : '12px',
                    borderTopRightRadius: type === 'outgoing' ? '4px' : '12px',
                    fontSize: '14px', 
                    color: '#374151',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {subtitle || 'No message provided.'}
                  </div>
                </div>

                {reqDetails.proposedSessions && reqDetails.proposedSessions.length > 0 && (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Proposed Timings</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {reqDetails.proposedSessions.map((session, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', border: '1px solid #e5e7eb', padding: '12px', borderRadius: '8px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IconClock size={20} />
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{session.startTime}</div>
                            {session.endTime && <div style={{ fontSize: '12px', color: '#6b7280' }}>Until {session.endTime}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestsCardV2;
