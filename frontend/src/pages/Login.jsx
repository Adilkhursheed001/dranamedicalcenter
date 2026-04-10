import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Use state from navigation or default to sign up
  const [isLogin, setIsLogin] = useState(location.state?.isLogin ?? false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // Update mode when navigation state changes
  useEffect(() => {
    if (location.state?.isLogin !== undefined) {
      setIsLogin(location.state.isLogin);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleaned = phone.replace(/\s+/g, '').trim();
    if (cleaned.length < 7) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      // The backend /login route handles both registration and login
      const res = await axios.post('/login', { 
        phone: cleaned, 
        name: isLogin ? undefined : name 
      });
      
      login(res.data.user, res.data.token);
      toast.success(isLogin ? `Welcome back${res.data.user.name ? ', ' + res.data.user.name : ''}! 👋` : 'Sign up successful! 👋');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card animate-fadeUp">
        <div className="login-logo">
          <div className="logo-icon">🏥</div>
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Login to manage your appointments' : 'Sign up to start booking consultations'}</p>
        </div>

        {/* Mode Toggle Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
          <button 
            type="button"
            onClick={() => setIsLogin(false)}
            style={{ 
              flex: 1, padding: '10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              background: !isLogin ? 'var(--accent)' : 'transparent',
              color: !isLogin ? '#fff' : 'var(--text-muted)'
            }}
          >
            Sign Up
          </button>
          <button 
            type="button"
            onClick={() => setIsLogin(true)}
            style={{ 
              flex: 1, padding: '10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              background: isLogin ? 'var(--accent)' : 'transparent',
              color: isLogin ? '#fff' : 'var(--text-muted)'
            }}
          >
            Login
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {!isLogin && (
            <div className="form-group animate-fadeIn">
              <label className="form-label" htmlFor="name-input">Full Name</label>
              <input
                id="name-input"
                type="text"
                className="form-input"
                placeholder="e.g. Riya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="phone-input">Phone Number</label>
            <input
              id="phone-input"
              type="tel"
              className="form-input"
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoFocus
            />
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ marginTop: '8px', width: '100%' }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 18, height: 18, margin: 0, borderWidth: '2px' }} />
                Processing…
              </>
            ) : (
              <>{isLogin ? 'Login' : 'Register'} →</>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"} 
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, marginLeft: '5px', cursor: 'pointer' }}
          >
            {isLogin ? 'Sign up now' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
}
