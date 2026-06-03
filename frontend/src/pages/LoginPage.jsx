import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordModal from '../components/modals/ForgotPasswordModal';
import { IconShieldCheck } from '@tabler/icons-react';

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

      // We let AppRoutes handle the exact path redirect since context updates synchronously-ish, 
      // but if we want a hard redirect:
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
    <div id="s-login" className="auth-page">
      <div className="bg-circle bg-circle-1"></div>
      <div className="bg-circle bg-circle-2"></div>
      
      <div className="auth-container">
        <div className="auth-card fade-in">
        <div className="login-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div className="login-mark">CS</div>
          <div className="login-brand" style={{ fontSize: '24px', fontWeight: 700, color: '#1a1560', letterSpacing: '-0.5px' }}>
            CAMPUS<span>SKILLS</span>
          </div>
        </div>
        
        <p className="login-sub" style={{ fontSize: '15px', color: '#666', marginTop: '-16px', marginBottom: '32px' }}>
          Your college skill exchange platform
        </p>
        
        <div className="ltabs">
          <div 
            className={`ltab ${tab === 'student' ? 'active' : ''}`}
            onClick={() => setTab('student')}
          >
            Student
          </div>
          <div 
            className={`ltab ${tab === 'admin' ? 'active' : ''}`}
            onClick={() => setTab('admin')}
          >
            Admin
          </div>
        </div>

        <form onSubmit={handleLogin}>
          {tab === 'student' ? (
            <div>
              <div className="lfld">
                <label className="lbl">College email address</label>
                <input
                  className="linp"
                  type="email"
                  placeholder="student@college.edu"
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
              </div>
              <div style={{ textAlign: 'right', marginBottom: '16px', marginTop: '-4px' }}>
                <a onClick={() => setIsForgotOpen(true)} style={{ fontSize: '12px', color: '#534AB7', cursor: 'pointer', fontWeight: 500, textDecoration: 'none' }}>
                  Forgot Password?
                </a>
              </div>
              <button className="lbtn" type="submit" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login as Student'}
              </button>
              
              <div className="ldiv">or continue with</div>
              
              <button type="button" className="gbtn" onClick={handleGoogleLogin}>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" width="18" height="18" />
                Login with Google
              </button>
            </div>
          ) : (
            <div>
              <div className="lfld">
                <label className="lbl">Admin email</label>
                <input
                  className="linp"
                  type="email"
                  placeholder="admin@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="lfld">
                <label className="lbl">Admin password</label>
                <input
                  className="linp"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div style={{ textAlign: 'right', marginBottom: '16px', marginTop: '-4px' }}>
                <a onClick={() => setIsForgotOpen(true)} style={{ fontSize: '12px', color: '#534AB7', cursor: 'pointer', fontWeight: 500, textDecoration: 'none' }}>
                  Forgot Password?
                </a>
              </div>
              <button className="lbtn" type="submit" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login as Admin'}
              </button>
            </div>
          )}

          {error && (
            <div className="login-err">
              {error}
            </div>
          )}
        </form>

        {tab === 'student' && (
          <div className="lft">
            Don't have an account? <a onClick={handleGoogleLogin}>Create Account</a>
          </div>
        )}
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
