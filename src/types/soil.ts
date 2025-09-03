// Soil analysis specific types

export interface NutrientRatios {
  n_p_ratio: number;
  n_k_ratio: number;
  p_k_ratio: number;
  cation_balance: number;
  nutrient_density: number;
}

export interface EnvironmentalFactors {
  temperature_stress: boolean;
  moisture_stress: boolean;
  salinity_risk: boolean;
  climate_zone: string;
  seasonal_factor: number;
}

export interface AnalysisImpact {
  score: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export type ClimateZone = 'tropical' | 'subtropical' | 'temperate' | 'cool' | 'arid';