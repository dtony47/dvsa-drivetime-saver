/**
 * Simple geocoding utilities for MVP.
 * Uses Haversine formula and a hardcoded postcode prefix lookup.
 */

const EARTH_RADIUS_KM = 6371;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Calculate distance between two points using Haversine formula.
 * Returns distance in kilometres.
 */
function getDistance(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Approximate coordinates from UK postcode prefix.
 * This is a rough MVP lookup — not precise.
 */
const POSTCODE_COORDS = {
  // London
  NW: { lat: 51.55, lon: -0.18 },
  N: { lat: 51.57, lon: -0.1 },
  NE: { lat: 51.55, lon: 0.0 },
  E: { lat: 51.54, lon: 0.05 },
  SE: { lat: 51.45, lon: 0.02 },
  S: { lat: 51.45, lon: -0.12 },
  SW: { lat: 51.45, lon: -0.17 },
  W: { lat: 51.51, lon: -0.22 },
  WC: { lat: 51.515, lon: -0.12 },
  EC: { lat: 51.515, lon: -0.09 },
  // Greater London / Home Counties
  EN: { lat: 51.65, lon: -0.08 },
  HA: { lat: 51.58, lon: -0.34 },
  IG: { lat: 51.57, lon: 0.08 },
  RM: { lat: 51.57, lon: 0.18 },
  DA: { lat: 51.45, lon: 0.15 },
  BR: { lat: 51.38, lon: 0.03 },
  CR: { lat: 51.37, lon: -0.1 },
  SM: { lat: 51.36, lon: -0.18 },
  KT: { lat: 51.38, lon: -0.28 },
  TW: { lat: 51.44, lon: -0.35 },
  UB: { lat: 51.54, lon: -0.44 },
  WD: { lat: 51.68, lon: -0.32 },
  AL: { lat: 51.75, lon: -0.33 },
  SL: { lat: 51.51, lon: -0.59 },
  // South
  RG: { lat: 51.45, lon: -0.97 },
  GU: { lat: 51.24, lon: -0.77 },
  BN: { lat: 50.83, lon: -0.14 },
  SO: { lat: 50.9, lon: -1.4 },
  PO: { lat: 50.8, lon: -1.09 },
  SP: { lat: 51.07, lon: -1.79 },
  // South West
  BS: { lat: 51.45, lon: -2.59 },
  BA: { lat: 51.38, lon: -2.36 },
  EX: { lat: 50.72, lon: -3.53 },
  PL: { lat: 50.37, lon: -4.14 },
  TQ: { lat: 50.46, lon: -3.59 },
  // Midlands
  B: { lat: 52.48, lon: -1.89 },
  CV: { lat: 52.41, lon: -1.51 },
  LE: { lat: 52.63, lon: -1.13 },
  NG: { lat: 52.95, lon: -1.15 },
  DE: { lat: 52.92, lon: -1.47 },
  ST: { lat: 52.98, lon: -2.18 },
  WV: { lat: 52.59, lon: -2.13 },
  WS: { lat: 52.58, lon: -1.98 },
  DY: { lat: 52.51, lon: -2.08 },
  // East
  CB: { lat: 52.2, lon: 0.12 },
  CO: { lat: 51.89, lon: 0.9 },
  IP: { lat: 52.06, lon: 1.16 },
  NR: { lat: 52.63, lon: 1.3 },
  PE: { lat: 52.57, lon: -0.24 },
  MK: { lat: 52.04, lon: -0.76 },
  LU: { lat: 51.88, lon: -0.42 },
  SS: { lat: 51.54, lon: 0.71 },
  CM: { lat: 51.73, lon: 0.47 },
  OX: { lat: 51.75, lon: -1.26 },
  HP: { lat: 51.75, lon: -0.73 },
  // North West
  M: { lat: 53.48, lon: -2.24 },
  OL: { lat: 53.54, lon: -2.12 },
  BL: { lat: 53.58, lon: -2.43 },
  WN: { lat: 53.55, lon: -2.63 },
  L: { lat: 53.41, lon: -2.98 },
  WA: { lat: 53.39, lon: -2.59 },
  CH: { lat: 53.19, lon: -2.89 },
  PR: { lat: 53.76, lon: -2.7 },
  LA: { lat: 54.05, lon: -2.8 },
  CA: { lat: 54.89, lon: -2.93 },
  // Yorkshire
  LS: { lat: 53.8, lon: -1.55 },
  BD: { lat: 53.79, lon: -1.75 },
  HX: { lat: 53.73, lon: -1.86 },
  HD: { lat: 53.65, lon: -1.78 },
  WF: { lat: 53.68, lon: -1.5 },
  S: { lat: 53.38, lon: -1.47 },
  DN: { lat: 53.52, lon: -1.13 },
  HU: { lat: 53.74, lon: -0.33 },
  YO: { lat: 53.96, lon: -1.08 },
  HG: { lat: 54.0, lon: -1.54 },
  // North East
  NE1: { lat: 54.97, lon: -1.61 },
  SR: { lat: 54.91, lon: -1.38 },
  DH: { lat: 54.78, lon: -1.57 },
  TS: { lat: 54.57, lon: -1.23 },
  DL: { lat: 54.52, lon: -1.55 },
  // Wales
  CF: { lat: 51.48, lon: -3.18 },
  SA: { lat: 51.62, lon: -3.94 },
  NP: { lat: 51.59, lon: -3.0 },
  LD: { lat: 52.24, lon: -3.38 },
  SY: { lat: 52.71, lon: -2.75 },
  LL: { lat: 53.23, lon: -3.83 },
  // Scotland
  EH: { lat: 55.95, lon: -3.19 },
  G: { lat: 55.86, lon: -4.25 },
  FK: { lat: 56.12, lon: -3.94 },
  KY: { lat: 56.2, lon: -3.15 },
  DD: { lat: 56.46, lon: -2.97 },
  AB: { lat: 57.15, lon: -2.09 },
  PH: { lat: 56.4, lon: -3.43 },
  IV: { lat: 57.48, lon: -4.22 },
  PA: { lat: 55.84, lon: -4.43 },
  ML: { lat: 55.78, lon: -3.94 },
};

/**
 * Get approximate coordinates for a UK postcode.
 * Tries the full prefix first (e.g. "NW"), then the first letter.
 */
function postcodeToCoords(postcode) {
  if (!postcode) return null;
  const clean = postcode.toUpperCase().replace(/\s/g, '');

  // Try progressively shorter prefixes
  for (let len = Math.min(3, clean.length); len >= 1; len--) {
    const prefix = clean.substring(0, len);
    if (POSTCODE_COORDS[prefix]) {
      return POSTCODE_COORDS[prefix];
    }
  }

  // Default to central London if unknown
  return { lat: 51.5074, lon: -0.1278 };
}

module.exports = { getDistance, postcodeToCoords };
