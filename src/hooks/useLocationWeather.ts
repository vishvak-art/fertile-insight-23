import { useState, useEffect, useCallback } from 'react';
import { LocationService, type LocationData } from '@/services/location';
import { WeatherService, type WeatherData } from '@/services/weather';
import { useToast } from '@/hooks/use-toast';

interface LocationWeatherState {
  location: LocationData | null;
  weather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
}

export const useLocationWeather = (autoFetch = false) => {
  const [state, setState] = useState<LocationWeatherState>({
    location: null,
    weather: null,
    isLoading: false,
    error: null,
  });
  
  const { toast } = useToast();

  const fetchLocationAndWeather = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get location first
      const locationData = await LocationService.getUserLocation();
      setState(prev => ({ ...prev, location: locationData }));

      // Then get weather for that location
      const weatherData = await WeatherService.getCurrentWeather(
        locationData.location.lat,
        locationData.location.lon
      );
      
      setState(prev => ({ 
        ...prev, 
        weather: weatherData,
        isLoading: false 
      }));

      if (weatherData.source === 'fallback') {
        toast({
          title: "Weather data limited",
          description: "Using approximate weather data. For accurate readings, configure weather API.",
          variant: "default"
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false 
      }));
      
      toast({
        title: "Location/Weather Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [toast]);

  const getLocationOnly = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const locationData = await LocationService.getUserLocation();
      setState(prev => ({ 
        ...prev, 
        location: locationData,
        isLoading: false 
      }));
      return locationData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false 
      }));
      throw new Error(errorMessage);
    }
  }, []);

  const getWeatherForCoords = useCallback(async (lat: number, lon: number) => {
    try {
      const weatherData = await WeatherService.getCurrentWeather(lat, lon);
      setState(prev => ({ ...prev, weather: weatherData }));
      return weatherData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get weather';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw new Error(errorMessage);
    }
  }, []);

  // Auto-fetch on mount if requested
  useEffect(() => {
    if (autoFetch) {
      fetchLocationAndWeather();
    }
  }, [autoFetch, fetchLocationAndWeather]);

  return {
    ...state,
    fetchLocationAndWeather,
    getLocationOnly,
    getWeatherForCoords,
    hasLocationPermission: !!state.location,
    getCurrentTemperature: () => state.weather?.temperature || null,
    getCurrentCoordinates: () => state.location?.location || null,
  };
};