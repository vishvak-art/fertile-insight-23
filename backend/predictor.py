#!/usr/bin/env python3
"""
Soil fertility ML predictor script.
Reads JSON soil features from stdin and outputs prediction.

Expected input JSON format:
{
  "N": 45.0,
  "P": 18.0,
  "K": 120.0,
  "pH": 6.5,
  "EC": 0.8,
  "OC": 2.1,
  "S": 10.0,
  "Zn": 0.6,
  "Fe": 3.2,
  "Cu": 0.25,
  "Mn": 2.5,
  "B": 0.4
}

Output format:
{"prediction": "Medium", "confidence": 0.85}
"""

import sys
import json
import joblib
import numpy as np
from pathlib import Path

# Feature order - MUST match training order
FEATURE_ORDER = ['N', 'P', 'K', 'pH', 'EC', 'OC', 'S', 'Zn', 'Fe', 'Cu', 'Mn', 'B']

def load_model():
    """Load the trained model"""
    model_path = Path(__file__).parent / 'soil_fertility_model.joblib'
    
    if not model_path.exists():
        print(json.dumps({
            "error": "Model file not found. Please run train_model.py first."
        }))
        sys.exit(1)
    
    try:
        return joblib.load(model_path)
    except Exception as e:
        print(json.dumps({
            "error": f"Failed to load model: {str(e)}"
        }))
        sys.exit(1)

def validate_input(soil_data):
    """Validate input soil features"""
    errors = []
    
    # Check all required features are present
    missing_features = [f for f in FEATURE_ORDER if f not in soil_data]
    if missing_features:
        errors.append(f"Missing features: {missing_features}")
    
    # Validate ranges
    if 'pH' in soil_data:
        if not (3.0 <= soil_data['pH'] <= 10.0):
            errors.append("pH must be between 3.0 and 10.0")
    
    if 'EC' in soil_data:
        if not (0.0 <= soil_data['EC'] <= 10.0):
            errors.append("EC must be between 0.0 and 10.0 dS/m")
    
    # Check for negative values (except pH)
    for feature in FEATURE_ORDER:
        if feature != 'pH' and feature in soil_data:
            if soil_data[feature] < 0:
                errors.append(f"{feature} cannot be negative")
    
    return errors

def predict_fertility(soil_data):
    """Make fertility prediction"""
    model = load_model()
    
    # Validate input
    validation_errors = validate_input(soil_data)
    if validation_errors:
        return {
            "error": "Input validation failed",
            "details": validation_errors
        }
    
    try:
        # Extract features in correct order
        features = [soil_data[feature] for feature in FEATURE_ORDER]
        features_array = np.array(features).reshape(1, -1)
        
        # Make prediction
        prediction = model.predict(features_array)[0]
        prediction_proba = model.predict_proba(features_array)[0]
        
        # Get confidence (max probability)
        confidence = float(np.max(prediction_proba))
        
        # Get class probabilities
        classes = model.classes_
        probabilities = {cls: float(prob) for cls, prob in zip(classes, prediction_proba)}
        
        return {
            "prediction": prediction,
            "confidence": round(confidence, 3),
            "probabilities": probabilities
        }
        
    except Exception as e:
        return {
            "error": f"Prediction failed: {str(e)}"
        }

def main():
    """Main function to handle input/output"""
    try:
        # Read from stdin or command line argument
        if len(sys.argv) > 1:
            # JSON string as command line argument
            input_data = json.loads(sys.argv[1])
        else:
            # Read from stdin
            input_data = json.load(sys.stdin)
        
        # Make prediction
        result = predict_fertility(input_data)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except json.JSONDecodeError:
        print(json.dumps({
            "error": "Invalid JSON input"
        }))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({
            "error": f"Unexpected error: {str(e)}"
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()