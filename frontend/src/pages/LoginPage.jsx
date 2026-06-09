import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordModal from '../components/modals/ForgotPasswordModal';
import OtpVerificationModal from '../components/modals/OtpVerificationModal';
import { IconArrowLeft, IconUser, IconShieldLock, IconLogin, IconMail, IconLock, IconEye, IconEyeClosed } from '@tabler/icons-react';
import logo from '../assets/kju_campus_logo.png';
import '../styles/login.css';
import { APP_CONFIG } from '../config';

const LoginPage = () => {
  const [tab, setTab] = useState('student'); // 'student' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleTabChange = (newTab) => {
    if (tab !== newTab) {
      setTab(newTab);
      setEmail('');
      setError('');
    }
  };

  const handleOtpSuccess = () => {
    setIsOtpModalOpen(false);
    const savedRole = localStorage.getItem('cs_role');
    if (savedRole === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/app/dashboard');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        throw new Error('Please enter both email and password.');
      }

      const fullEmail = tab === 'student' ? `${email.trim()}${APP_CONFIG.DEFAULT_DOMAIN}` : email.trim();
      const userData = await login(fullEmail, password, tab);

      if (userData && userData.emailVerified === false) {
        setUnverifiedEmail(fullEmail);
        setIsOtpModalOpen(true);
        return;
      }
      
      const savedRole = localStorage.getItem('cs_role');
      if (savedRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/app/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="auth-page" style={{ minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', padding: '16px', boxSizing: 'border-box' }}>
      <Link to="/" className="auth-back-link" style={{ position: 'absolute', top: '32px', left: '32px' }}>
        <IconArrowLeft size={18} />
        Back
      </Link>
      
      {/* Top flex spacer for vertical centering without top-cropping */}
      <div style={{ flex: 1, minHeight: '32px' }} />

      <div className="auth-container" style={{ 
        width: '100%', 
        maxWidth: '520px',
        boxSizing: 'border-box'
      }}>
        <div className="auth-card fade-in">
          <div className="login-header">
            <div className="login-logo-group">
              <img src={logo} alt="CampusSkills Logo" style={{ width: '48px', height: '48px' }} />
              <div className="login-brand-text">
                <div className="brand-title">Campus<span>Skills</span></div>
                <div className="brand-subtitle">Kristu Jayanti University</div>
              </div>
            </div>
            <h1 className="login-heading">Sign in to your account</h1>
          </div>
          
          <div className="login-type-label">Select Login Type</div>
          
          <div className="login-type-selector">
            <div 
              className={`type-card ${tab === 'student' ? 'active' : ''}`}
              onClick={() => handleTabChange('student')}
            >
              <div className="type-icon">
                <IconUser size={24} />
              </div>
              <div className="type-title">Student</div>
              <div className="type-desc">College account login</div>
            </div>
            <div 
              className={`type-card ${tab === 'admin' ? 'active' : ''}`}
              onClick={() => handleTabChange('admin')}
            >
              <div className="type-icon">
                <IconShieldLock size={24} />
              </div>
              <div className="type-title">Admin</div>
              <div className="type-desc">Authorized access only</div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="lfld">
              <label className="lbl">{tab === 'student' ? 'College Username' : 'Admin Email Address'}</label>
              <div className="input-wrapper">
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
                    placeholder="admin@kristujayanti.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    required
                  />
                )}
              </div>
            </div>
            <div className="lfld">
              <label className="lbl">Password</label>
              <div className="input-wrapper">
                <input
                  className="linp"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <IconEye size={18} strokeWidth={1.5} /> : <IconEyeClosed size={18} strokeWidth={1.5} />}
                </button>
              </div>
              <div className="forgot-pwd-container">
                <a onClick={() => setIsForgotOpen(true)} className="forgot-pwd-link">
                  Forgot Password?
                </a>
              </div>
            </div>
            
            <button className="lbtn" type="submit" disabled={isLoading}>
              {isLoading ? 'Signing In...' : (
                tab === 'admin' ? (
                  <><IconLogin size={18} /> Sign In as Admin</>
                ) : 'Sign In'
              )}
            </button>
            


            {error && (
              <div className="login-err">
                {error}
              </div>
            )}
          </form>

          <div className="auth-footer">
            <div className="footer-divider">
              <span>New to CampusSkills?</span>
            </div>
            <a className="create-account-link" onClick={() => navigate('/setup')}>
              {tab === 'student' ? 'Create a student account' : 'Create an account'}
            </a>
          </div>
        </div>
      </div>
      
      {/* Bottom flex spacer */}
      <div style={{ flex: 1, minHeight: '32px' }} />
      
      <ForgotPasswordModal 
        isOpen={isForgotOpen} 
        onClose={() => setIsForgotOpen(false)} 
        tab={tab}
      />
      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSuccess={handleOtpSuccess}
        email={unverifiedEmail}
      />
    </div>
  );
};

export default LoginPage;
