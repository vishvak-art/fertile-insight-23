# Terra-Scope: Enhanced ML Integration with Weather, Reports & AI Assistant

This guide covers the enhanced Terra-Scope system with weather/location integration, PDF/CSV report generation, and AI assistant capabilities.

## 🚀 Quick Start

### 1. Python Environment Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and configure:

```bash
# Required for basic functionality
PORT=3001

# Weather integration (optional but recommended)
OPENWEATHER_API_KEY=your_openweathermap_api_key

# AI Assistant (optional)
OPENAI_API_KEY=your_openai_api_key

# Reports directory
REPORTS_DIR=./reports
```

**Get API Keys:**
- OpenWeatherMap: https://openweathermap.org/api (free tier available)
- OpenAI: https://platform.openai.com/api-keys (usage-based pricing)

### 3. Train the ML Model
```bash
cd backend
python train_model.py
```

### 4. Start Backend Server
```bash
node src/index.js
```

### 5. Start Frontend
```bash
# From project root
npm start
```

## 🌟 New Features

### Weather & Location Integration
- **Auto-detect location**: Uses browser geolocation and IP-based fallback
- **Weather enrichment**: Fetches current weather to enhance soil analysis
- **Caching**: 30-minute TTL cache for weather data to reduce API calls
- **Reverse geocoding**: Converts coordinates to human-readable addresses

### Report Generation
- **PDF Reports**: Comprehensive reports with charts, soil parameters, and recommendations
- **CSV Exports**: Structured data for spreadsheet analysis
- **Visual Charts**: Matplotlib/Seaborn generated charts showing nutrient levels, pH, fertility scores
- **Downloadable**: Automatic download links for generated reports

### AI Assistant
- **Context-aware**: Understands your soil data and provides personalized advice
- **Fallback system**: Works with or without OpenAI API key
- **Smart suggestions**: Offers actionable next steps and resources
- **Real-time chat**: Floating chat widget with conversation history

## 🔧 API Endpoints

### Enhanced Soil Prediction
```bash
curl -X POST http://localhost:3001/api/soil/predict \
  -H "Content-Type: application/json" \
  -d '{
    "soil_features": {
      "ph": 6.5,
      "nitrogen": 45,
      "phosphorus": 18,
      "potassium": 130,
      "organic_matter": 3.2,
      "moisture": 28,
      "ec": 0.9,
      "temperature": 22
    },
    "location": {
      "lat": 12.9716,
      "lon": 77.5946
    }
  }'
```

### Report Generation
```bash
# Generate report
curl -X POST http://localhost:3001/api/reports/report \
  -H "Content-Type: application/json" \
  -d '{
    "prediction": {...},
    "soil_features": {...},
    "location": {...}
  }'

# List reports
curl http://localhost:3001/api/reports/reports

# Download report
curl http://localhost:3001/api/reports/report/REPORT_ID/download/pdf
```

### AI Assistant
```bash
curl -X POST http://localhost:3001/api/ai/assist \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How can I improve my soil pH?",
    "context": {
      "fertility_level": "Medium",
      "ph": 5.8
    }
  }'
```

## 📊 Technical Architecture

### Backend Services
- **Weather Cache**: In-memory TTL cache for weather data
- **ML Integration**: Python child_process integration for ML predictions
- **Report Generator**: Python-based PDF/CSV generation with matplotlib
- **AI Assistant**: OpenAI integration with rule-based fallback

### Frontend Components
- **Enhanced SoilPrediction**: Auto-detect location and weather
- **PredictionResults**: Display enriched results with report generation
- **ChatWidget**: Floating AI assistant with context awareness

### Python Scripts
- **train_model.py**: Trains RandomForest classifier on soil data
- **predictor.py**: Loads model and makes predictions
- **generate_report.py**: Creates comprehensive PDF/CSV reports

## 🛡️ Error Handling & Fallbacks

### Graceful Degradation
- **No weather API**: System works without weather integration
- **ML prediction fails**: Falls back to rule-based analysis only
- **No OpenAI key**: Uses built-in rule-based chat responses
- **Report generation fails**: Provides error feedback, doesn't crash

### Caching Strategy
- **Weather data**: 30-minute cache reduces API calls
- **Location data**: Cached with weather data
- **Report metadata**: Stored as JSON for quick access

## 🧪 Testing

### Test ML Pipeline
```bash
cd backend
echo '{"N":45,"P":18,"K":130,"pH":6.5,"EC":0.9,"OC":3.2,"S":12,"Zn":0.7,"Fe":4.2,"Cu":0.3,"Mn":3.1,"B":0.5}' | python predictor.py
```

### Test Weather Integration
```bash
curl -X POST http://localhost:3001/api/soil/predict \
  -H "Content-Type: application/json" \
  -d '{"soil_features":{"ph":6.5,"nitrogen":45,"phosphorus":18,"potassium":130,"organic_matter":3.2,"moisture":28,"ec":0.9,"temperature":22},"location":{"lat":12.97,"lon":77.59}}'
```

### Test Report Generation
```bash
# This will generate both PDF and CSV reports
curl -X POST http://localhost:3001/api/reports/report \
  -H "Content-Type: application/json" \
  -d '{"prediction":{"fertility_level":"High","fertility_score":0.85,"fertilizer_recommendations":[],"crop_recommendations":[]},"soil_features":{"ph":6.5,"nitrogen":45,"phosphorus":18,"potassium":130,"organic_matter":3.2,"moisture":28,"ec":0.9,"temperature":22}}'
```

## 📱 Frontend Usage

### Enhanced Analysis Flow
1. **Enter soil parameters** or use sample data
2. **Auto-detect location** with one click
3. **Auto-detect temperature** based on location
4. **Run analysis** to get ML + rule-based predictions
5. **Generate comprehensive report** with charts and recommendations
6. **Chat with AI assistant** for personalized advice

### Report Features
- **Visual charts**: Nutrient levels, pH gauge, fertility score
- **Detailed tables**: All soil parameters with status indicators
- **Recommendations**: Fertilizer dosages and crop suggestions
- **Professional formatting**: Ready for sharing with agronomists

### AI Assistant Features
- **Context awareness**: Knows your soil data and analysis results
- **Smart suggestions**: Clickable quick actions
- **Resource recommendations**: Links to helpful guides
- **Conversation history**: Maintains chat context

## 🔧 Customization

### Adding New Weather Providers
Edit `backend/src/routes/soil-prediction.js` and add your provider in the `enrichWithLocationWeather` function.

### Customizing Reports
Modify `backend/generate_report.py` to change report layout, add charts, or include additional data.

### Extending AI Assistant
Update `backend/src/routes/ai-assistant.js` to add new response patterns or integrate with different AI providers.

## 🚨 Troubleshooting

### Common Issues

**Python scripts not running:**
```bash
# Check Python path
which python3
# Ensure virtual environment is activated
source venv/bin/activate
```

**Weather API not working:**
- Verify API key in `.env`
- Check API quota/billing status
- Review network/firewall settings

**Reports not generating:**
- Ensure `REPORTS_DIR` exists and is writable
- Check Python dependencies are installed
- Verify matplotlib backend compatibility

**AI Assistant not responding:**
- Check OpenAI API key and billing
- Review network connectivity
- Fallback responses should work without API key

### Debug Mode
Set `NODE_ENV=development` for verbose logging and error details.

## 📈 Performance Tips

### Optimization
- Weather data is cached for 30 minutes
- Use small coordinate precision for cache hits
- ML model is loaded once per prediction request
- Report generation happens asynchronously

### Scaling Considerations
- Consider Redis for distributed weather caching
- Use queues for report generation at scale
- Implement database storage for prediction history
- Add rate limiting for AI assistant requests

## 🤝 Contributing

1. Test all functionality with and without API keys
2. Ensure graceful fallbacks work properly  
3. Add tests for new features
4. Update documentation for API changes
5. Consider mobile responsiveness for UI changes

## 📄 License

This enhanced version maintains the same license as the original Terra-Scope project.