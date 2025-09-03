// ML prediction engine with advanced analysis

const SoilAnalyzer = require('./soil-analyzer');

class MLPredictor {
  constructor() {
    this.soilAnalyzer = new SoilAnalyzer();
  }

  async predict(request) {
    // Enhanced ML-like prediction logic - replace with actual ML model
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate ML processing

    const { soil_features, location, crop_preference } = request;
    
    // Initialize prediction variables
    let fertility_score = 0.5;
    const reasons = [];
    const fertilizer_recommendations = [];
    const crop_recommendations = [];
    const diagnostic_tags = [];

    // Advanced nutrient interaction analysis
    const nutrient_ratios = this.soilAnalyzer.calculateNutrientRatios(soil_features);
    const environmental_factors = this.soilAnalyzer.analyzeEnvironmentalFactors(soil_features, location);
    
    // Multi-factor soil analysis
    const ph_impact = this.soilAnalyzer.analyzePH(soil_features, reasons, fertilizer_recommendations, diagnostic_tags);
    const nitrogen_impact = this.soilAnalyzer.analyzeNitrogen(soil_features, reasons, fertilizer_recommendations, diagnostic_tags);
    const phosphorus_impact = this.soilAnalyzer.analyzePhosphorus(soil_features, reasons, fertilizer_recommendations, diagnostic_tags);
    const potassium_impact = this.soilAnalyzer.analyzePotassium(soil_features, reasons, fertilizer_recommendations, diagnostic_tags);
    const organic_matter_impact = this.soilAnalyzer.analyzeOrganicMatter(soil_features, reasons, fertilizer_recommendations, diagnostic_tags);
    const moisture_impact = this.soilAnalyzer.analyzeMoisture(soil_features, reasons, diagnostic_tags);
    const conductivity_impact = this.soilAnalyzer.analyzeConductivity(soil_features, reasons, diagnostic_tags);
    const temperature_impact = this.soilAnalyzer.analyzeTemperature(soil_features, reasons, diagnostic_tags);

    // Calculate weighted fertility score
    fertility_score = this.calculateFertilityScore([
      ph_impact, nitrogen_impact, phosphorus_impact, potassium_impact,
      organic_matter_impact, moisture_impact, conductivity_impact, temperature_impact
    ], nutrient_ratios, environmental_factors);

    // Add nutrient interaction insights
    this.addNutrientInteractionAnalysis(nutrient_ratios, reasons, fertilizer_recommendations);
    
    // Add environmental considerations
    this.addEnvironmentalAnalysis(environmental_factors, reasons, fertilizer_recommendations);

    // Normalize fertility score
    fertility_score = Math.max(0, Math.min(1, fertility_score));

    // Determine fertility level
    let fertility_level;
    if (fertility_score < 0.4) {
      fertility_level = "Low";
    } else if (fertility_score < 0.7) {
      fertility_level = "Medium";
    } else {
      fertility_level = "High";
    }

    // Generate crop recommendations based on soil conditions
    this.generateCropRecommendations(crop_recommendations, fertility_level, soil_features);
    
    // Enhance crop recommendations with ML-like filtering
    this.enhanceCropRecommendations(crop_recommendations, soil_features, crop_preference, environmental_factors);

    return {
      fertility_score,
      fertility_level,
      reasons,
      fertilizer_recommendations,
      crop_recommendations,
      diagnostic_tags
    };
  }

  calculateFertilityScore(impacts, nutrient_ratios, environmental_factors) {
    const base_score = 0.5 + impacts.reduce((sum, impact) => sum + impact, 0);
    
    // Adjust for nutrient interactions
    let interaction_adjustment = 0;
    if (nutrient_ratios.n_p_ratio > 4 || nutrient_ratios.n_p_ratio < 1.5) {
      interaction_adjustment -= 0.05; // Poor N:P ratio
    }
    if (nutrient_ratios.n_k_ratio > 1.5 || nutrient_ratios.n_k_ratio < 0.5) {
      interaction_adjustment -= 0.03; // Poor N:K ratio
    }
    
    // Environmental stress adjustments
    if (environmental_factors.temperature_stress) interaction_adjustment -= 0.1;
    if (environmental_factors.moisture_stress) interaction_adjustment -= 0.08;
    if (environmental_factors.salinity_risk) interaction_adjustment -= 0.12;
    
    return Math.max(0, Math.min(1, base_score + interaction_adjustment));
  }

  addNutrientInteractionAnalysis(ratios, reasons, fertilizers) {
    if (ratios.n_p_ratio > 4) {
      reasons.push(`High N:P ratio (${ratios.n_p_ratio.toFixed(1)}) may cause phosphorus deficiency symptoms despite adequate nitrogen`);
      fertilizers.push({
        name: "NPK 10-20-10",
        dose_kg_per_hectare: 100,
        explanation: "Balances high nitrogen with additional phosphorus"
      });
    }
    
    if (ratios.nutrient_density < 50) {
      reasons.push(`Low overall nutrient density indicates need for comprehensive fertilization program`);
      fertilizers.push({
        name: "Complete NPK 15-15-15",
        dose_kg_per_hectare: 200,
        explanation: "Provides balanced nutrition for overall soil improvement"
      });
    }
  }

  addEnvironmentalAnalysis(factors, reasons, fertilizers) {
    if (factors.salinity_risk) {
      reasons.push(`High salinity requires salt-tolerant management and improved drainage`);
      fertilizers.push({
        name: "Gypsum (CaSO4)",
        dose_kg_per_hectare: 500,
        explanation: "Helps displace sodium and improve soil structure in saline conditions"
      });
    }
    
    if (factors.temperature_stress && factors.climate_zone === 'arid') {
      reasons.push(`Arid climate conditions require enhanced organic matter and water conservation`);
    }
  }

  generateCropRecommendations(crop_recommendations, fertility_level, soil_features) {
    // Crop recommendations based on soil conditions
    if (fertility_level === "High") {
      crop_recommendations.push(
        { crop: "Tomato", reason: "High fertility supports intensive vegetable production", expected_yield_t_ha: 25 },
        { crop: "Maize", reason: "Excellent conditions for high-yielding cereal crops", expected_yield_t_ha: 8 },
        { crop: "Cotton", reason: "Good fertility and water management support fiber crops", expected_yield_t_ha: 2.5 }
      );
    } else if (fertility_level === "Medium") {
      crop_recommendations.push(
        { crop: "Wheat", reason: "Moderate fertility suitable for cereal production", expected_yield_t_ha: 4 },
        { crop: "Soybean", reason: "Legume crop that can fix nitrogen and improve soil", expected_yield_t_ha: 2.8 },
        { crop: "Sunflower", reason: "Tolerant crop suitable for moderate fertility soils", expected_yield_t_ha: 2 }
      );
    } else {
      crop_recommendations.push(
        { crop: "Barley", reason: "Hardy crop tolerant of lower fertility conditions", expected_yield_t_ha: 2.5 },
        { crop: "Millet", reason: "Drought-tolerant crop suitable for marginal soils", expected_yield_t_ha: 1.8 },
        { crop: "Legume Cover Crop", reason: "Improve soil fertility through nitrogen fixation", expected_yield_t_ha: 0 }
      );
    }
  }

  enhanceCropRecommendations(crops, soil_features, preferences, environmental_factors) {
    // Filter based on soil constraints
    const filtered_crops = crops.filter(crop => {
      if (soil_features.ph < 5.5 && ['Tomato', 'Cotton'].includes(crop.crop)) return false;
      if (soil_features.ec > 2.0 && ['Tomato'].includes(crop.crop)) return false;
      if (environmental_factors?.temperature_stress && ['Wheat'].includes(crop.crop)) return false;
      return true;
    });
    
    // Add climate-specific recommendations
    if (environmental_factors?.climate_zone === 'tropical') {
      filtered_crops.push({
        crop: "Cassava",
        reason: "Excellent adaptation to tropical conditions and poor soils",
        expected_yield_t_ha: 15
      });
    }
    
    // Prioritize user preferences
    if (preferences?.length) {
      filtered_crops.sort((a, b) => {
        const a_preferred = preferences.some(pref => a.crop.toLowerCase().includes(pref.toLowerCase()));
        const b_preferred = preferences.some(pref => b.crop.toLowerCase().includes(pref.toLowerCase()));
        if (a_preferred && !b_preferred) return -1;
        if (b_preferred && !a_preferred) return 1;
        return 0;
      });
    }
    
    // Update original array
    crops.splice(0, crops.length, ...filtered_crops.slice(0, 5));
  }
}

module.exports = MLPredictor;