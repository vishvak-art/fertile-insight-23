const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

// Ensure reports directory exists
const REPORTS_DIR = process.env.REPORTS_DIR || './reports';

async function ensureReportsDir() {
  try {
    await fs.access(REPORTS_DIR);
  } catch (error) {
    await fs.mkdir(REPORTS_DIR, { recursive: true });
  }
}

// Generate report (PDF/CSV)
router.post('/report', async (req, res) => {
  try {
    const { prediction, soil_features, location, metadata } = req.body;
    
    if (!prediction || !soil_features) {
      return res.status(400).json({ error: 'Prediction and soil features are required' });
    }

    await ensureReportsDir();

    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const reportData = {
      reportId,
      prediction,
      soil_features,
      location: location || null,
      metadata: metadata || {},
      timestamp: new Date().toISOString()
    };

    // Call Python report generator
    const reportPaths = await generateReportWithPython(reportData);
    
    res.json({
      success: true,
      report_id: reportId,
      download_urls: {
        pdf: `/api/reports/${reportId}/download/pdf`,
        csv: `/api/reports/${reportId}/download/csv`
      },
      message: 'Report generated successfully'
    });
    
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ 
      error: 'Report generation failed',
      message: error.message 
    });
  }
});

// List reports
router.get('/reports', async (req, res) => {
  try {
    await ensureReportsDir();
    const files = await fs.readdir(REPORTS_DIR);
    
    const reports = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const reportId = file.replace('.json', '');
        return {
          id: reportId,
          created_at: new Date(parseInt(reportId.split('_')[1])).toISOString(),
          pdf_available: files.includes(`${reportId}.pdf`),
          csv_available: files.includes(`${reportId}.csv`)
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json({
      success: true,
      reports,
      total: reports.length
    });
    
  } catch (error) {
    console.error('Error listing reports:', error);
    res.status(500).json({ 
      error: 'Failed to list reports',
      message: error.message 
    });
  }
});

// Download specific report
router.get('/report/:id/download/:format?', async (req, res) => {
  try {
    const { id, format = 'pdf' } = req.params;
    
    if (!['pdf', 'csv'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Use pdf or csv.' });
    }
    
    const filePath = path.join(REPORTS_DIR, `${id}.${format}`);
    
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const contentType = format === 'pdf' ? 'application/pdf' : 'text/csv';
    const filename = `soil_report_${id}.${format}`;
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const fileStream = require('fs').createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ 
      error: 'Download failed',
      message: error.message 
    });
  }
});

async function generateReportWithPython(reportData) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../../generate_report.py');
    const pythonProcess = spawn('python3', [pythonScript], {
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
        console.error('Python report generator error:', stderr);
        reject(new Error(`Report generation failed with code ${code}: ${stderr}`));
        return;
      }

      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch (error) {
        console.error('Failed to parse Python output:', stdout);
        reject(new Error('Invalid JSON response from report generator'));
      }
    });

    // Send report data to Python script
    pythonProcess.stdin.write(JSON.stringify(reportData));
    pythonProcess.stdin.end();

    // Timeout after 60 seconds
    setTimeout(() => {
      pythonProcess.kill();
      reject(new Error('Report generation timeout'));
    }, 60000);
  });
}

module.exports = router;