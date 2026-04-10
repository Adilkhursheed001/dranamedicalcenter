const express = require('express');
const router = express.Router();

// Static doctor profile — single doctor app, no DB needed for this
const DOCTOR = {
  name: 'Dr. S Parveen',
  specialization: 'Senior Consultant Gynecologist',
  qualification: 'MBBS, MS (Obstetrics & Gynecology)',
  experience: 12,
  fees: 700,
  address: 'Suite 101, Bloom Healthcare, Green Park, Delhi - 110016',
  phone: '+91 91234 56789',
  about:
    'Dr. S Parveen is a highly skilled gynecologist with over 12 years of specialized experience in women\'s reproductive health. She provides comprehensive care for pregnancy, maternal health, and complex gynecological issues.',
  image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=600',
  slots: [
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM',
  ],
  availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};

// GET /doctor
router.get('/', (req, res) => {
  res.json(DOCTOR);
});

module.exports = router;
