import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { authService } from '../../services/authService';
import { APP_CONFIG } from '../../config';
import { IconEye, IconEyeClosed } from '@tabler/icons-react';

const Stepper = ({ currentStep }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', margin: '0 auto 24px', gap: '12px' }}>
    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: currentStep > 1 ? '#00c853' : '#1d4ed8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 600 }}>
      {currentStep > 1 ? '✓' : '1'}
    </div>
    <div style={{ width: '48px', height: '3px', background: currentStep > 2 ? '#00c853' : (currentStep === 2 ? '#1d4ed8' : '#e2e8f0') }}></div>
    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: currentStep > 2 ? '#00c853' : (currentStep === 2 ? '#1d4ed8' : '#e2e8f0'), color: currentStep >= 2 ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 600 }}>
      {currentStep > 2 ? '✓' : '2'}
    </div>
    <div style={{ width: '48px', height: '3px', background: currentStep > 3 ? '#00c853' : (currentStep === 3 ? '#1d4ed8' : '#e2e8f0') }}></div>
    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: currentStep === 3 ? '#1d4ed8' : '#e2e8f0', color: currentStep === 3 ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 600 }}>
      3
    </div>
  </div>
);

const ForgotPasswordModal = ({ isOpen, onClose, tab = 'student' }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  
  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  // -- LOGIC --

  const handleSendLink = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError(tab === 'student' ? 'Please enter your username.' : 'Please enter a valid email address.');
      return;
    }
    
    const fullEmail = tab === 'student' ? `${email.trim()}${APP_CONFIG.DEFAULT_DOMAIN}` : email.trim();
    
    setIsLoading(true);
    try {
      await authService.forgotPassword(fullEmail);
      setSuccess('Reset code sent successfully!');
      setTimeout(() => {
        setSuccess('');
        setStep(2);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to send reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6).split('');
    if (pastedData.some(isNaN)) return;
    const newOtp = [...otp];
    pastedData.forEach((char, idx) => { newOtp[idx] = char; });
    setOtp(newOtp);
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex < 6 ? focusIndex : 5].focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const fullEmail = tab === 'student' ? `${email.trim()}${APP_CONFIG.DEFAULT_DOMAIN}` : email.trim();
      const response = await authService.verifyResetOtp(fullEmail, code);
      const data = response.data || response;
      setResetToken(data.resetToken);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Invalid verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('Password must contain an uppercase letter and a number.');
      return;
    }
    
    setIsLoading(true);
    try {
      await authService.resetPassword(resetToken, newPassword);
      setSuccess('Your password has been updated successfully.');
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setOtp(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setResetToken('');
    setError('');
    setSuccess('');
    onClose();
  };

  // Password Checks
  const hasMinLen = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const CheckItem = ({ label, checked }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: checked ? '#00d26a' : '#6b7280', marginBottom: '6px' }}>
      <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: checked ? '#e6fbf0' : '#f3f4f6', color: checked ? '#00d26a' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}>
        ✓
      </div>
      {label}
    </div>
  );

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className="modal-content" 
        style={{ padding: '40px 32px', maxWidth: '420px', width: '92vw', borderRadius: '16px', position: 'relative', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={handleClose} 
          style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}
        >×</button>

        {step < 4 && <Stepper currentStep={step} />}

        {step === 1 && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 8px' }}>Reset Your Password</h2>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 24px' }}>
              Enter your college email address to get a verification code
            </p>
            <form onSubmit={handleSendLink} style={{ textAlign: 'left' }}>
              <div className="lfld" style={{ marginBottom: '24px' }}>
                <label className="lbl" style={{ fontWeight: 600 }}>{tab === 'student' ? 'College Email Address' : 'Admin Email Address'}</label>
                {tab === 'student' ? (
                  <div className="email-composite" style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                    <input
                      className="linp"
                      type="text"
                      placeholder="yourname"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase().replace(/\s/g, ''))}
                      style={{ background: 'transparent', border: 'none' }}
                      required
                    />
                    <div className="email-domain-suffix" style={{ color: '#9ca3af' }}>{APP_CONFIG.DEFAULT_DOMAIN}</div>
                  </div>
                ) : (
                  <input
                    className="linp"
                    type="email"
                    placeholder="name@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px' }}
                    required
                  />
                )}
              </div>
              {error && <div style={{ color: '#E24B4A', fontSize: '12px', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
              {success && <div style={{ color: '#0F6E56', fontSize: '12px', marginBottom: '16px', background: '#E1F5EE', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>{success}</div>}
              <button className="lbtn" type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#1d4ed8', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                {isLoading ? 'Sending...' : 'Send OTP →'}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 8px' }}>Enter Verification Code</h2>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 24px' }}>
              We've sent a 6-digit code to<br/>
              <span style={{ color: '#1d4ed8', fontWeight: 600 }}>{tab === 'student' ? `${email}${APP_CONFIG.DEFAULT_DOMAIN}` : email}</span>
            </p>
            <form onSubmit={handleVerifyOtp}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    onPaste={handleOtpPaste}
                    style={{
                      width: '45px',
                      height: '55px',
                      fontSize: '24px',
                      textAlign: 'center',
                      fontWeight: '700',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      outline: 'none',
                      color: '#111827',
                      background: '#f9fafb',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#1d4ed8'; e.target.style.boxShadow = '0 0 0 3px rgba(30, 58, 138, 0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                    maxLength={1}
                  />
                ))}
              </div>
              {error && <div style={{ color: '#E24B4A', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
              <button className="lbtn" type="submit" disabled={isLoading || otp.join('').length !== 6} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#1d4ed8', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)' }}>
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>
            <div style={{ marginTop: '24px', fontSize: '13px', color: '#6b7280' }}>
              Didn't receive code? <button onClick={handleSendLink} style={{ background: 'none', border: 'none', color: '#1d4ed8', fontWeight: '600', cursor: 'pointer', padding: 0 }}>Resend</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 8px' }}>Create New Password</h2>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 24px' }}>
              Choose a strong password to protect your account
            </p>
            <form onSubmit={handleResetPassword} style={{ textAlign: 'left' }}>
              <div className="lfld" style={{ marginBottom: '16px' }}>
                <label className="lbl" style={{ fontWeight: 600 }}>Password</label>
                <div className="input-wrapper" style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                  <input
                    className="linp"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ background: 'transparent', border: 'none' }}
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <IconEye size={18} strokeWidth={1.5} color="#9ca3af" /> : <IconEyeClosed size={18} strokeWidth={1.5} color="#9ca3af" />}
                  </button>
                </div>
              </div>
              <div className="lfld" style={{ marginBottom: '20px' }}>
                <label className="lbl" style={{ fontWeight: 600 }}>Confirm Password</label>
                <div className="input-wrapper" style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                  <input
                    className="linp"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ background: 'transparent', border: 'none' }}
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <IconEye size={18} strokeWidth={1.5} color="#9ca3af" /> : <IconEyeClosed size={18} strokeWidth={1.5} color="#9ca3af" />}
                  </button>
                </div>
              </div>

              <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '12px' }}>Password must contain:</div>
                <CheckItem label="At least 8 characters" checked={hasMinLen} />
                <CheckItem label="One uppercase letter" checked={hasUpper} />
                <CheckItem label="One number" checked={hasNumber} />
                <CheckItem label="Passwords match" checked={passwordsMatch} />
              </div>

              {error && <div style={{ color: '#E24B4A', fontSize: '12px', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
              
              <button className="lbtn" type="submit" disabled={isLoading || !hasMinLen || !hasUpper || !hasNumber || !passwordsMatch} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#1d4ed8', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)', opacity: (hasMinLen && hasUpper && hasNumber && passwordsMatch) ? 1 : 0.6 }}>
                {isLoading ? 'Updating...' : 'Update Password →'}
              </button>
            </form>
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: '64px', height: '64px', background: '#e6fbf0', color: '#00d26a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '32px' }}>
              ✓
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Successfully Updated!</div>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '32px' }}>
              Your password has been updated. You can now log in with your new password.
            </p>
            <button className="lbtn" onClick={handleClose} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#1d4ed8', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ForgotPasswordModal;

