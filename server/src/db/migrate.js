require('dotenv').config();
const pool = require('../config/db');

const migration = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('learner', 'instructor')),
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS learner_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    postcode VARCHAR(10),
    preferred_centres JSONB DEFAULT '[]',
    test_type VARCHAR(50) DEFAULT 'car',
    urgency_level VARCHAR(20) DEFAULT 'flexible',
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS instructor_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    adi_number VARCHAR(20) UNIQUE,
    coverage_areas JSONB DEFAULT '[]',
    hourly_rate DECIMAL(6,2),
    rating DECIMAL(3,2) DEFAULT 0,
    bio TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS test_centres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    postcode VARCHAR(10) NOT NULL,
    lat DECIMAL(10,7),
    lon DECIMAL(10,7),
    address TEXT
  );

  CREATE TABLE IF NOT EXISTS slot_alerts (
    id SERIAL PRIMARY KEY,
    learner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    centres JSONB DEFAULT '[]',
    date_from DATE,
    date_to DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'found')),
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    learner_id INTEGER REFERENCES users(id),
    instructor_id INTEGER REFERENCES users(id),
    slot_date DATE NOT NULL,
    slot_time TIME NOT NULL,
    centre_id INTEGER REFERENCES test_centres(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
    payment_intent_id VARCHAR(255),
    amount DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT NOW()
  );
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running migrations...');
    await client.query(migration);
    console.log('Migrations completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
