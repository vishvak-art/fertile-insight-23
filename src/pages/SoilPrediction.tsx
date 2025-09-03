import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '../services/api';
import { SoilFeatures as OriginalSoilFeatures, PredictionResponse } from '../types/api';

// Extended soil features with micronutrients
interface ExtendedSoilFeatures extends OriginalSoilFeatures {
  sulfur: number;
  zinc: number;
  iron: number;
  copper: number;
  manganese: number;
  boron: number;
}
import { ArrowLeft, TestTube, MapPin, Sprout, Locate, Thermometer, Loader2 } from 'lucide-react';
import PredictionResults from '@/components/PredictionResults';
import { useLocationWeather } from '@/hooks/useLocationWeather';

const SoilPrediction: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [soilFeatures, setSoilFeatures] = useState<ExtendedSoilFeatures>({
    ph: 6.5,
    nitrogen: 50,
    phosphorus: 20,
    potassium: 120,
    organic_matter: 3.0,
    moisture: 25,
    ec: 0.8,
    temperature: 25,
    sulfur: 12,
    zinc: 0.7,
    iron: 4.2,
    copper: 0.3,
    manganese: 3.1,
    boron: 0.5
  });
  
  const [location, setLocation] = useState({ lat: '', lon: '' });
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [locationDetecting, setLocationDetecting] = useState(false);
  const [temperatureDetecting, setTemperatureDetecting] = useState(false);
  
  const { getLocationOnly, getWeatherForCoords } = useLocationWeather();

  const handleInputChange = (field: keyof ExtendedSoilFeatures, value: string) => {
    const numValue = parseFloat(value) || 0;
    setSoilFeatures(prev => ({ ...prev, [field]: numValue }));
  };

  const handleAutoDetectLocation = async () => {
    setLocationDetecting(true);
    try {
      const locationData = await getLocationOnly();
      setLocation({
        lat: locationData.location.lat.toString(),
        lon: locationData.location.lon.toString()
      });
      
      toast({
        title: "Location detected",
        description: `Set to ${locationData.address?.city || 'Unknown city'}, ${locationData.address?.country || 'Unknown country'}`,
      });
    } catch (error) {
      toast({
        title: "Location detection failed",
        description: error instanceof Error ? error.message : "Could not detect location",
        variant: "destructive",
      });
    } finally {
      setLocationDetecting(false);
    }
  };

  const handleAutoDetectTemperature = async () => {
    if (!location.lat || !location.lon) {
      toast({
        title: "Location required",
        description: "Please set location first to detect temperature",
        variant: "destructive",
      });
      return;
    }

    setTemperatureDetecting(true);
    try {
      const weatherData = await getWeatherForCoords(
        parseFloat(location.lat),
        parseFloat(location.lon)
      );
      
      setSoilFeatures(prev => ({ 
        ...prev, 
        temperature: weatherData.temperature 
      }));
      
      toast({
        title: "Temperature updated",
        description: `Set to ${weatherData.temperature}°C (${weatherData.description})`,
      });
    } catch (error) {
      toast({
        title: "Weather detection failed",
        description: error instanceof Error ? error.message : "Could not get weather data",
        variant: "destructive",
      });
    } finally {
      setTemperatureDetecting(false);
    }
  };

  const handleAutoDetectLocationAndWeather = async () => {
    setLocationDetecting(true);
    setTemperatureDetecting(true);
    
    try {
      const locationData = await getLocationOnly();
      setLocation({
        lat: locationData.location.lat.toString(),
        lon: locationData.location.lon.toString()
      });

      const weatherData = await getWeatherForCoords(
        locationData.location.lat,
        locationData.location.lon
      );
      
      setSoilFeatures(prev => ({ 
        ...prev, 
        temperature: weatherData.temperature 
      }));
      
      toast({
        title: "Auto-filled successfully",
        description: `Location: ${locationData.address?.city || 'Unknown'}, Temperature: ${weatherData.temperature}°C`,
      });
    } catch (error) {
      toast({
        title: "Auto-fill failed",
        description: error instanceof Error ? error.message : "Could not auto-fill location and weather",
        variant: "destructive",
      });
    } finally {
      setLocationDetecting(false);
      setTemperatureDetecting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const request = {
        soil_features: soilFeatures,
        ...(location.lat && location.lon ? {
          location: { lat: parseFloat(location.lat), lon: parseFloat(location.lon) }
        } : {})
      };

      const result = await apiService.predict(request);
      setPrediction(result);

      // Save the sample
      await apiService.saveSoilSample(request, result);

      toast({
        title: "Analysis Complete!",
        description: "Your soil fertility analysis has been completed successfully.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze soil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (prediction) {
    return (
      <PredictionResults 
        prediction={prediction} 
        soilFeatures={soilFeatures}
        onNewTest={() => {
          setPrediction(null);
          // Reset form with default values
          setSoilFeatures({
            ph: 6.5,
            nitrogen: 50,
            phosphorus: 20,
            potassium: 120,
            organic_matter: 3.0,
            moisture: 25,
            ec: 0.8,
            temperature: 25,
            sulfur: 12,
            zinc: 0.7,
            iron: 4.2,
            copper: 0.3,
            manganese: 3.1,
            boron: 0.5
          });
        }}
        onBackToDashboard={() => navigate('/dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <TestTube className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Soil Fertility Analysis</h1>
                <p className="text-sm text-muted-foreground">Enter your soil parameters for analysis</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Primary Soil Parameters */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sprout className="h-5 w-5 text-primary" />
                  <span>Primary Parameters</span>
                </CardTitle>
                <CardDescription>
                  Essential soil chemistry measurements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ph">pH Level</Label>
                    <Input
                      id="ph"
                      type="number"
                      step="0.1"
                      min="0"
                      max="14"
                      value={soilFeatures.ph}
                      onChange={(e) => handleInputChange('ph', e.target.value)}
                      className="transition-smooth focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground">Scale: 0-14 (6.0-7.0 optimal)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ec">Electrical Conductivity</Label>
                    <Input
                      id="ec"
                      type="number"
                      step="0.1"
                      min="0"
                      value={soilFeatures.ec}
                      onChange={(e) => handleInputChange('ec', e.target.value)}
                      className="transition-smooth focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground">dS/m (0.2-0.8 normal)</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nitrogen">Nitrogen (N)</Label>
                    <Input
                      id="nitrogen"
                      type="number"
                      min="0"
                      value={soilFeatures.nitrogen}
                      onChange={(e) => handleInputChange('nitrogen', e.target.value)}
                      className="transition-smooth focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground">ppm</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phosphorus">Phosphorus (P)</Label>
                    <Input
                      id="phosphorus"
                      type="number"
                      min="0"
                      value={soilFeatures.phosphorus}
                      onChange={(e) => handleInputChange('phosphorus', e.target.value)}
                      className="transition-smooth focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground">ppm</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="potassium">Potassium (K)</Label>
                    <Input
                      id="potassium"
                      type="number"
                      min="0"
                      value={soilFeatures.potassium}
                      onChange={(e) => handleInputChange('potassium', e.target.value)}
                      className="transition-smooth focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground">ppm</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Environmental Parameters */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="h-5 w-5 text-primary" />
                  <span>Environmental Factors</span>
                </CardTitle>
                <CardDescription>
                  Physical and environmental conditions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organic_matter">Organic Matter</Label>
                    <Input
                      id="organic_matter"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={soilFeatures.organic_matter}
                      onChange={(e) => handleInputChange('organic_matter', e.target.value)}
                      className="transition-smooth focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground">% (2-4% good)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="moisture">Moisture Content</Label>
                    <Input
                      id="moisture"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={soilFeatures.moisture}
                      onChange={(e) => handleInputChange('moisture', e.target.value)}
                      className="transition-smooth focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground">% by weight</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="temperature">Soil Temperature</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAutoDetectTemperature}
                      disabled={temperatureDetecting || !location.lat || !location.lon}
                      className="h-7 px-2"
                    >
                      {temperatureDetecting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Thermometer className="h-3 w-3 mr-1" />
                      )}
                      Auto
                    </Button>
                  </div>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={soilFeatures.temperature}
                    onChange={(e) => handleInputChange('temperature', e.target.value)}
                    className="transition-smooth focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground">°C (15-25°C optimal for most crops)</p>
                </div>

                {/* Location Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>Location (Optional)</span>
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAutoDetectLocation}
                        disabled={locationDetecting}
                        className="h-7 px-2"
                      >
                        {locationDetecting ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Locate className="h-3 w-3 mr-1" />
                        )}
                        Location
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={handleAutoDetectLocationAndWeather}
                        disabled={locationDetecting || temperatureDetecting}
                        className="h-7 px-2"
                      >
                        {(locationDetecting || temperatureDetecting) ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <MapPin className="h-3 w-3 mr-1" />
                        )}
                        Auto-fill All
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lat">Latitude</Label>
                      <Input
                        id="lat"
                        type="number"
                        step="0.0001"
                        placeholder="e.g., 12.9716"
                        value={location.lat}
                        onChange={(e) => setLocation(prev => ({ ...prev, lat: e.target.value }))}
                        className="transition-smooth focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lon">Longitude</Label>
                      <Input
                        id="lon"
                        type="number"
                        step="0.0001"
                        placeholder="e.g., 77.5946"
                        value={location.lon}
                        onChange={(e) => setLocation(prev => ({ ...prev, lon: e.target.value }))}
                        className="transition-smooth focus:border-primary"
                      />
                    </div>
                  </div>
                  {location.lat && location.lon && (
                    <p className="text-xs text-muted-foreground mt-2">
                      📍 Coordinates set: {parseFloat(location.lat).toFixed(4)}, {parseFloat(location.lon).toFixed(4)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-center">
            <Button 
              type="submit" 
              variant="predict" 
              size="xl"
              disabled={loading}
              className="min-w-[200px]"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-3"></div>
                  Analyzing Soil...
                </>
              ) : (
                <>
                  <TestTube className="h-5 w-5 mr-3" />
                  Analyze Soil Fertility
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Analysis takes 2-3 seconds using our AI model
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SoilPrediction;