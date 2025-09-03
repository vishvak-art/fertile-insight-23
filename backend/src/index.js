const express = require('express');
const cors = require('cors');
require('dotenv').config();

const locationRoutes = require('./routes/location');
const weatherRoutes = require('./routes/weather');
const soilPredictionRoutes = require('./routes/soil-prediction');
const aiAssistantRoutes = require('./routes/ai-assistant');
const reportsRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/location', locationRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/soil', soilPredictionRoutes);
app.use('/api/ai', aiAssistantRoutes);
app.use('/api/reports', reportsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Soil Prediction Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});