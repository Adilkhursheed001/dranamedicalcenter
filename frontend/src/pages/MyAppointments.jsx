import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

const STATUS_CONFIG = {
  UPCOMING:  { label: 'Upcoming',  color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: '' },
  PAST:      { label: 'Past',      color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: '' },
  COMPLETED: { label: 'Completed', color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  icon: '' },
  CANCELLED: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   icon: '' },
};

const FILTERS = ['ALL', 'UPCOMING', 'PAST', 'COMPLETED', 'CANCELLED'];

export default function MyAppointments() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState(localStorage.getItem('patientPhone') || '');
  const [appointments, setAppointments] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setSearched(false);
    setError('');
    try {
      const res = await axios.get(`/appointments?phone=${encodeURIComponent(phone.trim())}`);
      setAppointments(res.data.appointments || []);
      setPatientName(res.data.name || '');
      setSearched(true);
      localStorage.setItem('patientPhone', phone.trim());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointments.');
      setAppointments([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'ALL'
    ? appointments
    : appointments.filter(a => a.computedStatus === filter);

  const counts = {
    UPCOMING:  appointments.filter(a => a.computedStatus === 'UPCOMING').length,
    PAST:      appointments.filter(a => a.computedStatus === 'PAST').length,
    COMPLETED: appointments.filter(a => a.computedStatus === 'COMPLETED').length,
    CANCELLED: appointments.filter(a => a.computedStatus === 'CANCELLED').length,
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try { return format(parseISO(d), 'EEEE, dd MMMM yyyy'); } catch { return d; }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px', maxWidth: '800px' }}>

        <div style={{ marginBottom: '28px' }}>
          <h1 className="section-title">My Appointments</h1>
          <p className="section-subtitle">Enter your registered phone number to view your bookings</p>
        </div>

        {/* Phone lookup */}
        <form onSubmit={handleLookup} className="lookup-form" style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <input
            type="tel"
            className="form-input"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-submit" disabled={loading} style={{ marginTop: 0, whiteSpace: 'nowrap' }}>
            {loading ? 'Searching…' : 'View Appointments'}
          </button>
        </form>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '12px 16px', color: '#ef4444', marginBottom: '20px', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        {searched && !error && (
          appointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No appointments found</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '8px', marginBottom: '24px' }}>
                No bookings linked to this number.
              </p>
              <button className="btn-submit" style={{ marginTop: 0 }} onClick={() => navigate('/')}>
                Book an Appointment
              </button>
            </div>
          ) : (
            <>
              {patientName && (
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Hello, <strong>{patientName}</strong> 👋 — {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} found
                </p>
              )}

              {/* Stats */}
              <div className="stats-grid" style={{ marginBottom: '24px' }}>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <div key={key} className="stat-card" style={{ padding: '16px', borderLeft: `3px solid ${cfg.color}` }}>
                    <div className="stat-num" style={{ color: cfg.color, fontSize: '1.6rem' }}>{counts[key]}</div>
                    <div className="stat-label">{cfg.label}</div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {FILTERS.map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: '7px 16px', borderRadius: '20px', border: '1px solid', cursor: 'pointer',
                    fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize', transition: 'all 0.2s',
                    borderColor: filter === f ? 'var(--accent)' : 'var(--border)',
                    background: filter === f ? 'var(--accent-light)' : 'transparent',
                    color: filter === f ? 'var(--accent)' : 'var(--text-muted)',
                  }}>
                    {f === 'ALL' ? `All (${appointments.length})` : `${STATUS_CONFIG[f]?.icon} ${f.charAt(0) + f.slice(1).toLowerCase()} (${counts[f]})`}
                  </button>
                ))}
              </div>

              {/* List */}
              {filtered.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>
                  No {filter.toLowerCase()} appointments.
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '14px' }}>
                  {filtered.map(appt => {
                    const cfg = STATUS_CONFIG[appt.computedStatus] || STATUS_CONFIG.PAST;
                    return (
                      <div key={appt.id} className="appt-card" style={{ borderLeft: `4px solid ${cfg.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <div className="appt-date">Consultation with Dr. S. Parveen</div>
                            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '5px 0' }}>
                              {formatDate(appt.date)}
                              {appt.time && <span style={{ fontWeight: 400, fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '10px' }}>{appt.time}</span>}
                            </div>
                            <span style={{
                              display: 'inline-block', padding: '3px 12px', borderRadius: '12px',
                              fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                              background: cfg.bg, color: cfg.color,
                            }}>
                              {cfg.icon} {cfg.label}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {appt.amountPaid > 0 && (
                              <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
                                ₹{appt.amountPaid} Paid
                              </div>
                            )}
                            <div>Booked on</div>
                            <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                              {format(new Date(appt.createdAt), 'dd MMM yyyy')}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
}
