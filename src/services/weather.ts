// Weather data fetching service

const BACKEND_URL = 'http://localhost:3001';

export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  location: {
    lat: number;
    lon: number;
  };
  source: string;
  error?: string;
}

export interface WeatherForecast {
  date: string;
  temperature: number;
  humidity: number;
  description: string;
}

export interface ForecastData {
  forecast: WeatherForecast[];
  location: {
    lat: number;
    lon: number;
  };
  source: string;
}

export class WeatherService {
  /**
   * Get current weather data for given coordinates
   */
  static async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/weather/current`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat, lon }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      
      // Return fallback data
      return {
        temperature: 25,
        humidity: 65,
        description: 'Weather data unavailable',
        location: { lat, lon },
        source: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get 5-day weather forecast
   */
  static async getWeatherForecast(lat: number, lon: number): Promise<ForecastData> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/weather/forecast`, {
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
      console.error('Error fetching weather forecast:', error);
      throw error;
    }
  }

  /**
   * Get weather data with location detection
   */
  static async getWeatherForCurrentLocation(): Promise<WeatherData> {
    const { LocationService } = await import('./location');
    
    try {
      const locationData = await LocationService.getUserLocation();
      const weatherData = await this.getCurrentWeather(
        locationData.location.lat,
        locationData.location.lon
      );
      
      return weatherData;
    } catch (error) {
      console.error('Error getting weather for current location:', error);
      throw error;
    }
  }
}