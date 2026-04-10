import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function BookAppointment() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Please login first');
      navigate('/login');
    }
  }, [user, navigate]);

  const handleBook = async () => {
    setBooking(true);
    try {
      await axios.post('/book', {}, { headers: { Authorization: `Bearer ${token}` } });
      setBooked(true);
      toast.success('Appointment request sent! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (booked) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: 560, padding: '60px 20px' }}>
          <div className="glass-card animate-fadeUp" style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Request Received!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>
              The clinic will contact you shortly to confirm your appointment time.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setBooked(false)}>
                Book Another
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/my-appointments')}>
                View My Appointments
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 560, paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="glass-card animate-fadeUp" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏥</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Book a Consultation</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px' }}>
            Submit your request and the clinic will call you to confirm the appointment time.
          </p>

          {user && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 18px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Booking as</div>
              <div style={{ fontWeight: 700 }}>{user.name || 'Patient'}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.phone}</div>
            </div>
          )}

          <div className="info-note" style={{ marginBottom: '24px' }}>
            📞 The clinic will contact you to schedule a convenient time.
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={handleBook}
            disabled={booking}
          >
            {booking ? 'Submitting…' : '✅ Request Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
}
