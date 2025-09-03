# Terra-Scope ML Integration

## Setup Instructions

### 1. Python Environment Setup
```bash
cd backend
pip install -r requirements.txt
```

### 2. Train the ML Model
```bash
cd backend
python3 train_model.py
```

### 3. Start Backend
```bash
cd backend
npm install
npm run dev
```

### 4. Start Frontend
```bash
npm start
```

## API Testing

Test the prediction endpoint:
```bash
curl -X POST http://localhost:3001/api/soil/predict \
  -H "Content-Type: application/json" \
  -d '{
    "soil_features": {
      "nitrogen": 45, "phosphorus": 18, "potassium": 120,
      "ph": 6.5, "ec": 0.8, "organic_matter": 2.1,
      "sulfur": 10, "zinc": 0.6, "iron": 3.2, 
      "copper": 0.25, "manganese": 2.5, "boron": 0.4,
      "moisture": 25, "temperature": 25
    }
  }'
```

## Features Implemented

✅ Python ML model with RandomForest classifier
✅ Node.js backend integration via child_process
✅ Combined ML + rule-based predictions
✅ Fallback to rule-based analysis if ML fails
✅ Extended soil features (micronutrients)
✅ Updated React frontend for input collection
✅ ML prediction display in results

The system now combines machine learning predictions with existing rule-based soil analysis to provide comprehensive fertility assessments.