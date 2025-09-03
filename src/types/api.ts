// API-related TypeScript interfaces and types

export interface SoilFeatures {
  ph: number;
  nitrogen: number;    // mg/kg or ppm
  phosphorus: number;
  potassium: number;
  organic_matter: number; // %
  moisture: number;    // %
  ec: number;         // dS/m (electrical conductivity)
  temperature: number; // Celsius
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
  fertility_score: number;      // 0..1 normalized
  fertility_level: "Low" | "Medium" | "High";
  reasons: string[];
  fertilizer_recommendations: FertilizerRecommendation[];
  crop_recommendations: CropRecommendation[];
  diagnostic_tags: string[];
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