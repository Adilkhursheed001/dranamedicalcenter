const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { formatAppointment, updateAppointmentStatus } = require('../services/appointment.service');

// Admin auth middleware
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No admin token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) return res.status(403).json({ message: 'Access denied: Admin only' });
    next();
  } catch {
    return res.status(401).json({ message: 'Session expired or invalid' });
  }
};

router.use(verifyAdmin);

// GET /admin/appointments
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: { patient: { select: { id: true, phone: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(appointments.map(a => ({
      ...formatAppointment(a),
      _id: a.id,
      userId: { _id: a.patient.id, phone: a.patient.phone, name: a.patient.name },
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /admin/appointments/:id/status — strict transition: BOOKED → CANCELLED | COMPLETED
router.patch('/appointments/:id/status', async (req, res) => {
  try {
    const updated = await updateAppointmentStatus(req.params.id, req.body.status);
    res.json({ ...updated, _id: updated.id });
  } catch (err) {
    if (err.code === 400) return res.status(400).json({ message: err.message });
    if (err.code === 404) return res.status(404).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /admin/appointments/:id — legacy endpoint (kept for existing admin panel calls)
router.patch('/appointments/:id', async (req, res) => {
  try {
    const updated = await updateAppointmentStatus(req.params.id, req.body.status);
    res.json({ ...updated, _id: updated.id });
  } catch (err) {
    if (err.code === 400) return res.status(400).json({ message: err.message });
    if (err.code === 404) return res.status(404).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /admin/patients
router.get('/patients', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      include: { _count: { select: { appointments: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
