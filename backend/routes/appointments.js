const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const { getAppointmentsByPhone, formatAppointment } = require('../services/appointment.service');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const FEE = parseInt(process.env.CONSULTATION_FEE) || 400;
const FEE_PAISE = FEE * 100;

// ─── Payment ────────────────────────────────────────────────────────────────

// POST /payment/create-order
router.post('/payment/create-order', authMiddleware, async (req, res) => {
  try {
    const { name, phone, date, time } = req.body;
    if (!date) return res.status(400).json({ message: 'Preferred date is required' });

    const order = await razorpay.orders.create({
      amount: FEE_PAISE,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: { name, phone, date, time, patientId: req.userId },
    });

    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error('Razorpay order error:', err?.error || err?.message);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
});

// POST /payment/verify
router.post('/payment/verify', authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, date, time, name, phone } = req.body;

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: req.userId,
        name: name || '',
        phone: phone || '',
        date: date || '',
        time: time || '',
        paymentId: razorpay_payment_id,
        amountPaid: FEE,
      },
      include: { patient: { select: { phone: true, name: true } } },
    });

    console.log(`[PAYMENT] ✅ ${appointment.patient.phone} paid ₹${FEE} — ${razorpay_payment_id}`);

    res.status(201).json({
      message: 'Payment successful. Appointment booked!',
      appointment: formatAppointment(appointment),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Patient Routes ──────────────────────────────────────────────────────────

// GET /appointments?phone=XXXXXXXXXX&status=upcoming|past|cancelled|completed
router.get('/appointments', async (req, res) => {
  try {
    const { phone, status } = req.query;
    if (!phone) return res.status(400).json({ message: 'phone query param is required' });

    const result = await getAppointmentsByPhone(phone, status);
    res.json(result);
  } catch (err) {
    if (err.code === 400) return res.status(400).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /my-appointments (auth-based, kept for backward compat)
router.get('/my-appointments', authMiddleware, async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { patientId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(appointments.map(formatAppointment));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
