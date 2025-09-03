const express = require('express');
const MLPredictor = require('../services/ml-predictor');
const router = express.Router();

// Initialize ML predictor
const mlPredictor = new MLPredictor();

// Mock database for soil samples
let soilSamples = [];

// Predict soil fertility
router.post('/predict', async (req, res) => {
  try {
    const { soil_features, location, crop_preference } = req.body;
    
    if (!soil_features) {
      return res.status(400).json({ 
        error: 'Soil features are required',
        required_fields: ['ph', 'nitrogen', 'phosphorus', 'potassium', 'organic_matter', 'moisture', 'ec', 'temperature']
      });
    }

    // Validate required soil features
    const requiredFields = ['ph', 'nitrogen', 'phosphorus', 'potassium', 'organic_matter', 'moisture', 'ec', 'temperature'];
    const missingFields = requiredFields.filter(field => soil_features[field] === undefined || soil_features[field] === null);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required soil features',
        missing_fields: missingFields
      });
    }

    // Create prediction request
    const request = {
      soil_features,
      location,
      crop_preference
    };

    // Get ML prediction
    const prediction = await mlPredictor.predict(request);
    
    res.json({
      success: true,
      prediction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in soil prediction:', error);
    res.status(500).json({ 
      error: 'Prediction failed',
      message: error.message 
    });
  }
});

// Save soil sample with prediction
router.post('/samples', async (req, res) => {
  try {
    const { soil_features, location, crop_preference, prediction, user_id } = req.body;
    
    if (!soil_features || !prediction) {
      return res.status(400).json({ error: 'Soil features and prediction are required' });
    }

    const sample = {
      id: String(soilSamples.length + 1),
      user_id: user_id || 'anonymous',
      soil_features,
      location,
      crop_preference,
      prediction,
      created_at: new Date().toISOString()
    };

    soilSamples.push(sample);
    
    res.json({
      success: true,
      sample,
      message: 'Soil sample saved successfully'
    });
  } catch (error) {
    console.error('Error saving soil sample:', error);
    res.status(500).json({ 
      error: 'Failed to save soil sample',
      message: error.message 
    });
  }
});

// Get soil samples for a user
router.get('/samples', async (req, res) => {
  try {
    const { user_id = 'anonymous', limit = 10 } = req.query;
    
    // Filter samples by user_id and limit results
    const userSamples = soilSamples
      .filter(sample => sample.user_id === user_id)
      .slice(-limit) // Get most recent samples
      .reverse(); // Most recent first
    
    res.json({
      success: true,
      samples: userSamples,
      total: userSamples.length
    });
  } catch (error) {
    console.error('Error fetching soil samples:', error);
    res.status(500).json({ 
      error: 'Failed to fetch soil samples',
      message: error.message 
    });
  }
});

// Get specific soil sample
router.get('/samples/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sample = soilSamples.find(s => s.id === id);
    
    if (!sample) {
      return res.status(404).json({ error: 'Soil sample not found' });
    }
    
    res.json({
      success: true,
      sample
    });
  } catch (error) {
    console.error('Error fetching soil sample:', error);
    res.status(500).json({ 
      error: 'Failed to fetch soil sample',
      message: error.message 
    });
  }
});

// Chat endpoint for soil-related questions
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Simple chatbot logic - replace with actual AI/ML service
    await new Promise(resolve => setTimeout(resolve, 1000));

    const text = message.toLowerCase();
    let reply;
    let suggested_actions = [];
    
    if (text.includes('ph') || text.includes('acidity')) {
      reply = "Soil pH measures acidity/alkalinity on a scale of 0-14. Most crops prefer a pH between 6.0-7.0. Low pH can be corrected with lime application, while high pH may need sulfur or organic matter additions.";
      suggested_actions = ["Test your soil pH", "Learn about lime application"];
    } else if (text.includes('nitrogen') || text.includes('n')) {
      reply = "Nitrogen is essential for plant growth and green color. Signs of deficiency include yellowing leaves. You can add nitrogen through urea, ammonium sulfate, or organic sources like compost.";
      suggested_actions = ["Check nitrogen levels", "View fertilizer options"];
    } else if (text.includes('fertilizer')) {
      reply = "Choose fertilizers based on your soil test results. NPK fertilizers provide nitrogen, phosphorus, and potassium. Organic options include compost, manure, and cover crops for long-term soil health.";
      suggested_actions = ["Get soil analysis", "Browse fertilizer types"];
    } else {
      reply = "I can help you with soil fertility questions, fertilizer recommendations, and crop selection. Try asking about pH, nutrients, or specific crops you'd like to grow!";
      suggested_actions = ["Ask about soil testing", "Get crop recommendations", "Learn about fertilizers"];
    }

    res.json({
      success: true,
      reply,
      suggested_actions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ 
      error: 'Chat failed',
      message: error.message 
    });
  }
});

module.exports = router;