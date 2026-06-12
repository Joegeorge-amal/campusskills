import React, { useState } from 'react';
import { IconCheck, IconTrash, IconCircle } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';

const VerifiedSkills = ({ 
  verifiedSkills, 
  pendingSkills, 
  topicMap, 
  isOwner = false,
  onRemoveSkill,
  onRetakeQuiz
}) => {
  const cardStyle = {
    background: '#ffffff', 
    border: '1px solid #e5e7eb', 
    borderRadius: '12px', 
    padding: '20px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    display: 'flex', 
    flexDirection: 'column'
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <div style={{ background: '#dcfce7', borderRadius: '50%', padding: '2px' }}>
          <IconCheck size={14} strokeWidth={3} style={{ color: '#16a34a' }} />
        </div>
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Verified Skills</span>
        <span style={{ fontSize: '11px', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>{verifiedSkills.length}</span>
      </div>

      {verifiedSkills.length === 0 ? (
        <div style={{ padding: '32px 0', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', marginBottom: '40px' }}>
          <div style={{ width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <IconCheck size={24} color="#94a3b8" />
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>No verified skills yet</div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            {isOwner ? "Take a skill quiz to get verified and boost your trust score." : "This user hasn't verified any skills yet."}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {verifiedSkills.map((skill, i) => {
            const domain = topicMap[skill] || 'General';
            return (
              <div key={i} className="glossy-card" style={{ ...cardStyle, border: '1px solid #dcfce7', background: '#f0fdf4' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{skill}</div>
                  </div>
                  {isOwner && (
                    <button onClick={() => onRemoveSkill(skill)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                      <IconTrash size={16} />
                    </button>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: '#16a34a', marginBottom: '16px', marginLeft: '14px', fontWeight: 600 }}>{domain}</div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#dcfce7', padding: '4px 10px', borderRadius: '100px' }}>
                    <IconCheck size={12} color="#15803d" strokeWidth={3} />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803d' }}>VERIFIED</span>
                  </div>
                  
                  {isOwner && (
                    <button 
                      onClick={() => onRetakeQuiz(skill)} 
                      style={{ 
                        background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                        padding: '4px 8px', borderRadius: '6px'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#dbeafe'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                    >
                      Retake Quiz &rarr;
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pending Verification Section */}
      <AnimatePresence>
        {pendingSkills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', y: 0, marginBottom: 40 }}
            exit={{ opacity: 0, height: 0, y: -20, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ background: '#fef3c7', borderRadius: '50%', padding: '2px' }}>
                <IconCircle size={14} strokeWidth={3} style={{ color: '#f59e0b' }} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Pending Verification</span>
              <span style={{ fontSize: '11px', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>{pendingSkills.length}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {pendingSkills.map((skill, i) => (
                <div key={i} className="glossy-card" style={{ ...cardStyle, border: '1px solid #fde047', background: '#fffbeb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }}></div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{skill}</div>
                    </div>
                    {isOwner && (
                      <button onClick={() => onRemoveSkill(skill)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                        <IconTrash size={16} />
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#1d4ed8', marginBottom: '16px', marginLeft: '14px', fontWeight: 600 }}>{topicMap[skill] || 'General'}</div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#d1d5db' }}></div>
                      Awaiting verification
                    </div>
                    
                    {isOwner && (
                      <button 
                        onClick={() => onRetakeQuiz(skill)} 
                        className="btn-primary" 
                        style={{ 
                          padding: '6px 12px', fontSize: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                        }}
                      >
                        Take Quiz &rarr;
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VerifiedSkills;
