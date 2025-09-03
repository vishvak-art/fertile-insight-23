# Soil Prediction Backend

Backend services for the soil prediction application, providing location detection, weather data, and AI-powered soil fertility analysis APIs.

## Features

- 🌍 **Location Detection**: Get user location via IP geolocation
- 🌤️ **Weather Data**: Fetch current weather and temperature data
- 📍 **Reverse Geocoding**: Convert coordinates to human-readable addresses
- 🔬 **Soil Analysis**: AI-powered soil fertility prediction and crop recommendations
- 📊 **Data Management**: Save and retrieve soil samples and analysis history
- 💬 **Chat Support**: Intelligent chatbot for soil-related questions
- 🔄 **Fallback Support**: Works with or without API keys for development

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Add your OpenWeatherMap API key to `.env`:
```env
OPENWEATHER_API_KEY=your_api_key_here
```

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Location Services

#### `GET /api/location/ip`
Get user location based on IP address.

**Response:**
```json
{
  "location": {
    "lat": 40.7128,
    "lon": -74.0060
  },
  "address": {
    "city": "New York",
    "country": "United States",
    "region": "New York"
  }
}
```

#### `POST /api/location/reverse`
Convert coordinates to address.

**Request:**
```json
{
  "lat": 40.7128,
  "lon": -74.0060
}
```

### Weather Services

#### `POST /api/weather/current`
Get current weather data for coordinates.

**Request:**
```json
{
  "lat": 40.7128,
  "lon": -74.0060
}
```

**Response:**
```json
{
  "temperature": 25,
  "humidity": 65,
  "description": "Clear sky",
  "location": {
    "lat": 40.7128,
    "lon": -74.0060
  },
  "source": "openweather"
}
```

#### `POST /api/weather/forecast`
Get 5-day weather forecast.

### Soil Analysis Services

#### `POST /api/soil/predict`
Analyze soil fertility and get crop recommendations.

**Request:**
```json
{
  "soil_features": {
    "ph": 6.5,
    "nitrogen": 50,
    "phosphorus": 20,
    "potassium": 120,
    "organic_matter": 3.0,
    "moisture": 25,
    "ec": 0.8,
    "temperature": 25
  },
  "location": {
    "lat": 40.7128,
    "lon": -74.0060
  },
  "crop_preference": ["tomato", "wheat"]
}
```

**Response:**
```json
{
  "success": true,
  "prediction": {
    "fertility_score": 0.75,
    "fertility_level": "High",
    "reasons": ["Optimal soil pH promotes excellent nutrient availability"],
    "fertilizer_recommendations": [
      {
        "name": "NPK 15-15-15",
        "dose_kg_per_hectare": 200,
        "explanation": "Balanced nutrition for overall soil improvement"
      }
    ],
    "crop_recommendations": [
      {
        "crop": "Tomato",
        "reason": "High fertility supports intensive vegetable production",
        "expected_yield_t_ha": 25
      }
    ],
    "diagnostic_tags": ["optimal_conditions"]
  }
}
```

#### `POST /api/soil/samples`
Save soil sample with prediction results.

#### `GET /api/soil/samples`
Get saved soil samples for a user.

**Query Parameters:**
- `user_id` - User identifier (default: "anonymous")
- `limit` - Maximum number of samples to return (default: 10)

#### `POST /api/soil/chat`
Chat with AI assistant about soil-related questions.

**Request:**
```json
{
  "message": "What should I do about low pH soil?",
  "context": {}
}
```

**Response:**
```json
{
  "success": true,
  "reply": "Low pH soil can be corrected with lime application...",
  "suggested_actions": ["Test your soil pH", "Learn about lime application"]
}
```

## Configuration

- The server runs on port 3001 by default
- OpenWeatherMap API key is optional for development (mock data provided)
- Uses free services (ip-api.com, OpenStreetMap) for location detection

## Development

```bash
npm run dev    # Start with nodemon for auto-reload
npm start      # Start production server
```