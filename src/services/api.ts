// Main API service for soil fertility predictions and data management

import { 
  PredictionRequest, 
  PredictionResponse, 
  SoilSample, 
  ChatMessage, 
  ChatResponse 
} from '../types/api';

class APIService {
  private baseURL = 'http://localhost:3001/api';

  constructor() {
    // No longer need local ML predictor - using backend
  }

  async predict(request: PredictionRequest): Promise<PredictionResponse> {
    try {
      const response = await fetch(`${this.baseURL}/soil/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Prediction failed');
      }

      return data.prediction;
    } catch (error) {
      console.error('Error predicting soil fertility:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to predict soil fertility');
    }
  }

  async saveSoilSample(request: PredictionRequest, prediction: PredictionResponse): Promise<SoilSample> {
    try {
      const sampleData = {
        soil_features: request.soil_features,
        location: request.location,
        crop_preference: request.crop_preference,
        prediction,
        user_id: '1' // Mock user ID - replace with actual user management
      };

      const response = await fetch(`${this.baseURL}/soil/samples`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sampleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to save soil sample');
      }

      return data.sample;
    } catch (error) {
      console.error('Error saving soil sample:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to save soil sample');
    }
  }

  async getSoilSamples(): Promise<SoilSample[]> {
    try {
      const response = await fetch(`${this.baseURL}/soil/samples?user_id=1&limit=20`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch soil samples');
      }

      return data.samples;
    } catch (error) {
      console.error('Error fetching soil samples:', error);
      // Return empty array on error to avoid breaking the UI
      return [];
    }
  }

  async chat(message: ChatMessage): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseURL}/soil/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Chat failed');
      }

      return {
        reply: data.reply,
        suggested_actions: data.suggested_actions,
        prediction_link: data.prediction_link
      };
    } catch (error) {
      console.error('Error in chat:', error);
      // Return fallback response on error
      return {
        reply: "I'm having trouble connecting right now. Please try asking about soil pH, nutrients, or fertilizers!",
        suggested_actions: ["Try again later", "Get soil analysis"]
      };
    }
  }
}

export const apiService = new APIService();