const express = require('express');
const { body, param } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const pool = require('../config/db');

const router = express.Router();

// All routes require auth
router.use(authenticate);

// GET /api/bookings — list user's bookings
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT b.*, tc.name AS centre_name, tc.postcode AS centre_postcode, tc.address AS centre_address,
              u_learner.email AS learner_email,
              ip.name AS instructor_name
       FROM bookings b
       LEFT JOIN test_centres tc ON tc.id = b.centre_id
       LEFT JOIN users u_learner ON u_learner.id = b.learner_id
       LEFT JOIN instructor_profiles ip ON ip.user_id = b.instructor_id
       WHERE b.learner_id = $1 OR b.instructor_id = $1
       ORDER BY b.slot_date DESC, b.slot_time DESC`,
      [req.user.id]
    );

    const bookings = result.rows.map(formatBooking);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

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

      const centre = await pool.query('SELECT * FROM test_centres WHERE id = $1', [centre_id]);
      if (centre.rows.length === 0) {
        return res.status(404).json({ error: 'Test centre not found' });
      }

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
        `INSERT INTO bookings (learner_id, instructor_id, slot_date, slot_time, centre_id, amount, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'confirmed')
         RETURNING *`,
        [req.user.id, instructor_id || null, slot_date, slot_time, centre_id, amount || null]
      );

      const booking = result.rows[0];
      const c = centre.rows[0];

      res.status(201).json(formatBooking({
        ...booking,
        centre_name: c.name,
        centre_postcode: c.postcode,
        centre_address: c.address,
      }));
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
        `SELECT b.*, tc.name AS centre_name, tc.postcode AS centre_postcode, tc.address AS centre_address,
                ip.name AS instructor_name
         FROM bookings b
         LEFT JOIN test_centres tc ON tc.id = b.centre_id
         LEFT JOIN instructor_profiles ip ON ip.user_id = b.instructor_id
         WHERE b.id = $1`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      const booking = result.rows[0];
      if (booking.learner_id !== req.user.id && booking.instructor_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(formatBooking(booking));
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

      res.json(formatBooking(result.rows[0]));
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/bookings/:id/pay — mark as paid (MVP mock)
router.patch(
  '/:id/pay',
  [param('id').isInt()],
  validate,
  async (req, res, next) => {
    try {
      const existing = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      if (existing.rows[0].learner_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const result = await pool.query(
        "UPDATE bookings SET payment_status = 'paid', status = 'confirmed' WHERE id = $1 RETURNING *",
        [req.params.id]
      );

      res.json(formatBooking(result.rows[0]));
    } catch (err) {
      next(err);
    }
  }
);

function formatBooking(row) {
  return {
    id: row.id,
    learnerId: row.learner_id,
    instructorId: row.instructor_id,
    centreName: row.centre_name || 'Test Centre',
    centrePostcode: row.centre_postcode || '',
    centreAddress: row.centre_address || '',
    date: row.slot_date,
    time: row.slot_time ? row.slot_time.substring(0, 5) : null,
    status: row.status,
    paymentStatus: row.payment_status,
    amount: row.amount ? parseFloat(row.amount) : null,
    learnerEmail: row.learner_email || null,
    instructorName: row.instructor_name || null,
    createdAt: row.created_at,
  };
}

module.exports = router;
