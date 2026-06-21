const lat = 51.5074;
const lon = -0.1278;
const radius = 3000;

const overpassQuery = `[out:json][timeout:15];
(
  node["amenity"="recycling"](around:${radius},${lat},${lon});
  way["amenity"="recycling"](around:${radius},${lat},${lon});
  node["amenity"="waste_disposal"](around:${radius},${lat},${lon});
);
out center;`;

async function run() {
  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `data=${encodeURIComponent(overpassQuery)}`
    });
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Elements count:', data.elements ? data.elements.length : 0);
    if (data.elements && data.elements.length > 0) {
      console.log('First element sample:', JSON.stringify(data.elements[0], null, 2));
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
