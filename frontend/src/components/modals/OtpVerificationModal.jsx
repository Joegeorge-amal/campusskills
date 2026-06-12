import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const OtpVerificationModal = ({ isOpen, onClose, onSuccess, type = 'email' }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  const { verifyEmail, verify2FA } = useAuth();

  useEffect(() => {
    let interval;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  if (!isOpen) return null;

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Allow only the last entered character if multiple are somehow typed
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6).split('');
    if (pastedData.some(isNaN)) return;

    const newOtp = [...otp];
    pastedData.forEach((char, idx) => {
      newOtp[idx] = char;
    });
    setOtp(newOtp);
    
    // Focus last filled input
    const focusIndex = Math.min(pastedData.length, 5);
    if (focusIndex < 6) {
        inputRefs.current[focusIndex].focus();
    } else {
        inputRefs.current[5].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      if (type === '2fa') {
        await verify2FA(otpString);
      } else {
        await verifyEmail(otpString);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setIsLoading(true);
    setError('');
    try {
      if (type === '2fa') {
        await authService.resend2FA();
      } else {
        await authService.resendOtp();
      }
      setTimer(60); // Reset timer
      setOtp(['', '', '', '', '', '']); // Clear OTP fields
      inputRefs.current[0].focus();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOtp(['', '', '', '', '', '']);
    setTimer(60);
    setError('');
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className="modal-content" 
        style={{ padding: '32px', maxWidth: '400px', width: '92vw', textAlign: 'center', position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={handleClose} 
          style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888', lineHeight: 1 }}
        >×</button>

        <div style={{ fontSize: '20px', fontWeight: '600', color: '#1a1560', marginBottom: '8px' }}>
          {type === '2fa' ? 'Two-Factor Authentication' : 'Verify Your Email'}
        </div>

        <p style={{ fontSize: '14px', color: '#666', margin: '16px 0 24px', lineHeight: 1.5 }}>
          {type === '2fa' 
            ? 'A verification code has been sent to your admin email address.' 
            : 'A verification code has been sent to your email address.'}<br/>
          <span style={{ fontSize: '12px', color: '#888' }}>Please check your spam folder if you don't see it.</span>
        </p>

        <form onSubmit={handleVerify}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                style={{
                  width: '45px',
                  height: '55px',
                  fontSize: '24px',
                  textAlign: 'center',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  outline: 'none',
                  color: '#1a1560',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1a1560'}
                onBlur={(e) => e.target.style.borderColor = '#ccc'}
                maxLength={1}
              />
            ))}
          </div>

          {error && <div style={{ color: '#E24B4A', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

          <button className="lbtn" type="submit" disabled={isLoading || otp.join('').length !== 6}>
            {isLoading ? 'Verifying...' : (type === '2fa' ? 'Verify Login' : 'Verify Email')}
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '14px', color: '#666' }}>
          Didn't receive the code?{' '}
          {timer > 0 ? (
            <span style={{ fontWeight: '500', color: '#888' }}>Resend in 00:{timer < 10 ? `0${timer}` : timer}</span>
          ) : (
            <button 
              onClick={handleResend}
              style={{ background: 'none', border: 'none', color: '#1a1560', fontWeight: '600', cursor: 'pointer', padding: 0, fontSize: '14px' }}
              disabled={isLoading}
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OtpVerificationModal;
