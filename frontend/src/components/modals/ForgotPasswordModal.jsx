import React, { useState } from 'react';
import ReactDOM from 'react-dom';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSendLink = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setSuccess('Password reset link sent successfully. Please check your email.');
    setTimeout(() => {
      setSuccess('');
      setStep(2);
    }, 1500);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');
    if (code !== '123456') {
      setError('Invalid verification code.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSuccess('Your password has been updated successfully.');
    setStep(3);
  };

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
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
                <label className="lbl">Email Address</label>
                <input
                  className="linp"
                  type="email"
                  placeholder="name@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && <div style={{ color: '#E24B4A', fontSize: '12px', marginBottom: '16px' }}>{error}</div>}
              {success && <div style={{ color: '#0F6E56', fontSize: '12px', marginBottom: '16px', background: '#E1F5EE', padding: '10px', borderRadius: '8px' }}>{success}</div>}
              <button className="lbtn" type="submit">
                Send Reset Link
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
              For this mock demo, use code: <strong>123456</strong>
            </p>
            <form onSubmit={handleResetPassword}>
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
              <div className="lfld" style={{ marginBottom: '16px' }}>
                <label className="lbl">New Password</label>
                <input
                  className="linp"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="lfld" style={{ marginBottom: '20px' }}>
                <label className="lbl">Confirm Password</label>
                <input
                  className="linp"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div style={{ color: '#E24B4A', fontSize: '12px', marginBottom: '16px' }}>{error}</div>}
              <button className="lbtn" type="submit">
                Reset Password
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
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
