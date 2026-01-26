export interface Coordinates {
  lat: number;
  lng: number;
}

export function parseLatLng(input: string): Coordinates {
  const [latStr, lngStr] = input.split(',').map((s) => s.trim());

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    throw new Error(`Invalid coordinates: "${input}". Expected format: "lat,lng" (e.g., "37.7915,-122.4235")`);
  }

  if (lat < -90 || lat > 90) {
    throw new Error(`Invalid latitude: ${lat}. Must be between -90 and 90.`);
  }

  if (lng < -180 || lng > 180) {
    throw new Error(`Invalid longitude: ${lng}. Must be between -180 and 180.`);
  }

  return { lat, lng };
}
