import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('/admin/appointments')
      .then(res => setAppointments(res.data))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/admin/appointments/${id}`, { status });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
      toast.success(`Marked as ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const filtered = appointments
    .filter(a => filter === 'all' || a.status === filter)
    .filter(a => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (a.name || a.userId?.name || '').toLowerCase().includes(q) ||
        (a.phone || a.userId?.phone || '').includes(q)
      );
    });

  const counts = {
    total: appointments.length,
    booked: appointments.filter(a => a.status === 'booked').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    try { return format(parseISO(d), 'dd MMM yyyy'); } catch { return d; }
  };

  if (loading) return (
    <div className="page-wrapper"><div className="loading-wrapper"><div className="spinner" /></div></div>
  );

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 className="section-title">Admin Dashboard</h1>
          <p className="section-subtitle">Dr. Ana Medical Center — All Appointment Requests</p>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          <StatCard num={counts.total}     label="Total"     color="var(--accent)" />
          <StatCard num={counts.booked}    label="Pending"   color="var(--success)" />
          <StatCard num={counts.completed} label="Completed" color="#6366f1" />
          <StatCard num={counts.cancelled} label="Cancelled" color="var(--danger)" />
        </div>

        {/* Filters + Search */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', 'booked', 'completed', 'cancelled'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`tab-btn ${filter === f ? 'active' : ''}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: '240px', padding: '8px 14px', fontSize: '0.85rem' }}
          />
        </div>

        <div className="admin-detail-grid" style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: '20px', alignItems: 'start' }}>

          {/* Table */}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient Name</th>
                  <th>Phone</th>
                  <th>Preferred Date</th>
                  <th>Booked On</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No appointments found.</td></tr>
                ) : filtered.map((appt, i) => (
                  <tr
                    key={appt._id}
                    onClick={() => setSelected(selected?._id === appt._id ? null : appt)}
                    style={{ cursor: 'pointer', background: selected?._id === appt._id ? 'var(--accent-light)' : '' }}
                  >
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{appt.name || appt.userId?.name || '—'}</td>
                    <td style={{ fontSize: '0.85rem' }}>{appt.phone || appt.userId?.phone || '—'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{fmtDate(appt.date)}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{format(new Date(appt.createdAt), 'dd MMM yyyy')}</td>
                    <td>
                      {appt.amountPaid
                        ? <span style={{ color: 'var(--success)', fontWeight: 700 }}>₹{appt.amountPaid}</span>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td>
                      <span className={`status-chip status-${appt.status}`}>{appt.status}</span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn-icon" title="Mark Completed" onClick={() => updateStatus(appt._id, 'completed')}>✓</button>
                        <button className="btn-icon btn-icon-danger" title="Cancel" onClick={() => updateStatus(appt._id, 'cancelled')}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail Panel */}
          {selected && (
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', position: 'sticky', top: '88px', boxShadow: 'var(--shadow)' }}>
              {/* Panel header */}
              <div style={{ background: 'var(--accent)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Patient Details</span>
                <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>

              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '0' }}>
                <Row label="Full Name"       value={selected.name || selected.userId?.name || '—'} bold />
                <Row label="Phone Number"    value={selected.phone || selected.userId?.phone || '—'} />
                <Row label="Preferred Date"  value={selected.date ? format(parseISO(selected.date), 'EEEE, dd MMMM yyyy') : '—'} accent />
                <Row label="Booked On"       value={format(new Date(selected.createdAt), 'dd MMM yyyy, hh:mm a')} />
                <Row label="Amount Paid"     value={selected.amountPaid ? `₹${selected.amountPaid}` : '—'} accent />
                <Row label="Payment ID"      value={selected.paymentId || '—'} small />
                <Row label="Current Status">
                  <span className={`status-chip status-${selected.status}`}>{selected.status}</span>
                </Row>
              </div>

              {/* Actions */}
              <div style={{ padding: '0 20px 20px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => updateStatus(selected._id, 'completed')}
                  disabled={selected.status === 'completed'}
                  style={{ flex: 1, padding: '10px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', opacity: selected.status === 'completed' ? 0.5 : 1 }}
                >
                  ✓ Mark Completed
                </button>
                <button
                  onClick={() => updateStatus(selected._id, 'cancelled')}
                  disabled={selected.status === 'cancelled'}
                  style={{ flex: 1, padding: '10px', background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', opacity: selected.status === 'cancelled' ? 0.5 : 1 }}
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold, accent, small, children }) {
  return (
    <div style={{ padding: '11px 0', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
      {children || (
        <span style={{
          fontSize: small ? '0.75rem' : '0.9rem',
          fontWeight: bold ? 700 : accent ? 600 : 400,
          color: accent ? 'var(--accent)' : 'var(--text-primary)',
          wordBreak: 'break-all',
        }}>
          {value}
        </span>
      )}
    </div>
  );
}

function StatCard({ num, label, color }) {
  return (
    <div className="stat-card">
      <div className="stat-num" style={{ color }}>{num}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
