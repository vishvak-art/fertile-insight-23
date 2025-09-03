// Validation utilities for soil data

import { SoilFeatures } from '../types/api';

export const validateSoilFeatures = (features: Partial<SoilFeatures>): string[] => {
  const errors: string[] = [];

  if (features.ph !== undefined) {
    if (features.ph < 0 || features.ph > 14) {
      errors.push('pH must be between 0 and 14');
    }
  }

  if (features.nitrogen !== undefined) {
    if (features.nitrogen < 0 || features.nitrogen > 500) {
      errors.push('Nitrogen must be between 0 and 500 ppm');
    }
  }

  if (features.phosphorus !== undefined) {
    if (features.phosphorus < 0 || features.phosphorus > 200) {
      errors.push('Phosphorus must be between 0 and 200 ppm');
    }
  }

  if (features.potassium !== undefined) {
    if (features.potassium < 0 || features.potassium > 1000) {
      errors.push('Potassium must be between 0 and 1000 ppm');
    }
  }

  if (features.organic_matter !== undefined) {
    if (features.organic_matter < 0 || features.organic_matter > 20) {
      errors.push('Organic matter must be between 0 and 20%');
    }
  }

  if (features.moisture !== undefined) {
    if (features.moisture < 0 || features.moisture > 100) {
      errors.push('Moisture must be between 0 and 100%');
    }
  }

  if (features.ec !== undefined) {
    if (features.ec < 0 || features.ec > 20) {
      errors.push('Electrical conductivity must be between 0 and 20 dS/m');
    }
  }

  if (features.temperature !== undefined) {
    if (features.temperature < -20 || features.temperature > 60) {
      errors.push('Temperature must be between -20 and 60°C');
    }
  }

  return errors;
};