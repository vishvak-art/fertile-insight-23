// Soil analysis and ML prediction methods

class SoilAnalyzer {
  calculateNutrientRatios(soil_features) {
    return {
      n_p_ratio: soil_features.nitrogen / Math.max(soil_features.phosphorus, 1),
      n_k_ratio: soil_features.nitrogen / Math.max(soil_features.potassium, 1),
      p_k_ratio: soil_features.phosphorus / Math.max(soil_features.potassium, 1),
      cation_balance: (soil_features.potassium + (soil_features.ec * 100)) / 2,
      nutrient_density: (soil_features.nitrogen + soil_features.phosphorus + soil_features.potassium) / 3
    };
  }

  analyzeEnvironmentalFactors(soil_features, location) {
    return {
      temperature_stress: soil_features.temperature > 35 || soil_features.temperature < 10,
      moisture_stress: soil_features.moisture < 15 || soil_features.moisture > 40,
      salinity_risk: soil_features.ec > 2.0,
      climate_zone: this.estimateClimateZone(soil_features.temperature, location),
      seasonal_factor: this.getSeasonalFactor(location)
    };
  }

  analyzePH(soil_features, reasons, fertilizers, tags) {
    if (soil_features.ph < 5.5) {
      reasons.push(`Severely acidic soil (pH ${soil_features.ph}) severely limits nutrient availability and microbial activity`);
      fertilizers.push({
        name: "Agricultural Lime (CaCO3)",
        dose_kg_per_hectare: Math.round(800 + (6.5 - soil_features.ph) * 200),
        explanation: `Corrects severe acidity. Apply gradually over 2-3 seasons to raise pH to 6.5`
      });
      tags.push("severe_acidity", "lime_required");
      return -0.25;
    } else if (soil_features.ph < 6.0) {
      reasons.push(`Low soil pH (${soil_features.ph}) reduces nutrient availability, especially phosphorus and molybdenum`);
      fertilizers.push({
        name: "Dolomitic Lime",
        dose_kg_per_hectare: Math.round(400 + (6.5 - soil_features.ph) * 150),
        explanation: "Provides calcium and magnesium while raising pH to optimal range"
      });
      tags.push("low_ph", "moderate_lime");
      return -0.15;
    } else if (soil_features.ph > 8.5) {
      reasons.push(`Highly alkaline soil (pH ${soil_features.ph}) causes micronutrient lockup, especially iron and zinc`);
      fertilizers.push({
        name: "Sulfur or Iron Sulfate",
        dose_kg_per_hectare: Math.round(200 + (soil_features.ph - 7.0) * 50),
        explanation: "Gradually lowers pH and provides sulfur for protein synthesis"
      });
      tags.push("high_alkalinity", "micronutrient_lockup");
      return -0.2;
    } else if (soil_features.ph > 7.5) {
      reasons.push(`Moderately alkaline soil (pH ${soil_features.ph}) may reduce availability of iron, manganese, and zinc`);
      tags.push("alkaline", "potential_micronutrient_issues");
      return -0.08;
    } else {
      reasons.push(`Optimal soil pH (${soil_features.ph}) promotes excellent nutrient availability and microbial activity`);
      return 0.15;
    }
  }

  analyzeNitrogen(soil_features, reasons, fertilizers, tags) {
    if (soil_features.nitrogen < 25) {
      reasons.push(`Severely deficient nitrogen (${soil_features.nitrogen} ppm) will cause stunted growth and yellowing`);
      fertilizers.push({
        name: "Urea (46-0-0)",
        dose_kg_per_hectare: 200,
        explanation: "High nitrogen content for rapid correction of severe deficiency"
      });
      fertilizers.push({
        name: "Ammonium Sulfate",
        dose_kg_per_hectare: 150,
        explanation: "Provides nitrogen and sulfur, acidifies soil slightly"
      });
      tags.push("severe_n_deficiency", "yellow_leaves_risk");
      return -0.25;
    } else if (soil_features.nitrogen < 40) {
      reasons.push(`Low nitrogen (${soil_features.nitrogen} ppm) limits vegetative growth and protein synthesis`);
      fertilizers.push({
        name: "NPK 20-10-10",
        dose_kg_per_hectare: 150,
        explanation: "Balanced fertilizer with emphasis on nitrogen for growth promotion"
      });
      tags.push("low_nitrogen", "growth_limitation");
      return -0.15;
    } else if (soil_features.nitrogen > 100) {
      reasons.push(`Excessive nitrogen (${soil_features.nitrogen} ppm) may delay maturity and increase disease susceptibility`);
      tags.push("excess_nitrogen", "delayed_maturity_risk");
      return -0.1;
    } else if (soil_features.nitrogen > 80) {
      reasons.push(`Excellent nitrogen levels (${soil_features.nitrogen} ppm) support vigorous vegetative growth`);
      return 0.15;
    } else {
      reasons.push(`Adequate nitrogen (${soil_features.nitrogen} ppm) supports healthy plant development`);
      return 0.1;
    }
  }

  analyzePhosphorus(soil_features, reasons, fertilizers, tags) {
    if (soil_features.phosphorus < 15) {
      reasons.push(`Low phosphorus (${soil_features.phosphorus} ppm) severely impacts root development and flowering`);
      fertilizers.push({
        name: "Triple Super Phosphate (TSP)",
        dose_kg_per_hectare: 120,
        explanation: "High phosphorus content for rapid correction of deficiency"
      });
      fertilizers.push({
        name: "Rock Phosphate",
        dose_kg_per_hectare: 300,
        explanation: "Slow-release phosphorus for long-term soil improvement"
      });
      tags.push("severe_p_deficiency", "root_development_issues");
      return -0.2;
    } else if (soil_features.phosphorus < 25) {
      reasons.push(`Moderate phosphorus deficiency (${soil_features.phosphorus} ppm) affects energy transfer and flowering`);
      fertilizers.push({
        name: "Single Super Phosphate (SSP)",
        dose_kg_per_hectare: 100,
        explanation: "Provides phosphorus and calcium for root development"
      });
      tags.push("low_phosphorus", "flowering_impact");
      return -0.12;
    } else if (soil_features.phosphorus > 50) {
      reasons.push(`Excellent phosphorus levels (${soil_features.phosphorus} ppm) support strong root systems and flowering`);
      return 0.12;
    } else {
      reasons.push(`Adequate phosphorus (${soil_features.phosphorus} ppm) supports normal plant development`);
      return 0.08;
    }
  }

  analyzePotassium(soil_features, reasons, fertilizers, tags) {
    if (soil_features.potassium < 80) {
      reasons.push(`Low potassium (${soil_features.potassium} ppm) weakens disease resistance and affects fruit quality`);
      fertilizers.push({
        name: "Muriate of Potash (KCl)",
        dose_kg_per_hectare: 100,
        explanation: "High potassium content improves disease resistance and fruit quality"
      });
      fertilizers.push({
        name: "Sulfate of Potash",
        dose_kg_per_hectare: 80,
        explanation: "Chloride-free potassium ideal for sensitive crops"
      });
      tags.push("low_potassium", "disease_susceptibility");
      return -0.15;
    } else if (soil_features.potassium > 200) {
      reasons.push(`High potassium levels (${soil_features.potassium} ppm) provide excellent disease resistance and stress tolerance`);
      return 0.12;
    } else {
      reasons.push(`Adequate potassium (${soil_features.potassium} ppm) supports good plant health and stress tolerance`);
      return 0.08;
    }
  }

  analyzeOrganicMatter(soil_features, reasons, fertilizers, tags) {
    if (soil_features.organic_matter < 1.5) {
      reasons.push(`Very low organic matter (${soil_features.organic_matter}%) results in poor soil structure and low water retention`);
      fertilizers.push({
        name: "High-Quality Compost",
        dose_kg_per_hectare: 3000,
        explanation: "Improves soil structure, water retention, and provides slow-release nutrients"
      });
      fertilizers.push({
        name: "Biochar",
        dose_kg_per_hectare: 500,
        explanation: "Long-term soil improvement and carbon sequestration"
      });
      tags.push("very_low_om", "poor_structure", "water_retention_issues");
      return -0.2;
    } else if (soil_features.organic_matter < 2.5) {
      reasons.push(`Low organic matter (${soil_features.organic_matter}%) limits soil biology and nutrient cycling`);
      fertilizers.push({
        name: "Well-Rotted Manure",
        dose_kg_per_hectare: 2000,
        explanation: "Builds organic matter and provides balanced nutrition"
      });
      tags.push("low_organic_matter", "limited_biology");
      return -0.12;
    } else if (soil_features.organic_matter > 5.0) {
      reasons.push(`Excellent organic matter (${soil_features.organic_matter}%) provides superior soil structure and biology`);
      return 0.18;
    } else {
      reasons.push(`Good organic matter (${soil_features.organic_matter}%) supports healthy soil biology and structure`);
      return 0.12;
    }
  }

  analyzeMoisture(soil_features, reasons, tags) {
    if (soil_features.moisture < 10) {
      reasons.push(`Very low soil moisture (${soil_features.moisture}%) indicates severe drought stress conditions`);
      tags.push("drought_stress", "irrigation_needed");
      return -0.15;
    } else if (soil_features.moisture < 15) {
      reasons.push(`Low soil moisture (${soil_features.moisture}%) may limit nutrient uptake and plant growth`);
      tags.push("low_moisture", "water_stress");
      return -0.08;
    } else if (soil_features.moisture > 35) {
      reasons.push(`High soil moisture (${soil_features.moisture}%) may indicate waterlogging or poor drainage`);
      tags.push("waterlogging_risk", "drainage_issues");
      return -0.1;
    } else {
      reasons.push(`Optimal soil moisture (${soil_features.moisture}%) supports good nutrient transport and root function`);
      return 0.1;
    }
  }

  analyzeConductivity(soil_features, reasons, tags) {
    if (soil_features.ec > 4.0) {
      reasons.push(`Very high salinity (EC ${soil_features.ec} dS/m) severely restricts plant growth and water uptake`);
      tags.push("high_salinity", "salt_stress", "water_uptake_issues");
      return -0.25;
    } else if (soil_features.ec > 2.0) {
      reasons.push(`Moderate salinity (EC ${soil_features.ec} dS/m) may stress sensitive crops and reduce yields`);
      tags.push("moderate_salinity", "sensitive_crop_restriction");
      return -0.12;
    } else if (soil_features.ec < 0.3) {
      reasons.push(`Very low conductivity (EC ${soil_features.ec} dS/m) indicates low nutrient content`);
      tags.push("low_nutrients", "fertility_building_needed");
      return -0.08;
    } else {
      reasons.push(`Normal conductivity (EC ${soil_features.ec} dS/m) indicates balanced nutrient availability`);
      return 0.05;
    }
  }

  analyzeTemperature(soil_features, reasons, tags) {
    if (soil_features.temperature < 5) {
      reasons.push(`Very low soil temperature (${soil_features.temperature}°C) severely limits root activity and nutrient uptake`);
      tags.push("cold_stress", "limited_root_activity");
      return -0.15;
    } else if (soil_features.temperature < 10) {
      reasons.push(`Low soil temperature (${soil_features.temperature}°C) slows biological activity and nutrient cycling`);
      tags.push("cool_soil", "slow_biology");
      return -0.08;
    } else if (soil_features.temperature > 35) {
      reasons.push(`High soil temperature (${soil_features.temperature}°C) may stress plants and reduce root function`);
      tags.push("heat_stress", "root_stress");
      return -0.1;
    } else {
      reasons.push(`Optimal soil temperature (${soil_features.temperature}°C) supports active root growth and microbial activity`);
      return 0.08;
    }
  }

  estimateClimateZone(temperature, location) {
    if (temperature > 30) return 'tropical';
    if (temperature > 20) return 'subtropical';
    if (temperature > 10) return 'temperate';
    return 'cool';
  }

  getSeasonalFactor(location) {
    // Simple seasonal adjustment - in real ML this would use current date and location
    return Math.random() * 0.1 + 0.95; // 0.95-1.05 range
  }
}

module.exports = SoilAnalyzer;