import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setOpen(false);
  };

  const close = () => setOpen(false);

  return (
    <nav className="navbar">
      <div className="container">
        <NavLink to="/" className="nav-brand" onClick={close}>
          <span>Dr. Ana Medical Center</span>
        </NavLink>

        {/* Desktop links */}
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Home</NavLink>
          <NavLink to="/gallery" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Gallery</NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>About</NavLink>
          <NavLink to="/contact" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Contact Us</NavLink>
          <NavLink to="/my-appointments" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>My Appointments</NavLink>
          {user && (
            <button className="btn-submit" style={{ padding: '8px 16px', fontSize: '0.8rem', marginTop: 0 }} onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>

        {/* Hamburger button — mobile only */}
        <button className="hamburger" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
          <span className={`ham-line ${open ? 'open' : ''}`} />
          <span className={`ham-line ${open ? 'open' : ''}`} />
          <span className={`ham-line ${open ? 'open' : ''}`} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="mobile-menu">
          <NavLink to="/" className="mobile-link" onClick={close}>Home</NavLink>
          <NavLink to="/gallery" className="mobile-link" onClick={close}>Gallery</NavLink>
          <NavLink to="/about" className="mobile-link" onClick={close}>About</NavLink>
          <NavLink to="/contact" className="mobile-link" onClick={close}>Contact Us</NavLink>
          <NavLink to="/my-appointments" className="mobile-link" onClick={close}>My Appointments</NavLink>
          {user && (
            <button className="mobile-link" style={{ background: 'none', border: 'none', textAlign: 'left', color: 'var(--danger)', fontWeight: 600, cursor: 'pointer', padding: '14px 20px', width: '100%' }} onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
