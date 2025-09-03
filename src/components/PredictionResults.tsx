import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PredictionResponse, SoilFeatures } from '../types/api';
import { formatFertilityScore, formatDosage, formatYield } from '../utils/formatters';
import { useToast } from '@/hooks/use-toast';
import ChatWidget from './ChatWidget';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Sprout, 
  Droplets, 
  RotateCcw,
  Home,
  Download,
  Share2,
  TrendingUp,
  Package,
  Beaker,
  Loader2
} from 'lucide-react';

interface PredictionResultsProps {
  prediction: PredictionResponse;
  soilFeatures: SoilFeatures;
  onNewTest: () => void;
  onBackToDashboard: () => void;
}

const PredictionResults: React.FC<PredictionResultsProps> = ({
  prediction,
  soilFeatures,
  onNewTest,
  onBackToDashboard
}) => {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/reports/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prediction,
          soil_features: soilFeatures,
          metadata: {
            generated_at: new Date().toISOString(),
            version: '1.0'
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Report Generated!",
          description: "Your soil analysis report is ready for download.",
        });

        // Download PDF automatically
        const pdfUrl = `http://localhost:3001${data.download_urls.pdf}`;
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `soil_report_${data.report_id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error(data.message || 'Failed to generate report');
      }
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate report",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };
  
  const getFertilityIcon = () => {
    switch (prediction.fertility_level) {
      case 'High': return <CheckCircle className="h-6 w-6 text-fertility-high" />;
      case 'Medium': return <AlertTriangle className="h-6 w-6 text-fertility-medium" />;
      case 'Low': return <XCircle className="h-6 w-6 text-fertility-low" />;
      default: return <Droplets className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getFertilityColor = () => {
    switch (prediction.fertility_level) {
      case 'High': return 'border-fertility-high bg-success-light';
      case 'Medium': return 'border-fertility-medium bg-warning-light';
      case 'Low': return 'border-fertility-low bg-destructive-light';
      default: return 'border-border bg-muted';
    }
  };

  const getScorePercentage = () => Math.round(prediction.fertility_score * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Soil Analysis Results</h1>
                <p className="text-sm text-muted-foreground">Complete fertility assessment and recommendations</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
              >
                {isGeneratingReport ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Fertility Score Overview */}
        <Card className={`shadow-card-lg mb-8 border-2 ${getFertilityColor()}`}>
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getFertilityIcon()}
                <div>
                  <h2 className="text-3xl font-bold text-foreground">
                    {prediction.fertility_level} Fertility
                  </h2>
                  {/* Show ML prediction if available */}
                  {prediction.prediction_ml && (
                    <p className="text-sm text-muted-foreground">
                      ML Model: {prediction.prediction_ml} 
                      {prediction.ml_confidence && ` (${Math.round(prediction.ml_confidence * 100)}% confidence)`}
                    </p>
                  )}
                   <p className="text-xl text-muted-foreground">
                     Score: {formatFertilityScore(prediction.fertility_score)} fertility rating
                   </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-6xl font-bold ${
                  prediction.fertility_level === 'High' ? 'text-fertility-high' :
                  prediction.fertility_level === 'Medium' ? 'text-fertility-medium' :
                  'text-fertility-low'
                }`}>
                   {Math.round(prediction.fertility_score * 100)}
                </div>
                <p className="text-sm text-muted-foreground">out of 100</p>
              </div>
            </div>
            
            {/* Score Bar */}
            <div className="mt-6">
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    prediction.fertility_level === 'High' ? 'bg-fertility-high' :
                    prediction.fertility_level === 'Medium' ? 'bg-fertility-medium' :
                    'bg-fertility-low'
                  }`}
                  style={{ width: `${Math.round(prediction.fertility_score * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Poor (0-30)</span>
                <span>Fair (30-50)</span>
                <span>Good (50-70)</span>
                <span>Excellent (70-100)</span>
              </div>
            </div>

            {/* Environmental Factors */}
            {prediction.environmental_factors && Object.keys(prediction.environmental_factors).length > 0 && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Environmental Context</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {prediction.environmental_factors.current_weather && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weather:</span>
                      <span className="font-medium">{prediction.environmental_factors.current_weather}</span>
                    </div>
                  )}
                  {prediction.environmental_factors.humidity && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Humidity:</span>
                      <span className="font-medium">{prediction.environmental_factors.humidity}%</span>
                    </div>
                  )}
                  {prediction.environmental_factors.location_address && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Location: </span>
                      <span className="font-medium text-xs">{prediction.environmental_factors.location_address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Analysis Summary */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Beaker className="h-5 w-5 text-primary" />
                <span>Analysis Summary</span>
              </CardTitle>
              <CardDescription>Key findings from your soil test</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prediction.reasons.map((reason, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                    <div className="mt-0.5">
                      {reason.toLowerCase().includes('low') || reason.toLowerCase().includes('deficien') ? 
                        <AlertTriangle className="h-4 w-4 text-warning" /> :
                        <CheckCircle className="h-4 w-4 text-success" />
                      }
                    </div>
                    <p className="text-sm text-foreground flex-1">{reason}</p>
                  </div>
                ))}
              </div>

              {/* Soil Parameters Summary */}
              <div className="mt-6 p-4 bg-primary-lighter rounded-lg">
                <h4 className="font-semibold text-primary mb-3">Your Soil Parameters</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-primary/80">pH Level:</span>
                    <span className="font-medium text-primary">{soilFeatures.ph}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary/80">Nitrogen:</span>
                    <span className="font-medium text-primary">{soilFeatures.nitrogen} ppm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary/80">Phosphorus:</span>
                    <span className="font-medium text-primary">{soilFeatures.phosphorus} ppm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary/80">Potassium:</span>
                    <span className="font-medium text-primary">{soilFeatures.potassium} ppm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary/80">Organic Matter:</span>
                    <span className="font-medium text-primary">{soilFeatures.organic_matter}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary/80">Temperature:</span>
                    <span className="font-medium text-primary">{soilFeatures.temperature}°C</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fertilizer Recommendations */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-primary" />
                <span>Fertilizer Recommendations</span>
              </CardTitle>
              <CardDescription>Improve your soil with these targeted treatments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prediction.fertilizer_recommendations.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
                    <p className="text-foreground font-medium">No fertilizers needed!</p>
                    <p className="text-sm text-muted-foreground">Your soil fertility is well-balanced.</p>
                  </div>
                ) : (
                  prediction.fertilizer_recommendations.map((fertilizer, index) => (
                    <div key={index} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-foreground">{fertilizer.name}</h4>
                         <Badge variant="secondary" className="text-xs">
                           {formatDosage(fertilizer.dose_kg_per_hectare)}
                         </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{fertilizer.explanation}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Crop Recommendations */}
        <Card className="shadow-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sprout className="h-5 w-5 text-primary" />
              <span>Recommended Crops</span>
            </CardTitle>
            <CardDescription>Best crops for your current soil conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {prediction.crop_recommendations.map((crop, index) => (
                <div key={index} className="border border-border rounded-lg p-4 hover:shadow-sm transition-smooth">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{crop.crop}</h4>
                     {crop.expected_yield_t_ha > 0 && (
                       <Badge variant="outline" className="text-xs">
                         {formatYield(crop.expected_yield_t_ha)}
                       </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{crop.reason}</p>
                   {crop.expected_yield_t_ha > 0 && (
                     <p className="text-xs text-success mt-2 font-medium">
                       Expected yield: {formatYield(crop.expected_yield_t_ha)}
                     </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="predict" 
            size="lg"
            onClick={onNewTest}
            className="min-w-[200px]"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Test Another Sample
          </Button>
          <Button 
            variant="secondary" 
            size="lg"
            onClick={onBackToDashboard}
            className="min-w-[200px]"
          >
            <Home className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Chat Widget */}
        <ChatWidget 
          context={{
            prediction,
            soilFeatures,
            fertilityLevel: prediction.fertility_level,
            fertilityScore: prediction.fertility_score
          }}
        />
      </div>
    </div>
  );
};

export default PredictionResults;