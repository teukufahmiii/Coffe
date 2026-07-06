// Haversine formula to calculate distance in km
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Estimate travel time in minutes based on distance and average speed (km/h)
export function estimateTravelTime(distanceKm: number, speedKmh: number = 30): number {
  const timeHours = distanceKm / speedKmh;
  return Math.ceil(timeHours * 60);
}

// Reverse geocode — BigDataCloud supports browser CORS (Nominatim often blocks client-side)
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`
    );
    const data = await response.json();
    const parts = [data.locality, data.city, data.principalSubdivision, data.countryName].filter(Boolean);
    return parts.join(", ") || data.plusCode || `${lat}, ${lon}`;
  } catch (error) {
    console.error("Geocoding error:", error);
    return `${lat}, ${lon}`;
  }
}

export async function detectCurrentLocation(): Promise<{ lat: number; lng: number; address: string }> {
  if (!navigator.geolocation) {
    throw new Error("Browser Anda tidak mendukung deteksi lokasi");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const address = await reverseGeocode(lat, lng);
        resolve({ lat, lng, address });
      },
      (err) => reject(new Error(err.message)),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}
