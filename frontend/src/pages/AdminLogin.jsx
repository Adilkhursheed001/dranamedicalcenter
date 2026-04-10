import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import profileImg from '../assets/profile2.png';

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/auth/admin-login', { password });
      localStorage.setItem('adminToken', res.data.token);
      onLogin(res.data.token);
      toast.success('Admin authenticated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="admin-login-card">

        {/* Left — login form */}
        <div style={{ background: 'white', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>🛡️</div>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Admin Portal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '32px' }}>
            Enter the admin password to access the dashboard.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="Enter admin password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button className="btn-submit" type="submit" disabled={loading} style={{ width: '100%', textAlign: 'center' }}>
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </button>
          </form>

          <p style={{ marginTop: '24px', fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center' }}>
            Authorized access only. All actions are logged.
          </p>
        </div>

        {/* Right — doctor image */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img
            src={profileImg}
            alt="Dr. S. Parveen"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
          />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
            padding: '24px 20px',
            color: 'white'
          }}>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Dr. S. Parveen</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Senior Consultant Gynecologist</div>
          </div>
        </div>

      </div>
    </div>
  );
}
