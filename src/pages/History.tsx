import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiService } from '../services/api';
import { SoilSample } from '../types/api';
import { formatDate } from '../utils/formatters';
import { ArrowLeft, History as HistoryIcon, Calendar, MapPin, Leaf, Droplets, Thermometer, TestTube } from 'lucide-react';

const History: React.FC = () => {
  const navigate = useNavigate();
  const [samples, setSamples] = useState<SoilSample[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSamples();
  }, []);

  const loadSamples = async () => {
    try {
      const data = await apiService.getSoilSamples();
      setSamples(data);
    } catch (error) {
      console.error('Failed to load samples:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFertilityColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-success-light text-success border-success/20';
      case 'Medium': return 'bg-warning-light text-warning border-warning/20';
      case 'Low': return 'bg-destructive-light text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getScorePercentage = (score: number) => Math.round(score * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <HistoryIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Analysis History</h1>
                <p className="text-sm text-muted-foreground">View all your soil fertility tests</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your test history...</p>
          </div>
        ) : samples.length === 0 ? (
          <div className="text-center py-16">
            <TestTube className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">No Tests Yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              You haven't performed any soil fertility tests yet. Start your first analysis to see results here.
            </p>
            <Button 
              variant="predict" 
              size="lg"
              onClick={() => navigate('/predict')}
            >
              <TestTube className="h-5 w-5 mr-2" />
              Start Your First Test
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Your Soil Tests</h2>
                <p className="text-muted-foreground">
                  {samples.length} test{samples.length !== 1 ? 's' : ''} completed
                </p>
              </div>
              <Button 
                variant="hero" 
                onClick={() => navigate('/predict')}
              >
                <TestTube className="h-4 w-4 mr-2" />
                New Test
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {samples.map((sample) => (
                <Card key={sample.id} className="shadow-card hover:shadow-card-lg transition-smooth">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary-lighter text-primary p-2 rounded-lg">
                          <TestTube className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            Soil Test #{sample.id}
                          </CardTitle>
                          <CardDescription className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                               <span>{formatDate(sample.created_at)}</span>
                            </span>
                            {sample.location && (
                              <span className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{sample.location.lat.toFixed(4)}, {sample.location.lon.toFixed(4)}</span>
                              </span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      
                      {sample.prediction && (
                        <div className="text-right">
                          <Badge className={`${getFertilityColor(sample.prediction.fertility_level)} border`}>
                            {sample.prediction.fertility_level} Fertility
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {Math.round(sample.prediction.fertility_score * 100)}% score
                          </p>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Soil Parameters */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Soil Parameters</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">pH:</span>
                            <span className="font-medium">{sample.soil_features.ph}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">EC:</span>
                            <span className="font-medium">{sample.soil_features.ec} dS/m</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">N:</span>
                            <span className="font-medium">{sample.soil_features.nitrogen} ppm</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">P:</span>
                            <span className="font-medium">{sample.soil_features.phosphorus} ppm</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">K:</span>
                            <span className="font-medium">{sample.soil_features.potassium} ppm</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">OM:</span>
                            <span className="font-medium">{sample.soil_features.organic_matter}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Environmental */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Environment</h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Droplets className="h-4 w-4 text-primary" />
                            <span className="text-sm">
                              <span className="text-muted-foreground">Moisture:</span>
                              <span className="font-medium ml-2">{sample.soil_features.moisture}%</span>
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Thermometer className="h-4 w-4 text-warning" />
                            <span className="text-sm">
                              <span className="text-muted-foreground">Temperature:</span>
                              <span className="font-medium ml-2">{sample.soil_features.temperature}°C</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Recommendations Preview */}
                      {sample.prediction && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-3">Key Recommendations</h4>
                          <div className="space-y-2">
                            {sample.prediction.fertilizer_recommendations.slice(0, 2).map((fert, index) => (
                              <div key={index} className="text-sm p-2 bg-muted rounded">
                                <span className="font-medium">{fert.name}</span>
                                <span className="text-muted-foreground ml-2">
                                  {fert.dose_kg_per_hectare} kg/ha
                                </span>
                              </div>
                            ))}
                            {sample.prediction.crop_recommendations.slice(0, 1).map((crop, index) => (
                              <div key={index} className="text-sm p-2 bg-primary-lighter rounded flex items-center space-x-2">
                                <Leaf className="h-3 w-3 text-primary" />
                                <span className="font-medium text-primary">{crop.crop}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Detailed Analysis Summary */}
                    {sample.prediction && sample.prediction.reasons.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-border">
                        <h4 className="font-semibold text-foreground mb-2">Analysis Summary</h4>
                        <div className="text-sm text-muted-foreground">
                          {sample.prediction.reasons.slice(0, 2).map((reason, index) => (
                            <p key={index} className="mb-1">• {reason}</p>
                          ))}
                          {sample.prediction.reasons.length > 2 && (
                            <p className="text-primary">+ {sample.prediction.reasons.length - 2} more insights</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;