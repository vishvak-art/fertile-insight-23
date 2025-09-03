import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '../services/api';
import { SoilSample } from '../types/api';
import { formatDate } from '../utils/formatters';
import { 
  Sprout, 
  TestTube, 
  History, 
  MessageCircle, 
  LogOut, 
  BarChart3,
  Leaf,
  Droplets,
  Thermometer,
  Plus
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recentSamples, setRecentSamples] = useState<SoilSample[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentSamples();
  }, []);

  const loadRecentSamples = async () => {
    try {
      const samples = await apiService.getSoilSamples();
      setRecentSamples(samples.slice(0, 3)); // Show only recent 3
    } catch (error) {
      console.error('Failed to load samples:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getFertilityColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-fertility-high';
      case 'Medium': return 'text-fertility-medium';
      case 'Low': return 'text-fertility-low';
      default: return 'text-muted-foreground';
    }
  };

  const getFertilityBgColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-success-light';
      case 'Medium': return 'bg-warning-light';
      case 'Low': return 'bg-destructive-light';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Sprout className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Soil Fertility App</h1>
                <p className="text-sm text-muted-foreground">Smart Agriculture Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">Welcome back, {user?.username}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card hover:shadow-card-lg transition-smooth cursor-pointer" onClick={() => navigate('/predict')}>
            <CardContent className="p-6 text-center">
              <div className="bg-primary-lighter text-primary p-3 rounded-full w-fit mx-auto mb-4">
                <TestTube className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">New Analysis</h3>
              <p className="text-sm text-muted-foreground">Test your soil fertility</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-lg transition-smooth cursor-pointer" onClick={() => navigate('/history')}>
            <CardContent className="p-6 text-center">
              <div className="bg-accent text-accent-foreground p-3 rounded-full w-fit mx-auto mb-4">
                <History className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">History</h3>
              <p className="text-sm text-muted-foreground">View past results</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-lg transition-smooth cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="bg-success-light text-success p-3 rounded-full w-fit mx-auto mb-4">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Reports</h3>
              <p className="text-sm text-muted-foreground">Analytics & trends</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-lg transition-smooth cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="bg-warning-light text-warning p-3 rounded-full w-fit mx-auto mb-4">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">AI Assistant</h3>
              <p className="text-sm text-muted-foreground">Get expert advice</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Start */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sprout className="h-5 w-5 text-primary" />
                  <span>Quick Soil Analysis</span>
                </CardTitle>
                <CardDescription>
                  Start analyzing your soil fertility and get instant recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-primary-lighter to-accent rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    Ready to optimize your crop yield?
                  </h3>
                  <p className="text-primary/80 mb-4">
                    Our AI-powered system analyzes soil composition and provides personalized 
                    fertilizer and crop recommendations.
                  </p>
                  <Button 
                    variant="predict" 
                    size="lg"
                    onClick={() => navigate('/predict')}
                    className="shadow-lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Start New Analysis
                  </Button>
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <div className="bg-primary text-primary-foreground p-2 rounded">
                      <TestTube className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Soil Testing</p>
                      <p className="text-xs text-muted-foreground">8 key parameters</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <div className="bg-success text-success-foreground p-2 rounded">
                      <Leaf className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Crop Advice</p>
                      <p className="text-xs text-muted-foreground">Best crop selection</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Results */}
          <div>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <History className="h-5 w-5 text-primary" />
                    <span>Recent Analysis</span>
                  </span>
                  {recentSamples.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/history')}
                    >
                      View All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  </div>
                ) : recentSamples.length === 0 ? (
                  <div className="text-center py-8">
                    <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No soil tests yet</p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/predict')}
                      className="transition-smooth"
                    >
                      Start Your First Test
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentSamples.map((sample) => (
                      <div 
                        key={sample.id} 
                        className="p-4 border border-border rounded-lg hover:shadow-sm transition-smooth cursor-pointer"
                        onClick={() => navigate(`/history`)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${getFertilityBgColor(sample.prediction?.fertility_level || '')}`}></div>
                            <p className="font-medium text-foreground">
                              Fertility: {sample.prediction?.fertility_level || 'Unknown'}
                            </p>
                          </div>
                           <p className="text-xs text-muted-foreground">
                             {formatDate(sample.created_at)}
                           </p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="flex items-center space-x-1">
                            <Droplets className="h-3 w-3 text-primary" />
                            <span>pH {sample.soil_features.ph}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Leaf className="h-3 w-3 text-success" />
                            <span>N {sample.soil_features.nitrogen}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Thermometer className="h-3 w-3 text-warning" />
                            <span>{sample.soil_features.temperature}°C</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;