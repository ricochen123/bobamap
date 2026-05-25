import { useCallback, useState } from "react";

export const LOCATION_DENIED_MESSAGE =
  "Location access was denied. Enable location permissions for this site in your browser settings (lock icon in the address bar), then click Use My Location again.";

export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return Promise.resolve(null);
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setPosition(coords);
          setLoading(false);
          resolve(coords);
        },
        (err) => {
          setLoading(false);
          if (err.code === err.PERMISSION_DENIED) {
            setError(LOCATION_DENIED_MESSAGE);
          } else if (err.code === err.TIMEOUT) {
            setError("Location request timed out. Try again.");
          } else {
            setError("Could not get your location. Try again.");
          }
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }, []);

  return { position, error, loading, requestLocation };
}
