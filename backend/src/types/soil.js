// Soil analysis specific types and interfaces

/**
 * @typedef {Object} NutrientRatios
 * @property {number} n_p_ratio - Nitrogen to Phosphorus ratio
 * @property {number} n_k_ratio - Nitrogen to Potassium ratio
 * @property {number} p_k_ratio - Phosphorus to Potassium ratio
 * @property {number} cation_balance - Cation balance score
 * @property {number} nutrient_density - Overall nutrient density
 */

/**
 * @typedef {Object} EnvironmentalFactors
 * @property {boolean} temperature_stress - Whether temperature causes stress
 * @property {boolean} moisture_stress - Whether moisture causes stress
 * @property {boolean} salinity_risk - Whether salinity is a risk
 * @property {string} climate_zone - Climate zone classification
 * @property {number} seasonal_factor - Seasonal adjustment factor
 */

/**
 * @typedef {Object} AnalysisImpact
 * @property {number} score - Impact score (-1 to 1)
 * @property {'low'|'medium'|'high'|'critical'} severity - Impact severity
 */

/**
 * @typedef {'tropical'|'subtropical'|'temperate'|'cool'|'arid'} ClimateZone
 */

module.exports = {
  // Export types for JSDoc usage
};