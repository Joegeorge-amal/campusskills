import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordModal from '../components/modals/ForgotPasswordModal';
import { IconArrowLeft, IconUser, IconShieldLock } from '@tabler/icons-react';
import '../styles/login.css';

const LoginPage = () => {
  const [tab, setTab] = useState('student'); // 'student' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
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

  const handleGoogleLogin = () => {
    navigate('/setup'); // For the demo, going to setup simulating new Google user
  };

  return (
    <div className="auth-page">
      <Link to="/" className="auth-back-link">
        <IconArrowLeft size={18} />
        Back
      </Link>
      
      <div className="auth-container">
        <div className="auth-card fade-in">
          <div className="login-header">
            <div className="login-logo-group">
              <div className="login-mark">cs</div>
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
              <input
                className="linp"
                type="email"
                placeholder={tab === 'student' ? "yourname@kristujayanti.com" : "admin@kristujayanti.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="lfld">
              <label className="lbl">Password</label>
              <input
                className="linp"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="forgot-pwd-container">
                <a onClick={() => setIsForgotOpen(true)} className="forgot-pwd-link">
                  Forgot Password?
                </a>
              </div>
            </div>
            
            <button className="lbtn" type="submit" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
            
            <div className="ldiv">or continue with</div>
            
            <button type="button" className="gbtn" onClick={handleGoogleLogin}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" width="18" height="18" />
              Sign in with Google
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
            <a className="create-account-link" onClick={handleGoogleLogin}>
              {tab === 'student' ? 'Create an Account' : 'Create a student account'}
            </a>
          </div>
        </div>
      </div>

      <ForgotPasswordModal 
        isOpen={isForgotOpen} 
        onClose={() => setIsForgotOpen(false)} 
      />
    </div>
  );
};

export default LoginPage;
