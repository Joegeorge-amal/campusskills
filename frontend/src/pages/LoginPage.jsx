import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordModal from '../components/modals/ForgotPasswordModal';
import { IconArrowLeft, IconUser, IconShieldLock, IconLogin, IconMail, IconLock, IconEye, IconEyeClosed } from '@tabler/icons-react';
import logo from '../assets/kju_campus_logo.png';
import '../styles/login.css';

const LoginPage = () => {
  const [tab, setTab] = useState('student'); // 'student' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        throw new Error('Please enter both email and password.');
      }

      await login(email, password);

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
              onClick={() => setTab('student')}
            >
              <div className="type-icon">
                <IconUser size={24} />
              </div>
              <div className="type-title">Student</div>
              <div className="type-desc">College account login</div>
            </div>
            <div 
              className={`type-card ${tab === 'admin' ? 'active' : ''}`}
              onClick={() => setTab('admin')}
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
              <label className="lbl">College Email Address</label>
              <div className="input-wrapper">
                <IconMail className="input-icon" size={20} strokeWidth={1.5} />
                <input
                  className="linp with-icon"
                  type="email"
                  placeholder={tab === 'student' ? "yourname@kristujayanti.com" : "admin@kristujayanti.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="lfld">
              <label className="lbl">Password</label>
              <div className="input-wrapper">
                <IconLock className="input-icon" size={20} strokeWidth={1.5} />
                <input
                  className="linp with-icon"
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
              <IconLogin size={20} style={{ transform: 'scaleX(-1)' }} />
              {isLoading ? 'Signing In...' : `Sign In as ${tab === 'student' ? 'Student' : 'Admin'}`}
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
              {tab === 'student' ? 'Create an Account' : 'Create a student account'}
            </a>
          </div>
        </div>
      </div>
      
      {/* Bottom flex spacer */}
      <div style={{ flex: 1, minHeight: '32px' }} />
      
      <ForgotPasswordModal 
        isOpen={isForgotOpen} 
        onClose={() => setIsForgotOpen(false)} 
      />
    </div>
  );
};

export default LoginPage;
