const express = require('express');
const { body } = require('express-validator');
const { authenticate, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const pool = require('../config/db');

const router = express.Router();

// All routes require authenticated learner
router.use(authenticate, requireRole('learner'));

// GET /api/learners/profile
router.get('/profile', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM learner_profiles WHERE user_id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.json({ profile: null });
    }
    res.json({ profile: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/learners/profile — upsert
router.post(
  '/profile',
  [
    body('postcode').optional().isString(),
    body('preferred_centres').optional().isArray(),
    body('test_type').optional().isIn(['car', 'motorcycle', 'lorry', 'bus']),
    body('urgency_level').optional().isIn(['urgent', 'soon', 'flexible']),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { postcode, preferred_centres, test_type, urgency_level } = req.body;

      const result = await pool.query(
        `INSERT INTO learner_profiles (user_id, postcode, preferred_centres, test_type, urgency_level)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id)
         DO UPDATE SET
           postcode = COALESCE($2, learner_profiles.postcode),
           preferred_centres = COALESCE($3, learner_profiles.preferred_centres),
           test_type = COALESCE($4, learner_profiles.test_type),
           urgency_level = COALESCE($5, learner_profiles.urgency_level)
         RETURNING *`,
        [
          req.user.id,
          postcode || null,
          preferred_centres ? JSON.stringify(preferred_centres) : null,
          test_type || null,
          urgency_level || null,
        ]
      );

      res.json({ profile: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/learners/alerts
router.post(
  '/alerts',
  [
    body('centres').isArray({ min: 1 }).withMessage('At least one centre required'),
    body('date_from').isISO8601().withMessage('Valid date_from required'),
    body('date_to').isISO8601().withMessage('Valid date_to required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { centres, date_from, date_to } = req.body;

      const result = await pool.query(
        `INSERT INTO slot_alerts (learner_id, centres, date_from, date_to)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [req.user.id, JSON.stringify(centres), date_from, date_to]
      );

      res.status(201).json({ alert: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/learners/alerts
router.get('/alerts', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM slot_alerts WHERE learner_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ alerts: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
