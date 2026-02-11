import express from 'express';
import { getDb } from '../db/db.js';
import { verifyToken, requireAdmin, requireUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// Helper function to generate 15-minute time slots
function generateTimeSlots(startTime, endTime) {
  const slots = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let currentMin = startMin;
  let currentHour = startHour;

  while (currentHour < endHour || (currentHour === endHour && currentMin <= endMin)) {
    slots.push(`${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`);
    currentMin += 15;
    if (currentMin >= 60) {
      currentMin = 0;
      currentHour += 1;
    }
  }

  return slots;
}

// Get available time slots for a given date and party size
router.get('/availability', async (req, res) => {
  try {
    const { date, partySize, serviceType } = req.query;

    if (!date || !partySize) {
      return res.status(400).json({ error: 'Date and partySize required' });
    }

    const db = getDb();
    
    // Get services
    const services = serviceType 
      ? await db.all('SELECT * FROM services WHERE name = ?', serviceType)
      : await db.all('SELECT * FROM services');

    // Get restaurant settings
    const settings = await db.get('SELECT max_capacity FROM restaurant_settings LIMIT 1');
    const maxCapacity = settings?.max_capacity || 100;

    const availability = [];

    for (const service of services) {
      const slots = generateTimeSlots(service.start_time, service.end_time);
      const serviceSlots = [];

      for (const slot of slots) {
        // Count reserved people for this time slot
        const reservation = await db.get(
          `SELECT SUM(number_of_people) as reserved 
           FROM reservations 
           WHERE reservation_date = ? AND reservation_time = ? AND service_id = ?`,
          [date, slot, service.id]
        );

        const reserved = reservation?.reserved || 0;
        const available = maxCapacity - reserved >= partySize;

        serviceSlots.push({
          time: slot,
          available,
          reserved,
          remaining: Math.max(0, maxCapacity - reserved)
        });
      }

      availability.push({
        service: service.name,
        serviceId: service.id,
        slots: serviceSlots
      });
    }

    res.json(availability);
  } catch (err) {
    console.error('Get availability error:', err);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

// Create reservation (authenticated users only)
router.post('/', verifyToken, requireUser, async (req, res) => {
  try {
    const { date, time, partySize, allergies, serviceId } = req.body;

    if (!date || !time || !partySize || !serviceId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDb();

    // Get restaurant settings
    const settings = await db.get('SELECT max_capacity FROM restaurant_settings LIMIT 1');
    const maxCapacity = settings?.max_capacity || 100;

    // Check availability
    const reservation = await db.get(
      `SELECT SUM(number_of_people) as reserved 
       FROM reservations 
       WHERE reservation_date = ? AND reservation_time = ? AND service_id = ?`,
      [date, time, serviceId]
    );

    const reserved = reservation?.reserved || 0;
    if (reserved + partySize > maxCapacity) {
      return res.status(409).json({ error: 'Not enough available seats for this time slot' });
    }

    // Create user if needed (for guest users)
    let userId = req.user.id;
    let user = await db.get('SELECT id FROM users WHERE account_id = ?', req.user.id);
    
    if (!user) {
      // Create user profile for account
      const result = await db.run(
        `INSERT INTO users (account_id, first_name, last_name) 
         VALUES (?, ?, ?)`,
        [req.user.id, 'Guest', 'User']
      );
      userId = result.lastID;
    } else {
      userId = user.id;
    }

    // Create reservation
    const result = await db.run(
      `INSERT INTO reservations (user_id, service_id, reservation_date, reservation_time, number_of_people, allergies)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, serviceId, date, time, partySize, allergies || null]
    );

    res.status(201).json({
      id: result.lastID,
      date,
      time,
      partySize,
      allergies,
      message: 'Reservation created successfully'
    });
  } catch (err) {
    console.error('Create reservation error:', err);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

// Get user's reservations
router.get('/my-reservations', verifyToken, async (req, res) => {
  try {
    const db = getDb();

    // Get user profile
    const user = await db.get('SELECT id FROM users WHERE account_id = ?', req.user.id);
    
    if (!user) {
      return res.json([]);
    }

    const reservations = await db.all(
      `SELECT r.*, s.name as service_name, s.start_time, s.end_time
       FROM reservations r
       JOIN services s ON r.service_id = s.id
       WHERE r.user_id = ?
       ORDER BY r.reservation_date DESC, r.reservation_time DESC`,
      user.id
    );

    res.json(reservations);
  } catch (err) {
    console.error('Get user reservations error:', err);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// Update user's own reservation
router.put('/:id', verifyToken, requireUser, async (req, res) => {
  try {
    const { date, time, partySize, allergies, serviceId } = req.body;

    if (!date || !time || !partySize || !serviceId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDb();

    // Verify reservation belongs to user
    const user = await db.get('SELECT id FROM users WHERE account_id = ?', req.user.id);
    const reservation = await db.get(
      'SELECT * FROM reservations WHERE id = ? AND user_id = ?',
      [req.params.id, user.id]
    );

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Get restaurant settings for availability check
    const settings = await db.get('SELECT max_capacity FROM restaurant_settings LIMIT 1');
    const maxCapacity = settings?.max_capacity || 100;

    // Check availability (excluding current reservation)
    const reservedCheck = await db.get(
      `SELECT SUM(number_of_people) as reserved 
       FROM reservations 
       WHERE reservation_date = ? AND reservation_time = ? AND service_id = ? AND id != ?`,
      [date, time, serviceId, req.params.id]
    );

    const reserved = reservedCheck?.reserved || 0;
    if (reserved + partySize > maxCapacity) {
      return res.status(409).json({ error: 'Not enough available seats for this time slot' });
    }

    // Update reservation
    await db.run(
      `UPDATE reservations 
       SET reservation_date = ?, reservation_time = ?, service_id = ?, number_of_people = ?, allergies = ?
       WHERE id = ?`,
      [date, time, serviceId, partySize, allergies || null, req.params.id]
    );

    res.json({
      id: req.params.id,
      date,
      time,
      partySize,
      allergies,
      message: 'Reservation updated successfully'
    });
  } catch (err) {
    console.error('Update reservation error:', err);
    res.status(500).json({ error: 'Failed to update reservation' });
  }
});

// Delete user's own reservation
router.delete('/:id', verifyToken, requireUser, async (req, res) => {
  try {
    const db = getDb();

    // Verify reservation belongs to user
    const user = await db.get('SELECT id FROM users WHERE account_id = ?', req.user.id);
    const reservation = await db.get(
      'SELECT * FROM reservations WHERE id = ? AND user_id = ?',
      [req.params.id, user.id]
    );

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    await db.run('DELETE FROM reservations WHERE id = ?', req.params.id);
    res.json({ message: 'Reservation deleted successfully' });
  } catch (err) {
    console.error('Delete reservation error:', err);
    res.status(500).json({ error: 'Failed to delete reservation' });
  }
});

// ============ ADMIN ROUTES ============

// Get all reservations (admin only) with optional date filter
router.get('/admin/all', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { date } = req.query;
    const db = getDb();

    let query = `
      SELECT r.*, s.name as service_name, u.first_name, u.last_name, a.email
      FROM reservations r
      JOIN services s ON r.service_id = s.id
      JOIN users u ON r.user_id = u.id
      JOIN accounts a ON u.account_id = a.id
    `;

    const params = [];

    if (date) {
      query += ' WHERE r.reservation_date = ?';
      params.push(date);
    }

    query += ' ORDER BY r.reservation_date DESC, r.reservation_time DESC';

    const reservations = await db.all(query, params);
    res.json(reservations);
  } catch (err) {
    console.error('Get all reservations error:', err);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// Update reservation (admin only)
router.put('/admin/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { date, time, partySize, allergies, serviceId } = req.body;

    if (!date || !time || !partySize || !serviceId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDb();

    // Check availability (excluding current reservation)
    const settings = await db.get('SELECT max_capacity FROM restaurant_settings LIMIT 1');
    const maxCapacity = settings?.max_capacity || 100;

    const reservedCheck = await db.get(
      `SELECT SUM(number_of_people) as reserved 
       FROM reservations 
       WHERE reservation_date = ? AND reservation_time = ? AND service_id = ? AND id != ?`,
      [date, time, serviceId, req.params.id]
    );

    const reserved = reservedCheck?.reserved || 0;
    if (reserved + partySize > maxCapacity) {
      return res.status(409).json({ error: 'Not enough available seats for this time slot' });
    }

    // Update reservation
    await db.run(
      `UPDATE reservations 
       SET reservation_date = ?, reservation_time = ?, service_id = ?, number_of_people = ?, allergies = ?
       WHERE id = ?`,
      [date, time, serviceId, partySize, allergies || null, req.params.id]
    );

    res.json({ message: 'Reservation updated successfully' });
  } catch (err) {
    console.error('Update reservation error:', err);
    res.status(500).json({ error: 'Failed to update reservation' });
  }
});

// Delete reservation (admin only)
router.delete('/admin/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    await db.run('DELETE FROM reservations WHERE id = ?', req.params.id);
    res.json({ message: 'Reservation deleted successfully' });
  } catch (err) {
    console.error('Delete reservation error:', err);
    res.status(500).json({ error: 'Failed to delete reservation' });
  }
});

export default router;
