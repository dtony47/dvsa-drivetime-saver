const express = require('express');
const pool = require('../config/db');
const { getDistance, postcodeToCoords } = require('../utils/geocode');

const router = express.Router();

// GET /api/centres?postcode=NW7&radius=10
// Also handles /api/centres/search via same logic
router.get('/', handleSearch);
router.get('/search', handleSearch);

async function handleSearch(req, res, next) {
  try {
    const { postcode, radius = 10 } = req.query;
    const maxRadiusKm = parseFloat(radius) * 1.60934; // convert miles to km

    const result = await pool.query('SELECT * FROM test_centres ORDER BY name');
    let centres = result.rows;

    if (postcode) {
      const coords = postcodeToCoords(postcode);
      if (coords) {
        centres = centres
          .map((centre) => {
            const distKm = getDistance(
              coords.lat,
              coords.lon,
              parseFloat(centre.lat),
              parseFloat(centre.lon)
            );
            const distMiles = Math.round((distKm / 1.60934) * 10) / 10;
            return { ...centre, distance: distMiles };
          })
          .filter((centre) => centre.distance <= parseFloat(radius))
          .sort((a, b) => a.distance - b.distance);
      }
    }

    res.json(centres);
  } catch (err) {
    next(err);
  }
}

// GET /api/centres/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM test_centres WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Centre not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
