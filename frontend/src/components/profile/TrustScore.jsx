import React, { useState, useRef, useEffect } from 'react';
import { IconShieldCheck, IconShieldCheckFilled, IconSparkles } from '@tabler/icons-react';
import { motion } from 'framer-motion';

const TrustScore = ({ trustScorePercent, isProfileVerified, totalSkills, verifiedCount }) => {
  const [isFlyingUp, setIsFlyingUp] = useState(false);
  const prevScoreRef = useRef(trustScorePercent);

  useEffect(() => {
    if (prevScoreRef.current < 100 && trustScorePercent === 100 && totalSkills > 0) {
      setIsFlyingUp(true);
      setTimeout(() => {
        setIsFlyingUp(false);
      }, 800);
    }
    prevScoreRef.current = trustScorePercent;
  }, [trustScorePercent, totalSkills]);

  return (
    <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: '32px', border: '1px solid #f3f4f6', position: 'relative', overflow: 'hidden' }}>
      {isFlyingUp && (
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.5 }}
          animate={{ y: -100, opacity: [0, 1, 0], scale: 1.5 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ position: 'absolute', right: '40px', top: '40px', pointerEvents: 'none', zIndex: 10 }}
        >
          <IconSparkles size={48} color="#eab308" />
        </motion.div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: isProfileVerified ? '#dcfce7' : '#f3f4f6', padding: '10px', borderRadius: '12px', transition: 'background 0.3s ease' }}>
            {isProfileVerified ? <IconShieldCheckFilled size={24} style={{ color: '#16a34a' }} /> : <IconShieldCheck size={24} style={{ color: '#9ca3af' }} />}
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Verification Trust Score
              {isProfileVerified && <span style={{ fontSize: '12px', background: '#fef9c3', color: '#a16207', padding: '2px 8px', borderRadius: '100px', fontWeight: 700 }}>VERIFIED</span>}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500, marginTop: '2px' }}>
              {verifiedCount} of {totalSkills} skills verified
            </div>
          </div>
        </div>
        <div style={{ fontSize: '32px', fontWeight: 900, color: isProfileVerified ? '#16a34a' : '#111827', transition: 'color 0.3s ease' }}>
          {trustScorePercent}%
        </div>
      </div>
      
      <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '100px', overflow: 'hidden' }}>
        <div style={{ 
          height: '100%', 
          width: `${trustScorePercent}%`, 
          background: isProfileVerified ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)', 
          borderRadius: '100px',
          transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.5s ease'
        }}></div>
      </div>
    </div>
  );
};

export default TrustScore;
