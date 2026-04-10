const prisma = require('../lib/prisma');

/**
 * Compute dynamic status from stored status + date/time.
 * CANCELLED and COMPLETED are always returned as-is.
 * BOOKED → UPCOMING if date/time is in future, PAST if in past.
 */
function computeStatus(status, date, time) {
  if (status === 'CANCELLED') return 'CANCELLED';
  if (status === 'COMPLETED') return 'COMPLETED';

  if (!date) return 'UPCOMING'; // no date set, treat as upcoming

  // Build a comparable datetime string; default time to end of day if missing
  const timeStr = time || '23:59';
  const isPm = timeStr.toUpperCase().includes('PM');
  const isAm = timeStr.toUpperCase().includes('AM');

  let hour, minute;
  if (isPm || isAm) {
    // "10:30 AM" / "06:00 PM" format
    const [hm] = timeStr.split(' ');
    [hour, minute] = hm.split(':').map(Number);
    if (isPm && hour !== 12) hour += 12;
    if (isAm && hour === 12) hour = 0;
  } else {
    [hour, minute] = timeStr.split(':').map(Number);
  }

  const [year, month, day] = date.split('-').map(Number);
  const apptDateTime = new Date(year, month - 1, day, hour || 23, minute || 59, 0);

  return apptDateTime > new Date() ? 'UPCOMING' : 'PAST';
}

/**
 * Format a raw appointment row into the API response shape.
 */
function formatAppointment(a) {
  const computedStatus = computeStatus(a.status, a.date, a.time);
  return {
    id: a.id,
    name: a.name || a.patient?.name || '',
    phone: a.phone || a.patient?.phone || '',
    date: a.date,
    time: a.time,
    status: a.status,           // stored status: BOOKED | CANCELLED | COMPLETED
    computedStatus,             // dynamic: UPCOMING | PAST | CANCELLED | COMPLETED
    amountPaid: a.amountPaid,
    paymentId: a.paymentId,
    createdAt: a.createdAt,
  };
}

/**
 * Sort: UPCOMING first (asc by date/time), then PAST (desc), then CANCELLED/COMPLETED.
 */
function sortAppointments(appointments) {
  const order = { UPCOMING: 0, PAST: 1, COMPLETED: 2, CANCELLED: 3 };
  return appointments.sort((a, b) => {
    const oa = order[a.computedStatus] ?? 4;
    const ob = order[b.computedStatus] ?? 4;
    if (oa !== ob) return oa - ob;
    // Within UPCOMING: ascending date
    if (a.computedStatus === 'UPCOMING') return a.date.localeCompare(b.date);
    // Within PAST: descending date
    if (a.computedStatus === 'PAST') return b.date.localeCompare(a.date);
    return 0;
  });
}

/**
 * GET /appointments?phone=XXXXXXXXXX&status=upcoming|past|cancelled|completed
 */
async function getAppointmentsByPhone(phone, statusFilter) {
  const cleaned = phone.replace(/\s+/g, '').trim();
  if (cleaned.length < 7) throw { code: 400, message: 'Invalid phone number' };

  const patient = await prisma.patient.findUnique({
    where: { phone: cleaned },
    include: { appointments: true },
  });

  if (!patient) return { name: '', appointments: [] };

  let formatted = patient.appointments.map(formatAppointment);
  formatted = sortAppointments(formatted);

  if (statusFilter) {
    const f = statusFilter.toUpperCase();
    formatted = formatted.filter(a => a.computedStatus === f);
  }

  return { name: patient.name, appointments: formatted };
}

/**
 * PATCH /appointments/:id/status — admin only
 * Allowed transitions: BOOKED → CANCELLED | COMPLETED
 */
async function updateAppointmentStatus(id, newStatus) {
  const allowed = ['CANCELLED', 'COMPLETED'];
  const normalized = newStatus?.toUpperCase();

  if (!allowed.includes(normalized)) {
    throw { code: 400, message: 'Invalid status. Allowed: CANCELLED, COMPLETED' };
  }

  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) throw { code: 404, message: 'Appointment not found' };

  if (existing.status !== 'BOOKED') {
    throw { code: 400, message: `Cannot update status from ${existing.status}` };
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: normalized },
    include: { patient: { select: { name: true, phone: true } } },
  });

  return formatAppointment(updated);
}

module.exports = { computeStatus, formatAppointment, getAppointmentsByPhone, updateAppointmentStatus };
