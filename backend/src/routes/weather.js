const express = require('express');
const axios = require('axios');
const router = express.Router();

// Get weather data by coordinates
router.post('/current', async (req, res) => {
  try {
    const { lat, lon } = req.body;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Using OpenWeatherMap free API (requires API key)
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    
    if (!API_KEY) {
      // Fallback to a mock response for development
      return res.json({
        temperature: 25, // Default temperature in Celsius
        humidity: 65,
        description: 'Clear sky',
        location: { lat, lon },
        source: 'mock_data'
      });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    
    const { main, weather } = response.data;
    
    res.json({
      temperature: Math.round(main.temp),
      humidity: main.humidity,
      description: weather[0].description,
      location: { lat: parseFloat(lat), lon: parseFloat(lon) },
      source: 'openweather'
    });
  } catch (error) {
    console.error('Error fetching weather:', error);
    
    // Fallback response
    res.json({
      temperature: 25,
      humidity: 65,
      description: 'Unable to fetch weather data',
      location: { lat: req.body.lat, lon: req.body.lon },
      source: 'fallback',
      error: error.message
    });
  }
});

// Get weather forecast (5 day forecast)
router.post('/forecast', async (req, res) => {
  try {
    const { lat, lon } = req.body;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const API_KEY = process.env.OPENWEATHER_API_KEY;
    
    if (!API_KEY) {
      return res.json({
        forecast: [
          { date: new Date().toISOString(), temperature: 25, humidity: 65, description: 'Mock data' }
        ],
        location: { lat, lon },
        source: 'mock_data'
      });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    
    const forecast = response.data.list.slice(0, 5).map(item => ({
      date: item.dt_txt,
      temperature: Math.round(item.main.temp),
      humidity: item.main.humidity,
      description: item.weather[0].description
    }));
    
    res.json({
      forecast,
      location: { lat: parseFloat(lat), lon: parseFloat(lon) },
      source: 'openweather'
    });
  } catch (error) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather forecast',
      message: error.message 
    });
  }
});

module.exports = router;