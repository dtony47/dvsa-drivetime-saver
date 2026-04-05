const express = require('express');
const { body } = require('express-validator');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const pool = require('../config/db');

const router = express.Router();

// GET /api/instructors — public, list all instructors
router.get('/', async (req, res, next) => {
  try {
    const { postcode } = req.query;

    let query = `
      SELECT ip.*, u.email
      FROM instructor_profiles ip
      JOIN users u ON u.id = ip.user_id
      ORDER BY ip.rating DESC
    `;

    const result = await pool.query(query);

    let instructors = result.rows;

    // If postcode filter provided, filter by coverage area match
    if (postcode) {
      const prefix = postcode.toUpperCase().replace(/\s/g, '').replace(/[0-9]/g, '');
      instructors = instructors.filter((inst) => {
        const areas = inst.coverage_areas || [];
        return areas.some((area) => {
          const areaUpper = typeof area === 'string' ? area.toUpperCase() : '';
          return areaUpper.includes(prefix) || prefix.includes(areaUpper.substring(0, 2));
        });
      });
    }

    res.json({ instructors });
  } catch (err) {
    next(err);
  }
});

// GET /api/instructors/:id — public
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT ip.*, u.email
       FROM instructor_profiles ip
       JOIN users u ON u.id = ip.user_id
       WHERE ip.user_id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    res.json({ instructor: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/instructors/profile — upsert (auth + instructor role)
router.post(
  '/profile',
  authenticate,
  requireRole('instructor'),
  [
    body('name').notEmpty().withMessage('Name required'),
    body('adi_number').optional().isString(),
    body('coverage_areas').optional().isArray(),
    body('hourly_rate').optional().isFloat({ min: 0 }),
    body('bio').optional().isString(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, adi_number, coverage_areas, hourly_rate, bio } = req.body;

      const result = await pool.query(
        `INSERT INTO instructor_profiles (user_id, name, adi_number, coverage_areas, hourly_rate, bio)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id)
         DO UPDATE SET
           name = COALESCE($2, instructor_profiles.name),
           adi_number = COALESCE($3, instructor_profiles.adi_number),
           coverage_areas = COALESCE($4, instructor_profiles.coverage_areas),
           hourly_rate = COALESCE($5, instructor_profiles.hourly_rate),
           bio = COALESCE($6, instructor_profiles.bio)
         RETURNING *`,
        [
          req.user.id,
          name,
          adi_number || null,
          coverage_areas ? JSON.stringify(coverage_areas) : null,
          hourly_rate || null,
          bio || null,
        ]
      );

      res.json({ profile: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/instructors/:id/availability — mock availability for MVP
router.get('/:id/availability', async (req, res, next) => {
  try {
    // Verify instructor exists
    const inst = await pool.query(
      'SELECT id FROM instructor_profiles WHERE user_id = $1',
      [req.params.id]
    );
    if (inst.rows.length === 0) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    // Generate mock availability for the next 14 days
    const availability = [];
    const now = new Date();
    for (let d = 1; d <= 14; d++) {
      const date = new Date(now);
      date.setDate(date.getDate() + d);
      const dayOfWeek = date.getDay();

      // No availability on Sundays
      if (dayOfWeek === 0) continue;

      const dateStr = date.toISOString().split('T')[0];

      // Fewer slots on Saturdays
      const slots = dayOfWeek === 6
        ? ['09:00', '10:00', '11:00']
        : ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

      // Randomly remove some slots to simulate bookings
      const available = slots.filter(() => Math.random() > 0.3);

      if (available.length > 0) {
        availability.push({ date: dateStr, slots: available });
      }
    }

    res.json({ availability });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
