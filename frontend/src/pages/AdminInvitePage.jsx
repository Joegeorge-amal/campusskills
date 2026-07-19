import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconSchool } from '@tabler/icons-react';
import api from '../services/api';

const AdminInvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteData, setInviteData] = useState(null);

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // OTP states
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await api.get(`/auth/invites/${token}`);
        setInviteData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Invalid or expired invitation link.");
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, [token]);

  const handleSetup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      setSubmitting(true);
      await api.post(`/auth/invites/${token}/setup`, { fullName, password });
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to setup account");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otpArray];
    newOtp[index] = value.substring(value.length - 1);
    setOtpArray(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6).split('');
    if (pastedData.some(isNaN)) return;

    const newOtp = [...otpArray];
    pastedData.forEach((char, idx) => {
      newOtp[idx] = char;
    });
    setOtpArray(newOtp);
    
    const focusIndex = Math.min(pastedData.length, 5);
    if (focusIndex < 6) {
        inputRefs.current[focusIndex]?.focus();
    } else {
        inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otpArray.join('');
    if (otpString.length !== 6) {
        return;
    }
    try {
      setSubmitting(true);
      await api.post(`/auth/invites/verify`, { token, otp: otpString });
      alert("Account created successfully. Please login.");
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || "Invalid OTP");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div id="setup" className="auth-page" style={{ flexDirection: 'column', padding: '48px 16px', justifyContent: 'center', backgroundColor: '#f5f3ff', minHeight: '100vh' }}>
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <p style={{ zIndex: 10 }}>Loading invitation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div id="setup" className="auth-page" style={{ flexDirection: 'column', padding: '48px 16px', justifyContent: 'center', backgroundColor: '#f5f3ff', minHeight: '100vh' }}>
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="setup-card" style={{ padding: '32px', textAlign: 'center', maxWidth: '400px', zIndex: 10 }}>
          <h2 style={{ color: '#dc2626', margin: '0 0 16px 0' }}>Invalid Invitation</h2>
          <p style={{ color: 'var(--cs-text-secondary)', margin: '0 0 24px 0' }}>{error}</p>
          <button 
            onClick={() => navigate('/')}
            style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="setup" className="auth-page" style={{ flexDirection: 'column', padding: '48px 16px', justifyContent: 'flex-start', backgroundColor: '#f5f3ff', minHeight: '100vh' }}>
      <div className="bg-circle bg-circle-1"></div>
      <div className="bg-circle bg-circle-2"></div>
      
      {/* HEADER & STEPS OUTSIDE CARD */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '850px', margin: '0 auto 24px', zIndex: 2 }}>
        <div className="setup-logo" style={{ marginBottom: '16px' }}>
          <div className="setup-mark" style={{ borderRadius: '50%', background: 'var(--cs-bg-white)', width: '44px', height: '44px', padding: '4px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <img src="/src/assets/kju_campus_logo.png" alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
            <IconSchool size={28} color="#1d4ed8" style={{ display: 'none', margin: 'auto' }} />
          </div>
          <div className="setup-brand" style={{ fontSize: '20px' }}>campus<span>skills</span></div>
        </div>
        <div className="setup-hdr">
          <div className="setup-title" style={{ color: '#1e1b4b', fontSize: '22px', marginBottom: '6px' }}>Set up your administrator profile</div>
          <div className="setup-sub" style={{ color: '#6b7280', fontSize: '13px' }}>You've been invited to join as an <strong style={{color: '#4f46e5'}}>{inviteData?.role}</strong></div>
        </div>
      </div>

      <div className="setup-card" style={{ maxWidth: '450px', width: '100%', margin: '0 auto', zIndex: 2, padding: '32px' }}>
        {step === 1 ? (
          <form onSubmit={handleSetup}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#111827' }}>Email Address</label>
              <input 
                type="text" 
                value={inviteData?.email}
                disabled
                className="su-input"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--cs-border)', background: 'var(--cs-bg-light)', color: '#6b7280' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#111827' }}>Full Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="su-input"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--cs-border)' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#111827' }}>Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="su-input"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--cs-border)' }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#111827' }}>Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="su-input"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--cs-border)' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={submitting}
              style={{ width: '100%', padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer' }}
            >
              {submitting ? 'Setting up...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 16px 0', color: 'var(--cs-text-secondary)' }}>
                We've sent a 6-digit verification code to <br/><strong>{inviteData?.email}</strong>.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                {otpArray.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    onPaste={handleOtpPaste}
                    style={{
                      width: '45px',
                      height: '50px',
                      fontSize: '24px',
                      textAlign: 'center',
                      borderRadius: '8px',
                      border: '1px solid var(--cs-border)',
                      background: 'var(--cs-bg-white)',
                      fontWeight: '600',
                      color: '#111827'
                    }}
                  />
                ))}
              </div>
            </div>
            <button 
              type="submit" 
              disabled={submitting || otpArray.join('').length !== 6}
              style={{ width: '100%', padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: (submitting || otpArray.join('').length !== 6) ? 'not-allowed' : 'pointer', opacity: (submitting || otpArray.join('').length !== 6) ? 0.7 : 1 }}
            >
              {submitting ? 'Verifying...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminInvitePage;
