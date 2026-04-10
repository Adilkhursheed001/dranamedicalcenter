require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./lib/prisma');

const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctor');
const appointmentRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Routes
app.use('/login', authRoutes);
app.use('/auth', authRoutes);       // alias so frontend /auth/admin-login works
app.use('/doctor', doctorRoutes);
app.use('/', appointmentRoutes);
app.use('/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', db: 'prisma/postgresql' }));

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected via Prisma');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
}

start();
