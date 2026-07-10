import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const [otp, setOtp] = useState('');
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

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post(`/auth/invites/verify`, { token, otp });
      alert("Account created successfully. Please login.");
      navigate('/admin/login');
    } catch (err) {
      alert(err.response?.data?.error || "Invalid OTP");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <p>Loading invitation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ color: '#dc2626', margin: '0 0 16px 0' }}>Invalid Invitation</h2>
          <p style={{ color: '#4b5563', margin: '0 0 24px 0' }}>{error}</p>
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', maxWidth: '450px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Accept Invitation</h2>
          <p style={{ margin: 0, color: '#6b7280' }}>
            You've been invited to join CampusSkills as an <strong style={{ color: '#4f46e5' }}>{inviteData?.role}</strong>.
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSetup}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Email</label>
              <input 
                type="text" 
                value={inviteData?.email}
                disabled
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#f3f4f6', color: '#6b7280' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Full Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
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
              <p style={{ margin: '0 0 16px 0', color: '#4b5563' }}>
                We've sent a 6-digit verification code to <strong>{inviteData?.email}</strong>.
              </p>
              <input 
                type="text" 
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                maxLength={6}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', textAlign: 'center', fontSize: '20px', letterSpacing: '2px' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={submitting}
              style={{ width: '100%', padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer' }}
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
