// earth's approximate radius in km
const radius = 6371;
const degToRad = Math.PI / 180;

// calculate great circle distance with Haversine formula
export function distance(lat1, lng1, lat2, lng2) {
  const a = (1 - Math.cos((lat2 - lat1) * degToRad)) / 2
                + Math.cos(lat1 * degToRad) * Math.cos(lat2 * degToRad) *
                  (1 - Math.cos((lng2 - lng1) * degToRad)) / 2;
  return 2 * radius * Math.asin(Math.sqrt(a));
}