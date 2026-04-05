const express = require('express');
const pool = require('../config/db');
const { getDistance, postcodeToCoords } = require('../utils/geocode');

const router = express.Router();

// GET /api/centres?postcode=NW7&radius=10
router.get('/', async (req, res, next) => {
  try {
    const { postcode, radius = 10 } = req.query;
    const maxRadius = parseFloat(radius);

    const result = await pool.query('SELECT * FROM test_centres ORDER BY name');
    let centres = result.rows;

    if (postcode) {
      const coords = postcodeToCoords(postcode);
      if (coords) {
        // Calculate distance for each centre and filter/sort by it
        centres = centres
          .map((centre) => {
            const dist = getDistance(
              coords.lat,
              coords.lon,
              parseFloat(centre.lat),
              parseFloat(centre.lon)
            );
            return { ...centre, distance_km: Math.round(dist * 10) / 10 };
          })
          .filter((centre) => centre.distance_km <= maxRadius)
          .sort((a, b) => a.distance_km - b.distance_km);
      }
    }

    res.json({ centres, total: centres.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
