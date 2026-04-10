import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import profileImg from '../assets/profile2.png';

export default function Home() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', date: '' });
  const [booking, setBooking] = useState(false);
  const [bookedInfo, setBookedInfo] = useState(null); // stores { date, name }
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBooking(true);

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    try {
      const userRes = await axios.post('/auth/login', {
        phone: formData.phone,
        name: fullName,
      });

      const token = userRes.data.token;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const orderRes = await axios.post('/payment/create-order', {
        name: fullName,
        phone: formData.phone,
        date: formData.date,
      });

      const { orderId, amount, currency, keyId } = orderRes.data;
      const capturedDate = formData.date;
      const capturedPhone = formData.phone;

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Dr. Ana Medical Center',
        description: `Consultation — ${formData.date}`,
        order_id: orderId,
        prefill: { name: fullName, contact: formData.phone },
        theme: { color: '#2563eb' },
        handler: async (response) => {
          try {
            await axios.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              date: capturedDate,
              name: fullName,
              phone: capturedPhone,
            });

            // store phone in localStorage for My Appointments lookup
            localStorage.setItem('patientPhone', capturedPhone);

            setBookedInfo({ date: capturedDate, name: fullName });
            setFormData({ firstName: '', lastName: '', phone: '', date: '' });
          } catch {
            toast.error('Payment verification failed. Please contact the clinic.');
          } finally {
            setBooking(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled.', { icon: 'ℹ️' });
            setBooking(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
      setBooking(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  // Format date nicely
  const formatDate = (d) => {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    return new Date(y, m - 1, day).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="page-wrapper">
      <div className="container animate-fadeUp">
        <div className="hero-section">

          <div className="hero-left">
            <p className="doctor-bio">
              <b>Dr S. Parveen (Consultant Gynecologist and Physician)</b> brings over 13 years of
              expertise to her practice. She provides comprehensive care for pregnancy, maternal
              health, and complex gynecological issues.
            </p>

            <div className="consult-badge">📋 Consultation by Appointment Only</div>

            <div className="clinic-timings">
              <div className="timings-title">🕐 Clinic Timings</div>
              <div className="timings-row">
                <div>
                  <div className="timings-label">Morning</div>
                  <div className="timings-time">10:00 AM – 1:00 PM</div>
                </div>
              </div>
              <div className="timings-divider" />
              <div className="timings-row">
                <div>
                  <div className="timings-label">Evening</div>
                  <div className="timings-time">6:00 PM – 9:00 PM</div>
                </div>
              </div>
            </div>

            {bookedInfo ? (
              <div className="success-card animate-fadeUp">
                <div className="success-icon">✓</div>
                <h3 className="success-title">Your appointment has been booked</h3>
                <p className="success-sub">Consultation with <strong>Dr. S. Parveen</strong>, Dr. Ana Medical Center</p>
                <p className="success-date">{formatDate(bookedInfo.date)}</p>
                <button className="btn-submit" style={{ marginTop: '8px' }} onClick={() => navigate('/my-appointments')}>
                  Return to Appointments
                </button>
              </div>
            ) : (
              <form className="appointment-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label className="form-label">First Name <span>*</span></label>
                    <input type="text" name="firstName" className="form-input" required value={formData.firstName} onChange={handleChange} />
                  </div>
                  <div className="form-group flex-1">
                    <label className="form-label">Last Name <span>*</span></label>
                    <input type="text" name="lastName" className="form-input" required value={formData.lastName} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label className="form-label">Phone Number <span>*</span></label>
                    <input type="tel" name="phone" className="form-input" required value={formData.phone} onChange={handleChange} placeholder="+91" />
                  </div>
                  <div className="form-group flex-1">
                    <label className="form-label">Preferred Date <span>*</span></label>
                    <input
                      type="date"
                      name="date"
                      className="form-input"
                      required
                      value={formData.date}
                      onChange={handleChange}
                      min={today}
                    />
                  </div>
                </div>

                <div className="fee-note">
                  💳 Consultation Fee: <strong>₹400</strong>
                </div>

                <button type="submit" className="btn-submit" disabled={booking}>
                  {booking ? 'Processing...' : 'Book Appointment'}
                </button>
              </form>
            )}
          </div>

          <div className="hero-right">
            <div className="profile-img-container">
              <img src={profileImg} alt="Dr. S. Parveen" className="profile-img" />
              <div className="profile-img-overlay">
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>Dr. S. Parveen</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Senior Consultant Gynecologist</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
