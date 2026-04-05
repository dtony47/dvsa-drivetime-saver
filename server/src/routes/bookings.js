const express = require('express');
const { body, param } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const pool = require('../config/db');

const router = express.Router();

// All routes require auth
router.use(authenticate);

// POST /api/bookings
router.post(
  '/',
  [
    body('slot_date').isISO8601().withMessage('Valid slot_date required'),
    body('slot_time')
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('slot_time must be HH:MM format'),
    body('centre_id').isInt({ min: 1 }).withMessage('Valid centre_id required'),
    body('instructor_id').optional().isInt({ min: 1 }),
    body('amount').optional().isFloat({ min: 0 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { slot_date, slot_time, centre_id, instructor_id, amount } = req.body;

      // Verify centre exists
      const centre = await pool.query('SELECT id FROM test_centres WHERE id = $1', [centre_id]);
      if (centre.rows.length === 0) {
        return res.status(404).json({ error: 'Test centre not found' });
      }

      // Verify instructor exists if provided
      if (instructor_id) {
        const inst = await pool.query(
          "SELECT id FROM users WHERE id = $1 AND role = 'instructor'",
          [instructor_id]
        );
        if (inst.rows.length === 0) {
          return res.status(404).json({ error: 'Instructor not found' });
        }
      }

      const result = await pool.query(
        `INSERT INTO bookings (learner_id, instructor_id, slot_date, slot_time, centre_id, amount)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [req.user.id, instructor_id || null, slot_date, slot_time, centre_id, amount || null]
      );

      res.status(201).json({ booking: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/bookings/:id
router.get(
  '/:id',
  [param('id').isInt()],
  validate,
  async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT b.*, tc.name AS centre_name, tc.postcode AS centre_postcode
         FROM bookings b
         LEFT JOIN test_centres tc ON tc.id = b.centre_id
         WHERE b.id = $1`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      const booking = result.rows[0];

      // Must belong to user (as learner or instructor)
      if (booking.learner_id !== req.user.id && booking.instructor_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ booking });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/bookings/:id/status
router.patch(
  '/:id/status',
  [
    param('id').isInt(),
    body('status')
      .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
      .withMessage('Invalid status'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { status } = req.body;

      // Check booking exists and belongs to user
      const existing = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      const booking = existing.rows[0];
      if (booking.learner_id !== req.user.id && booking.instructor_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const result = await pool.query(
        'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
        [status, req.params.id]
      );

      res.json({ booking: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
