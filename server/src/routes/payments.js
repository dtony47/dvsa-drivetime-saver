const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const pool = require('../config/db');

const router = express.Router();

// POST /api/payments/create-intent
router.post(
  '/create-intent',
  authenticate,
  [body('booking_id').isInt({ min: 1 }).withMessage('Valid booking_id required')],
  validate,
  async (req, res, next) => {
    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const { booking_id } = req.body;

      // Find booking
      const bookingResult = await pool.query(
        'SELECT * FROM bookings WHERE id = $1 AND learner_id = $2',
        [booking_id, req.user.id]
      );
      if (bookingResult.rows.length === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      const booking = bookingResult.rows[0];

      if (booking.payment_status === 'paid') {
        return res.status(400).json({ error: 'Booking already paid' });
      }

      // Amount in pence (GBP)
      const amount = Math.round((parseFloat(booking.amount) || 35.0) * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'gbp',
        metadata: {
          booking_id: booking.id.toString(),
          learner_id: req.user.id.toString(),
        },
      });

      // Save payment intent ID to booking
      await pool.query(
        'UPDATE bookings SET payment_intent_id = $1 WHERE id = $2',
        [paymentIntent.id, booking.id]
      );

      res.json({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/payments/webhook — Stripe webhook (needs raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object;
      const bookingId = intent.metadata.booking_id;
      if (bookingId) {
        await pool.query(
          "UPDATE bookings SET payment_status = 'paid', status = 'confirmed' WHERE id = $1",
          [bookingId]
        );
        console.log(`Booking ${bookingId} payment confirmed.`);
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object;
      console.log(`Payment failed for intent ${intent.id}`);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
