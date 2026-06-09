import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { authService } from '../../services/authService';
import { APP_CONFIG } from '../../config';
import { IconEye, IconEyeClosed } from '@tabler/icons-react';

const ForgotPasswordModal = ({ isOpen, onClose, tab = 'student' }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

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
      setSuccess('If an account exists, a reset code has been sent.');
      setTimeout(() => {
        setSuccess('');
        setStep(2);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to send reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    setIsLoading(true);
    try {
      const fullEmail = tab === 'student' ? `${email.trim()}${APP_CONFIG.DEFAULT_DOMAIN}` : email.trim();
      const response = await authService.verifyResetOtp(fullEmail, code);
      const data = response.data || response;
      setResetToken(data.resetToken);
      setStep(3); // Step 3 is now enter new password
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
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
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
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setResetToken('');
    setError('');
    setSuccess('');
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className="modal-content" 
        style={{ padding: '32px', maxWidth: '400px', width: '92vw' }}
        onClick={(e) => e.stopPropagation()}
      >
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#1a1560' }}>Reset Your Password</div>
              <button 
                onClick={handleClose} 
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888', lineHeight: 1 }}
              >×</button>
            </div>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px', lineHeight: 1.5 }}>
              Enter your email address and we'll send you a password reset link.
            </p>
            <form onSubmit={handleSendLink}>
              <div className="lfld" style={{ marginBottom: '20px' }}>
                <label className="lbl">{tab === 'student' ? 'Username' : 'Email Address'}</label>
                {tab === 'student' ? (
                  <div className="email-composite">
                    <input
                      className="linp"
                      type="text"
                      placeholder="24cpeb04"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase().replace(/\s/g, ''))}
                      required
                    />
                    <div className="email-domain-suffix">{APP_CONFIG.DEFAULT_DOMAIN}</div>
                  </div>
                ) : (
                  <input
                    className="linp"
                    type="email"
                    placeholder="name@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    required
                  />
                )}
              </div>
              {error && <div style={{ color: '#E24B4A', fontSize: '12px', marginBottom: '16px' }}>{error}</div>}
              {success && <div style={{ color: '#0F6E56', fontSize: '12px', marginBottom: '16px', background: '#E1F5EE', padding: '10px', borderRadius: '8px' }}>{success}</div>}
              <button className="lbtn" type="submit" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#1a1560' }}>Verify Code</div>
              <button 
                onClick={handleClose} 
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888', lineHeight: 1 }}
              >×</button>
            </div>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px', lineHeight: 1.5 }}>
              Enter the 6-digit verification code sent to your email.
            </p>
            <form onSubmit={handleVerifyOtp}>
              <div className="lfld" style={{ marginBottom: '16px' }}>
                <label className="lbl">Verification Code</label>
                <input
                  className="linp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              {error && <div style={{ color: '#E24B4A', fontSize: '12px', marginBottom: '16px' }}>{error}</div>}
              <button className="lbtn" type="submit" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#1a1560' }}>New Password</div>
              <button 
                onClick={handleClose} 
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888', lineHeight: 1 }}
              >×</button>
            </div>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px', lineHeight: 1.5 }}>
              Please enter your new password.
            </p>
            <form onSubmit={handleResetPassword}>
              <div className="lfld" style={{ marginBottom: '16px' }}>
                <label className="lbl">New Password</label>
                <div className="input-wrapper">
                  <input
                    className="linp"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showNewPassword ? <IconEye size={18} strokeWidth={1.5} /> : <IconEyeClosed size={18} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>
              <div className="lfld" style={{ marginBottom: '20px' }}>
                <label className="lbl">Confirm Password</label>
                <div className="input-wrapper">
                  <input
                    className="linp"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? <IconEye size={18} strokeWidth={1.5} /> : <IconEyeClosed size={18} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>
              {error && <div style={{ color: '#E24B4A', fontSize: '12px', marginBottom: '16px' }}>{error}</div>}
              <button className="lbtn" type="submit" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: '48px', height: '48px', background: '#E1F5EE', color: '#0F6E56', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px' }}>
              ✓
            </div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#1a1560', marginBottom: '8px' }}>Success!</div>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>
              Your password has been updated successfully.
            </p>
            <button className="lbtn" onClick={handleClose}>
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
