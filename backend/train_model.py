#!/usr/bin/env python3
"""
Train a machine learning model for soil fertility prediction.
This script creates synthetic training data and trains a RandomForest classifier.

Feature order: ['N', 'P', 'K', 'pH', 'EC', 'OC', 'S', 'Zn', 'Fe', 'Cu', 'Mn', 'B']
Output: Fertility class (Low, Medium, High)
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import matplotlib.pyplot as plt

# Feature order - CRITICAL: predictor.py must use same order
FEATURE_ORDER = ['N', 'P', 'K', 'pH', 'EC', 'OC', 'S', 'Zn', 'Fe', 'Cu', 'Mn', 'B']

def generate_synthetic_data(n_samples=2000):
    """Generate synthetic soil fertility data for training"""
    np.random.seed(42)
    
    data = []
    
    for _ in range(n_samples):
        # Generate correlated soil features
        fertility_level = np.random.choice(['Low', 'Medium', 'High'], p=[0.3, 0.4, 0.3])
        
        if fertility_level == 'High':
            # High fertility soils
            N = np.random.normal(70, 15)  # Higher nitrogen
            P = np.random.normal(30, 8)   # Higher phosphorus
            K = np.random.normal(180, 30) # Higher potassium
            pH = np.random.normal(6.8, 0.4) # Near optimal pH
            EC = np.random.normal(1.2, 0.3) # Moderate conductivity
            OC = np.random.normal(3.5, 0.8) # Higher organic carbon
            S = np.random.normal(15, 3)   # Adequate sulfur
            Zn = np.random.normal(1.0, 0.2) # Good zinc
            Fe = np.random.normal(5.0, 1.0) # Good iron
            Cu = np.random.normal(0.4, 0.1) # Adequate copper
            Mn = np.random.normal(4.0, 0.8) # Good manganese
            B = np.random.normal(0.6, 0.1)  # Adequate boron
            
        elif fertility_level == 'Medium':
            # Medium fertility soils
            N = np.random.normal(45, 12)
            P = np.random.normal(20, 6)
            K = np.random.normal(120, 25)
            pH = np.random.normal(6.2, 0.6)
            EC = np.random.normal(0.8, 0.3)
            OC = np.random.normal(2.2, 0.6)
            S = np.random.normal(10, 2)
            Zn = np.random.normal(0.6, 0.2)
            Fe = np.random.normal(3.5, 1.2)
            Cu = np.random.normal(0.25, 0.08)
            Mn = np.random.normal(2.8, 0.6)
            B = np.random.normal(0.4, 0.1)
            
        else:  # Low fertility
            # Low fertility soils
            N = np.random.normal(25, 8)
            P = np.random.normal(12, 4)
            K = np.random.normal(70, 20)
            pH = np.random.normal(5.8, 0.8)
            EC = np.random.normal(0.4, 0.2)
            OC = np.random.normal(1.2, 0.4)
            S = np.random.normal(6, 2)
            Zn = np.random.normal(0.3, 0.1)
            Fe = np.random.normal(2.0, 0.8)
            Cu = np.random.normal(0.15, 0.05)
            Mn = np.random.normal(1.5, 0.4)
            B = np.random.normal(0.2, 0.05)
        
        # Apply constraints and add some noise
        N = max(0, N)
        P = max(0, P)
        K = max(0, K)
        pH = np.clip(pH, 3.5, 9.5)
        EC = max(0.1, EC)
        OC = max(0.1, OC)
        S = max(0, S)
        Zn = max(0, Zn)
        Fe = max(0, Fe)
        Cu = max(0, Cu)
        Mn = max(0, Mn)
        B = max(0, B)
        
        data.append([N, P, K, pH, EC, OC, S, Zn, Fe, Cu, Mn, B, fertility_level])
    
    return pd.DataFrame(data, columns=FEATURE_ORDER + ['fertility_class'])

def train_model():
    """Train the soil fertility prediction model"""
    print("Generating synthetic training data...")
    df = generate_synthetic_data(2000)
    
    # Features and target
    X = df[FEATURE_ORDER]
    y = df['fertility_class']
    
    print(f"Training dataset shape: {X.shape}")
    print(f"Class distribution:")
    print(y.value_counts())
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Train RandomForest classifier
    print("\nTraining RandomForest classifier...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate the model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\nModel Performance:")
    print(f"Accuracy: {accuracy:.3f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': FEATURE_ORDER,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\nFeature Importance:")
    print(feature_importance)
    
    # Save the model
    model_filename = 'soil_fertility_model.joblib'
    joblib.dump(model, model_filename)
    print(f"\nModel saved as {model_filename}")
    
    # Save feature order for reference
    with open('feature_order.txt', 'w') as f:
        f.write('\n'.join(FEATURE_ORDER))
    print("Feature order saved to feature_order.txt")
    
    return model, feature_importance

if __name__ == "__main__":
    model, importance = train_model()
    print("\nTraining completed successfully!")