// API-related TypeScript interfaces and types

export interface SoilFeatures {
  ph: number;
  nitrogen: number;    // mg/kg or ppm (N)
  phosphorus: number;  // mg/kg or ppm (P)
  potassium: number;   // mg/kg or ppm (K)
  organic_matter: number; // % (OC - Organic Carbon)
  moisture: number;    // %
  ec: number;         // dS/m (electrical conductivity)
  temperature: number; // Celsius
  sulfur: number;     // mg/kg or ppm (S)
  zinc: number;       // mg/kg or ppm (Zn)
  iron: number;       // mg/kg or ppm (Fe)
  copper: number;     // mg/kg or ppm (Cu)
  manganese: number;  // mg/kg or ppm (Mn)
  boron: number;      // mg/kg or ppm (B)
}

export interface Location {
  lat: number;
  lon: number;
}

export interface PredictionRequest {
  soil_features: SoilFeatures;
  location?: Location;
  crop_preference?: string[];
}

export interface FertilizerRecommendation {
  name: string;
  dose_kg_per_hectare: number;
  explanation: string;
}

export interface CropRecommendation {
  crop: string;
  reason: string;
  expected_yield_t_ha: number;
}

export interface PredictionResponse {
  // ML Prediction
  prediction_ml?: string;       // ML model prediction (Low/Medium/High)
  ml_confidence?: number;       // ML prediction confidence (0-1)
  ml_probabilities?: { [key: string]: number }; // Class probabilities
  ml_error?: string;           // Error message if ML fails
  
  // Rule-based Analysis  
  fertility_score: number;      // 0..1 normalized
  fertility_level: "Low" | "Medium" | "High";
  reasons: string[];
  fertilizer_recommendations: FertilizerRecommendation[];
  crop_recommendations: CropRecommendation[];
  diagnostic_tags: string[];
  nutrient_ratios?: any;       // Nutrient ratio analysis
  environmental_factors?: any; // Environmental factor analysis
}

export interface SoilSample {
  id: string;
  user_id: string;
  soil_features: SoilFeatures;
  location?: Location;
  created_at: string;
  prediction?: PredictionResponse;
}

export interface ChatMessage {
  message: string;
  context?: any;
}

export interface ChatResponse {
  reply: string;
  suggested_actions?: string[];
  prediction_link?: string;
}