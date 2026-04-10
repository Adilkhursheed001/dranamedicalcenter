const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

// POST /login — find or create patient by phone, return JWT
router.post('/login', async (req, res) => {
  try {
    const { phone, name } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    const cleaned = phone.replace(/\s+/g, '').trim();
    if (cleaned.length < 7) return res.status(400).json({ message: 'Invalid phone number' });

    let patient = await prisma.patient.findUnique({ where: { phone: cleaned } });

    if (!patient) {
      patient = await prisma.patient.create({ data: { phone: cleaned, name: name || '' } });
    } else if (name && !patient.name) {
      patient = await prisma.patient.update({ where: { id: patient.id }, data: { name } });
    }

    const token = jwt.sign({ userId: patient.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { _id: patient.id, phone: patient.phone, name: patient.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /login/admin-login — admin login with password only
router.post('/admin-login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const admin = await prisma.admin.findUnique({ where: { username: 'admin' } });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ message: 'Incorrect password' });

    const token = jwt.sign({ isAdmin: true, adminId: admin.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, isAdmin: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
