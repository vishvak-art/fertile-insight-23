// ML Integration service for calling Python predictor
const { spawn } = require('child_process');
const path = require('path');

class MLIntegration {
  constructor() {
    this.pythonScript = path.join(__dirname, '../../predictor.py');
  }

  async callPythonPredictor(soilFeatures) {
    return new Promise((resolve, reject) => {
      // Convert soil features to ML model format
      const mlInput = {
        N: soilFeatures.nitrogen,
        P: soilFeatures.phosphorus,
        K: soilFeatures.potassium,
        pH: soilFeatures.ph,
        EC: soilFeatures.ec,
        OC: soilFeatures.organic_matter,
        S: soilFeatures.sulfur || 10,
        Zn: soilFeatures.zinc || 0.6,
        Fe: soilFeatures.iron || 3.5,
        Cu: soilFeatures.copper || 0.25,
        Mn: soilFeatures.manganese || 2.8,
        B: soilFeatures.boron || 0.4
      };

      const pythonProcess = spawn('python3', [this.pythonScript], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('Python script error:', stderr);
          reject(new Error(`Python script failed with code ${code}: ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout.trim());
          resolve(result);
        } catch (error) {
          console.error('Failed to parse Python output:', stdout);
          reject(new Error('Invalid JSON response from Python script'));
        }
      });

      // Send input to Python script
      pythonProcess.stdin.write(JSON.stringify(mlInput));
      pythonProcess.stdin.end();

      // Timeout after 30 seconds
      setTimeout(() => {
        pythonProcess.kill();
        reject(new Error('Python script timeout'));
      }, 30000);
    });
  }
}

module.exports = MLIntegration;