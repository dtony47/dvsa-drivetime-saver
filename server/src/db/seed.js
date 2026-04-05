require('dotenv').config();
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const TEST_CENTRES = [
  // London
  { name: 'Mill Hill', postcode: 'NW7 1PG', lat: 51.6183, lon: -0.2286, address: 'Mill Hill, London' },
  { name: 'Wood Green', postcode: 'N22 6UJ', lat: 51.5975, lon: -0.1097, address: 'Wood Green, London' },
  { name: 'Goodmayes', postcode: 'IG3 9TU', lat: 51.5605, lon: 0.1126, address: 'Goodmayes, London' },
  { name: 'Borehamwood', postcode: 'WD6 1QQ', lat: 51.6577, lon: -0.2733, address: 'Borehamwood, Hertfordshire' },
  { name: 'Enfield', postcode: 'EN3 7NP', lat: 51.6622, lon: -0.0494, address: 'Enfield, London' },
  { name: 'Barnet', postcode: 'EN5 1NW', lat: 51.6552, lon: -0.1986, address: 'Barnet, London' },
  { name: 'Hendon', postcode: 'NW4 3FB', lat: 51.5883, lon: -0.2272, address: 'Hendon, London' },
  { name: 'Chingford', postcode: 'E4 8ST', lat: 51.6310, lon: -0.0107, address: 'Chingford, London' },
  { name: 'Hither Green', postcode: 'SE13 6TJ', lat: 51.4496, lon: -0.0024, address: 'Hither Green, London' },
  { name: 'Croydon', postcode: 'CR0 4HQ', lat: 51.3714, lon: -0.0986, address: 'Croydon, London' },
  { name: 'Bromley', postcode: 'BR2 9HT', lat: 51.3863, lon: 0.0215, address: 'Bromley, London' },
  { name: 'Sutton', postcode: 'SM1 2RP', lat: 51.3596, lon: -0.1948, address: 'Sutton, London' },
  { name: 'Mitcham', postcode: 'CR4 3HS', lat: 51.3974, lon: -0.1574, address: 'Mitcham, London' },
  { name: 'Morden', postcode: 'SM4 5AT', lat: 51.3924, lon: -0.2046, address: 'Morden, London' },
  { name: 'Tolworth', postcode: 'KT5 9NU', lat: 51.3775, lon: -0.2817, address: 'Tolworth, London' },
  { name: 'Isleworth', postcode: 'TW7 5NP', lat: 51.4673, lon: -0.3331, address: 'Isleworth, London' },
  { name: 'Uxbridge', postcode: 'UB8 2TJ', lat: 51.5404, lon: -0.4778, address: 'Uxbridge, London' },
  { name: 'Yeading', postcode: 'UB4 9SS', lat: 51.5210, lon: -0.4081, address: 'Yeading, London' },
  { name: 'Greenford', postcode: 'UB6 8TL', lat: 51.5306, lon: -0.3446, address: 'Greenford, London' },
  { name: 'Belvedere', postcode: 'DA17 6EZ', lat: 51.4895, lon: 0.1517, address: 'Belvedere, London' },
  { name: 'Sidcup', postcode: 'DA14 6PL', lat: 51.4319, lon: 0.1032, address: 'Sidcup, London' },
  { name: 'South Norwood', postcode: 'SE25 5AG', lat: 51.3958, lon: -0.0747, address: 'South Norwood, London' },
  { name: 'Hornchurch', postcode: 'RM12 4TB', lat: 51.5586, lon: 0.2139, address: 'Hornchurch, London' },
  // South East
  { name: 'Slough', postcode: 'SL1 1ER', lat: 51.5085, lon: -0.5926, address: 'Slough, Berkshire' },
  { name: 'Reading', postcode: 'RG2 0QN', lat: 51.4371, lon: -0.9580, address: 'Reading, Berkshire' },
  { name: 'Guildford', postcode: 'GU1 1AF', lat: 51.2365, lon: -0.5703, address: 'Guildford, Surrey' },
  { name: 'Brighton (Hove)', postcode: 'BN3 7EY', lat: 50.8330, lon: -0.1777, address: 'Hove, East Sussex' },
  { name: 'Crawley', postcode: 'RH10 8AD', lat: 51.1091, lon: -0.1872, address: 'Crawley, West Sussex' },
  { name: 'Ashford (Kent)', postcode: 'TN24 8AL', lat: 51.1468, lon: 0.8760, address: 'Ashford, Kent' },
  // South West / South
  { name: 'Southampton (Maybush)', postcode: 'SO16 5FA', lat: 50.9282, lon: -1.4395, address: 'Maybush, Southampton' },
  { name: 'Oxford (Cowley)', postcode: 'OX4 2ND', lat: 51.7372, lon: -1.2135, address: 'Cowley, Oxford' },
  { name: 'Cambridge (Cowley Road)', postcode: 'CB4 0DL', lat: 52.2136, lon: 0.1287, address: 'Cambridge' },
  { name: 'Bristol (Southmead)', postcode: 'BS10 5EE', lat: 51.4980, lon: -2.5962, address: 'Southmead, Bristol' },
  { name: 'Bristol (Brislington)', postcode: 'BS4 5RQ', lat: 51.4344, lon: -2.5489, address: 'Brislington, Bristol' },
  { name: 'Plymouth', postcode: 'PL6 8BT', lat: 50.4039, lon: -4.1151, address: 'Plymouth, Devon' },
  { name: 'Exeter', postcode: 'EX2 7JU', lat: 50.7089, lon: -3.5174, address: 'Exeter, Devon' },
  // Midlands
  { name: 'Birmingham (Kingstanding)', postcode: 'B44 9RT', lat: 52.5421, lon: -1.8923, address: 'Kingstanding, Birmingham' },
  { name: 'Birmingham (South Yardley)', postcode: 'B26 1BU', lat: 52.4520, lon: -1.7940, address: 'South Yardley, Birmingham' },
  { name: 'Birmingham (Shirley)', postcode: 'B90 2AX', lat: 52.3974, lon: -1.8130, address: 'Shirley, Birmingham' },
  { name: 'Wolverhampton', postcode: 'WV1 2HB', lat: 52.5857, lon: -2.1266, address: 'Wolverhampton' },
  { name: 'Coventry', postcode: 'CV6 7JQ', lat: 52.4263, lon: -1.5077, address: 'Coventry' },
  { name: 'Nottingham (Colwick)', postcode: 'NG2 4NU', lat: 52.9407, lon: -1.1181, address: 'Colwick, Nottingham' },
  { name: 'Leicester (Wigston)', postcode: 'LE18 2HB', lat: 52.5764, lon: -1.0975, address: 'Wigston, Leicester' },
  { name: 'Derby (Alvaston)', postcode: 'DE24 0GZ', lat: 52.9027, lon: -1.4507, address: 'Alvaston, Derby' },
  { name: 'Stoke-on-Trent (Cobridge)', postcode: 'ST6 2DZ', lat: 53.0341, lon: -2.1720, address: 'Cobridge, Stoke-on-Trent' },
  // North West
  { name: 'Manchester (Cheetham Hill)', postcode: 'M8 8DF', lat: 53.5024, lon: -2.2380, address: 'Cheetham Hill, Manchester' },
  { name: 'Manchester (West Didsbury)', postcode: 'M20 2UR', lat: 53.4196, lon: -2.2397, address: 'West Didsbury, Manchester' },
  { name: 'Salford', postcode: 'M5 4DE', lat: 53.4868, lon: -2.2716, address: 'Salford, Manchester' },
  { name: 'Bolton', postcode: 'BL3 2NZ', lat: 53.5645, lon: -2.4258, address: 'Bolton' },
  { name: 'Liverpool (Norris Green)', postcode: 'L11 5BL', lat: 53.4494, lon: -2.9227, address: 'Norris Green, Liverpool' },
  { name: 'Liverpool (Garston)', postcode: 'L19 2PH', lat: 53.3622, lon: -2.8989, address: 'Garston, Liverpool' },
  { name: 'Preston', postcode: 'PR2 2HE', lat: 53.7758, lon: -2.6901, address: 'Preston, Lancashire' },
  // Yorkshire & North East
  { name: 'Leeds (Horsforth)', postcode: 'LS18 4JP', lat: 53.8406, lon: -1.6284, address: 'Horsforth, Leeds' },
  { name: 'Leeds (Harehills)', postcode: 'LS9 6NF', lat: 53.8063, lon: -1.5171, address: 'Harehills, Leeds' },
  { name: 'Sheffield (Middlewood Road)', postcode: 'S6 1TE', lat: 53.4019, lon: -1.4984, address: 'Middlewood Road, Sheffield' },
  { name: 'Bradford', postcode: 'BD9 4RH', lat: 53.8045, lon: -1.7866, address: 'Bradford' },
  { name: 'Hull', postcode: 'HU5 1AF', lat: 53.7508, lon: -0.3626, address: 'Hull' },
  { name: 'Newcastle (Gosforth)', postcode: 'NE3 5HL', lat: 55.0002, lon: -1.6201, address: 'Gosforth, Newcastle' },
  { name: 'Sunderland', postcode: 'SR5 2TA', lat: 54.9159, lon: -1.3921, address: 'Sunderland' },
  // Wales
  { name: 'Cardiff', postcode: 'CF11 8AW', lat: 51.4762, lon: -3.2031, address: 'Cardiff' },
  { name: 'Swansea', postcode: 'SA1 8QY', lat: 51.6205, lon: -3.9430, address: 'Swansea' },
  // Scotland
  { name: 'Edinburgh (Currie)', postcode: 'EH14 5TH', lat: 55.8982, lon: -3.3161, address: 'Currie, Edinburgh' },
  { name: 'Edinburgh (Musselburgh)', postcode: 'EH21 8RE', lat: 55.9428, lon: -3.0549, address: 'Musselburgh, Edinburgh' },
  { name: 'Glasgow (Anniesland)', postcode: 'G13 1HD', lat: 55.8910, lon: -4.3350, address: 'Anniesland, Glasgow' },
  { name: 'Glasgow (Shieldhall)', postcode: 'G51 4RY', lat: 55.8622, lon: -4.3551, address: 'Shieldhall, Glasgow' },
];

const SAMPLE_INSTRUCTORS = [
  {
    email: 'sarah.jones@example.com',
    password: 'instructor123',
    name: 'Sarah Jones',
    adi_number: 'ADI123456',
    coverage_areas: ['Mill Hill', 'Hendon', 'Barnet', 'Borehamwood', 'Wood Green'],
    hourly_rate: 38.00,
    rating: 4.8,
    bio: 'Experienced instructor with 12 years in the industry. Specialising in nervous drivers and quick-pass intensive courses.',
  },
  {
    email: 'james.patel@example.com',
    password: 'instructor123',
    name: 'James Patel',
    adi_number: 'ADI789012',
    coverage_areas: ['Croydon', 'Bromley', 'Mitcham', 'Sutton', 'Hither Green'],
    hourly_rate: 35.00,
    rating: 4.6,
    bio: 'Patient and friendly instructor covering South London. High first-time pass rate.',
  },
  {
    email: 'angela.williams@example.com',
    password: 'instructor123',
    name: 'Angela Williams',
    adi_number: 'ADI345678',
    coverage_areas: ['Uxbridge', 'Greenford', 'Yeading', 'Isleworth', 'Slough'],
    hourly_rate: 40.00,
    rating: 4.9,
    bio: 'Grade A instructor covering West London and surrounding areas. Automatic and manual lessons available.',
  },
  {
    email: 'mohammed.khan@example.com',
    password: 'instructor123',
    name: 'Mohammed Khan',
    adi_number: 'ADI901234',
    coverage_areas: ['Manchester (Cheetham Hill)', 'Manchester (West Didsbury)', 'Salford', 'Bolton'],
    hourly_rate: 32.00,
    rating: 4.7,
    bio: 'Manchester-based instructor with an excellent track record. Multilingual — English, Urdu, Punjabi.',
  },
  {
    email: 'lisa.chen@example.com',
    password: 'instructor123',
    name: 'Lisa Chen',
    adi_number: 'ADI567890',
    coverage_areas: ['Birmingham (Kingstanding)', 'Birmingham (South Yardley)', 'Birmingham (Shirley)', 'Coventry'],
    hourly_rate: 34.00,
    rating: 4.5,
    bio: 'Birmingham area specialist. Calm and supportive teaching style. Weekend and evening slots available.',
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding test centres...');

    // Clear existing seed data
    await client.query('DELETE FROM bookings');
    await client.query('DELETE FROM slot_alerts');
    await client.query('DELETE FROM instructor_profiles');
    await client.query('DELETE FROM learner_profiles');
    await client.query('DELETE FROM test_centres');
    await client.query("DELETE FROM users WHERE role = 'instructor'");

    // Insert test centres
    for (const centre of TEST_CENTRES) {
      await client.query(
        'INSERT INTO test_centres (name, postcode, lat, lon, address) VALUES ($1, $2, $3, $4, $5)',
        [centre.name, centre.postcode, centre.lat, centre.lon, centre.address]
      );
    }
    console.log(`Inserted ${TEST_CENTRES.length} test centres.`);

    // Insert sample instructors
    console.log('Seeding sample instructors...');
    for (const instructor of SAMPLE_INSTRUCTORS) {
      const hash = await bcrypt.hash(instructor.password, 10);

      const userResult = await client.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
        [instructor.email, hash, 'instructor']
      );
      const userId = userResult.rows[0].id;

      await client.query(
        `INSERT INTO instructor_profiles (user_id, name, adi_number, coverage_areas, hourly_rate, rating, bio)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          instructor.name,
          instructor.adi_number,
          JSON.stringify(instructor.coverage_areas),
          instructor.hourly_rate,
          instructor.rating,
          instructor.bio,
        ]
      );
    }
    console.log(`Inserted ${SAMPLE_INSTRUCTORS.length} sample instructors.`);

    console.log('Seeding completed successfully.');
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
