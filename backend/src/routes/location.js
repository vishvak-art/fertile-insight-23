const express = require('express');
const axios = require('axios');
const router = express.Router();

// Get location by IP
router.get('/ip', async (req, res) => {
  try {
    const response = await axios.get('http://ip-api.com/json/');
    const { lat, lon, city, country, region } = response.data;
    
    res.json({
      location: {
        lat: parseFloat(lat),
        lon: parseFloat(lon)
      },
      address: {
        city,
        country,
        region
      }
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ 
      error: 'Failed to fetch location',
      message: error.message 
    });
  }
});

// Reverse geocoding - get address from coordinates
router.post('/reverse', async (req, res) => {
  try {
    const { lat, lon } = req.body;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Using OpenStreetMap Nominatim API (free)
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`
    );
    
    const { display_name, address } = response.data;
    
    res.json({
      location: { lat: parseFloat(lat), lon: parseFloat(lon) },
      address: {
        formatted: display_name,
        city: address?.city || address?.town || address?.village,
        country: address?.country,
        region: address?.state || address?.region
      }
    });
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    res.status(500).json({ 
      error: 'Failed to reverse geocode location',
      message: error.message 
    });
  }
});

module.exports = router;