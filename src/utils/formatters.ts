// Formatting utilities

export const formatFertilityScore = (score: number): string => {
  return (score * 100).toFixed(1) + '%';
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDosage = (dose: number): string => {
  if (dose >= 1000) {
    return `${(dose / 1000).toFixed(1)} tons/ha`;
  }
  return `${dose} kg/ha`;
};

export const formatYield = (yield_t_ha: number): string => {
  return `${yield_t_ha.toFixed(1)} t/ha`;
};

export const formatNutrientValue = (value: number, unit: string): string => {
  return `${value.toFixed(1)} ${unit}`;
};