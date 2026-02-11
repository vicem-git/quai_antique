import express from 'express';
import { getDb } from '../db/db.js';
import { verifyToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get restaurant settings
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    
    let settings = await db.get('SELECT * FROM restaurant_settings LIMIT 1');
    if (!settings) {
      // Initialize default settings
      await db.run('INSERT INTO restaurant_settings (max_capacity) VALUES (?)', 100);
      settings = await db.get('SELECT * FROM restaurant_settings LIMIT 1');
    }

    const services = await db.all('SELECT * FROM services ORDER BY name');
    
    res.json({ 
      maxCapacity: settings.max_capacity,
      services 
    });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update restaurant max capacity (admin only)
router.put('/capacity', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { maxCapacity } = req.body;

    if (!maxCapacity || maxCapacity < 1) {
      return res.status(400).json({ error: 'Valid max capacity required' });
    }

    const db = getDb();
    await db.run('UPDATE restaurant_settings SET max_capacity = ?', maxCapacity);

    res.json({ message: 'Capacity updated successfully', maxCapacity });
  } catch (err) {
    console.error('Update capacity error:', err);
    res.status(500).json({ error: 'Failed to update capacity' });
  }
});

// Get all services
router.get('/services', async (req, res) => {
  try {
    const db = getDb();
    const services = await db.all('SELECT * FROM services ORDER BY name');
    res.json(services);
  } catch (err) {
    console.error('Get services error:', err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Update service (admin only)
router.put('/services/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({ error: 'Start and end times required' });
    }

    const db = getDb();
    await db.run(
      'UPDATE services SET start_time = ?, end_time = ? WHERE id = ?',
      [startTime, endTime, req.params.id]
    );

    const service = await db.get('SELECT * FROM services WHERE id = ?', req.params.id);
    res.json({ message: 'Service updated successfully', service });
  } catch (err) {
    console.error('Update service error:', err);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

export default router;
