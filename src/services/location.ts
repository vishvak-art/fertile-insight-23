// Location detection and geocoding services

const BACKEND_URL = 'http://localhost:3001';

export interface LocationData {
  location: {
    lat: number;
    lon: number;
  };
  address?: {
    city?: string;
    country?: string;
    region?: string;
    formatted?: string;
  };
}

export class LocationService {
  /**
   * Get user location using browser geolocation API
   */
  static async getCurrentPosition(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Get location by IP address (fallback method)
   */
  static async getLocationByIP(): Promise<LocationData> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/location/ip`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching location by IP:', error);
      throw error;
    }
  }

  /**
   * Convert coordinates to human-readable address
   */
  static async reverseGeocode(lat: number, lon: number): Promise<LocationData> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/location/reverse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat, lon }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw error;
    }
  }

  /**
   * Get user location with fallback chain:
   * 1. Try browser geolocation
   * 2. Fallback to IP-based location
   */
  static async getUserLocation(): Promise<LocationData> {
    try {
      // Try browser geolocation first
      const coords = await this.getCurrentPosition();
      const locationData = await this.reverseGeocode(coords.lat, coords.lon);
      return locationData;
    } catch (error) {
      console.warn('Browser geolocation failed, trying IP-based location:', error);
      
      try {
        // Fallback to IP-based location
        const locationData = await this.getLocationByIP();
        return locationData;
      } catch (ipError) {
        console.error('All location methods failed:', ipError);
        throw new Error('Unable to determine location. Please enter manually.');
      }
    }
  }
}