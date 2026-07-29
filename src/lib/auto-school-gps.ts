/**
 * Automatic School GPS Initialization for Admin First Login (Hackathon Flow)
 *
 * When an Admin opens the Admin Portal for the first time, this function:
 * 1. Checks if a School GPS is already saved in the database.
 * 2. If missing, immediately requests browser location permission without popups or prompts.
 * 3. Saves latitude, longitude, reverse-geocoded address, and 100m radius to backend database.
 */
export async function autoInitializeSchoolGps(): Promise<void> {
  if (typeof window === 'undefined' || !navigator.geolocation) return;

  try {
    const activeToken = localStorage.getItem('triconnect_token');
    const headers: Record<string, string> = {};
    if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

    const res = await fetch('http://localhost:8000/api/v1/attendance/campuses', { headers });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // School location is already configured in DB
        return;
      }
    }
  } catch {
    /* backend offline or network error */
  }

  // Request browser location permission immediately
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      let address = 'Westside Academy Campus, Main District';

      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          { headers: { 'Accept-Language': 'en' } }
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.display_name) address = geoData.display_name;
        }
      } catch {
        /* fallback address */
      }

      try {
        const activeToken = localStorage.getItem('triconnect_token');
        const reqHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
        if (activeToken) reqHeaders['Authorization'] = `Bearer ${activeToken}`;

        await fetch('http://localhost:8000/api/v1/attendance/campuses', {
          method: 'POST',
          headers: reqHeaders,
          body: JSON.stringify({
            school_id: 'Westside Academy High',
            campus_name: 'Main Campus Center',
            latitude: lat,
            longitude: lng,
            formatted_address: address,
            attendance_radius: 100
          })
        });

        await fetch('http://localhost:8000/api/v1/attendance/settings', {
          method: 'PUT',
          headers: reqHeaders,
          body: JSON.stringify({
            school_name: 'Westside Academy High',
            campus_name: 'Main Campus Center',
            latitude: lat,
            longitude: lng,
            radius: 100
          })
        });
      } catch (err) {
        console.warn('Auto School GPS initialization error:', err);
      }
    },
    (err) => {
      console.warn('Auto School GPS location request failed:', err);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}
