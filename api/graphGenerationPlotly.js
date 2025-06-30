/**
 * Graph Generation API using Plotly.js
 * Pure JavaScript solution - no Python dependencies required
 * Uses Google Gemini API for AI-powered graph generation
 */

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');

// Alternative: Use puppeteer for image generation
const puppeteer = require('puppeteer');

// Initialize Gemini AI
let genAI;
try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (error) {
  console.warn('Gemini AI initialization warning:', error.message);
}

// Middleware to ensure requests are authenticated
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - Missing or invalid token' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

/**
 * Generate Plotly.js configuration from question text and graph description using Gemini
 */
const generatePlotlyConfig = async (questionText, graphDescription) => {
  if (!genAI) {
    throw new Error('Gemini API key not found in environment variables. Please set GEMINI_API_KEY.');
  }

  const prompt = `You are an expert in mathematical visualization using Plotly.js. Generate a complete Plotly.js configuration object to create a mathematical graph based on the following:

Question Text: "${questionText}"
Graph Description: "${graphDescription}"

Requirements:
1. Generate a valid Plotly.js data and layout configuration
2. Use appropriate mathematical plotting (scatter, line, function plots, etc.)
3. Include proper axis labels, titles, and styling
4. Set figure size to width: 800, height: 600
5. Use educational/academic styling with clear fonts
6. Include grid lines and proper axis ranges
7. Use colors suitable for educational materials
8. Make sure all mathematical elements are clearly visible

CRITICAL REQUIREMENTS: 
- Return ONLY a valid JSON object with "data" and "layout" properties
- No explanations, comments, markdown formatting, or code blocks
- The JSON must be parseable directly by JSON.parse()
- Use Plotly.js syntax (not Python plotly)
- Do not include any text before or after the JSON

Example structure:
{
  "data": [
    {
      "x": [1, 2, 3, 4],
      "y": [1, 4, 9, 16],
      "type": "scatter",
      "mode": "lines+markers",
      "name": "f(x) = x²"
    }
  ],
  "layout": {
    "title": "Graph Title",
    "xaxis": { "title": "X-axis", "range": [0, 5] },
    "yaxis": { "title": "Y-axis", "range": [0, 20] },
    "width": 800,
    "height": 600,
    "font": { "size": 14 },
    "showlegend": true
  }
}`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-preview-05-20'
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const configText = response.text().trim();
    
    // Clean up the response and parse JSON
    let cleanConfig = configText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^[^{]*/, '') // Remove any text before the first {
      .replace(/[^}]*$/, '') // Remove any text after the last }
      .trim();
    
    // Ensure we have valid JSON brackets
    if (!cleanConfig.startsWith('{')) {
      const firstBrace = cleanConfig.indexOf('{');
      if (firstBrace !== -1) {
        cleanConfig = cleanConfig.substring(firstBrace);
      } else {
        throw new Error('No valid JSON object found in Gemini response');
      }
    }
    
    if (!cleanConfig.endsWith('}')) {
      const lastBrace = cleanConfig.lastIndexOf('}');
      if (lastBrace !== -1) {
        cleanConfig = cleanConfig.substring(0, lastBrace + 1);
      } else {
        throw new Error('No valid JSON object found in Gemini response');
      }
    }
    
    // Handle common JSON formatting issues
    cleanConfig = cleanConfig
      .replace(/,\s*}/g, '}') // Remove trailing commas before closing braces
      .replace(/,\s*]/g, ']') // Remove trailing commas before closing brackets
      .replace(/SOME OTHER NUMBERS HERE FOR MANY ROWS/g, '') // Remove placeholder text
      .replace(/[\r\n\t]/g, ' ') // Replace line breaks and tabs with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Handle mathematical expressions that Gemini sometimes generates
    // Replace simple mathematical expressions with computed values
    cleanConfig = cleanConfig.replace(/\(\s*(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)\s*\)/g, (match, a, b) => {
      return (parseFloat(a) + parseFloat(b)).toString();
    });
    cleanConfig = cleanConfig.replace(/\(\s*(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*\)/g, (match, a, b) => {
      return (parseFloat(a) - parseFloat(b)).toString();
    });
    cleanConfig = cleanConfig.replace(/\(\s*(\d+(?:\.\d+)?)\s*\*\s*(\d+(?:\.\d+)?)\s*\)/g, (match, a, b) => {
      return (parseFloat(a) * parseFloat(b)).toString();
    });
    cleanConfig = cleanConfig.replace(/\(\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*\)/g, (match, a, b) => {
      return (parseFloat(a) / parseFloat(b)).toString();
    });
    
    try {
      const parsedConfig = JSON.parse(cleanConfig);
      
      // Validate that we have the required structure
      if (!parsedConfig.data || !parsedConfig.layout) {
        throw new Error('Invalid Plotly config: missing required data or layout properties');
      }
      
      return parsedConfig;
    } catch (parseError) {
      console.error('Failed to parse Plotly config:', cleanConfig.substring(0, 500) + '...');
      console.error('Parse error:', parseError.message);
      throw new Error('Generated configuration is not valid JSON: ' + parseError.message);
    }
  } catch (error) {
    console.error('Error generating Plotly config with Gemini:', error);
    throw error;
  }
};

/**
 * Generate graph image using Puppeteer and Plotly.js
 */
const generateGraphImage = async (plotlyConfig, tempDir) => {
  // Try to find Chrome executable on Windows
  const findChrome = () => {
    const possiblePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.CHROME_PATH
    ];
    
    for (const chromePath of possiblePaths) {
      if (chromePath) {
        try {
          require('fs').accessSync(chromePath);
          return chromePath;
        } catch (e) {
          // Continue to next path
        }
      }
    }
    return null;
  };

  const chromePath = findChrome();
  const launchOptions = { 
    headless: "new", // Use new headless mode to avoid deprecation warnings
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  };
  
  // Use system Chrome if available
  if (chromePath) {
    launchOptions.executablePath = chromePath;
  }
  
  const browser = await puppeteer.launch(launchOptions);
  
  try {
    const page = await browser.newPage();
    
    // Set viewport for consistent image size
    await page.setViewport({ width: 900, height: 700 });
    
    // Create HTML with Plotly.js
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            #graph { width: 100%; height: 600px; }
        </style>
    </head>
    <body>
        <div id="graph"></div>
        <script>
            const config = ${JSON.stringify(plotlyConfig)};
            Plotly.newPlot('graph', config.data, config.layout, {
                displayModeBar: false,
                responsive: false
            }).then(() => {
                console.log('Plotly rendering complete!');
                window.plotlyReady = true;
            }).catch(err => {
                console.error('Plotly error:', err);
                window.plotlyError = err.message;
            });
        </script>
    </body>
    </html>`;
    
    await page.setContent(html);
    
    // Enable console logging from the page for debugging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    // Wait for the plot to render with a more reliable condition
    try {
      await page.waitForFunction(() => {
        return window.plotlyReady === true;
      }, { timeout: 20000 }); // Reduced timeout since this is more reliable
      
      console.log('Plotly graph rendered successfully');
    } catch (timeoutError) {
      console.error('Timeout waiting for Plotly to render. Checking for errors...');
      
      // Check for any Plotly errors
      const plotlyError = await page.evaluate(() => window.plotlyError);
      if (plotlyError) {
        console.error('Plotly error on page:', plotlyError);
        throw new Error(`Plotly rendering failed: ${plotlyError}`);
      }
      
      // Check the graph div status for debugging
      const divStatus = await page.evaluate(() => {
        const graphDiv = document.getElementById('graph');
        return {
          hasDiv: !!graphDiv,
          hasChildren: graphDiv ? graphDiv.children.length : 0,
          hasPlotlyDiv: graphDiv ? !!graphDiv.querySelector('.plotly-graph-div') : false
        };
      });
      console.error('Graph div status:', divStatus);
      
      throw new Error('Timeout waiting for Plotly to render. The graph may be too complex or there may be a network issue loading Plotly.js');
    }
    
    // Additional wait to ensure complete rendering
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Take screenshot of the graph
    const graphElement = await page.$('#graph');
    const imageBuffer = await graphElement.screenshot({ 
      type: 'png',
      encoding: 'binary'
    });
    
    // Save to temp file
    const imagePath = path.join(tempDir, 'graph.png');
    await fs.writeFile(imagePath, imageBuffer);
    
    return imagePath;
  } finally {
    await browser.close();
  }
};

/**
 * Upload graph to Firebase Storage using Admin SDK
 */
const uploadGraphToStorage = async (imagePath, fileName, req) => {
  try {
    const bucket = admin.storage().bucket();
    const destination = `graphs/${fileName}`;
    
    await bucket.upload(imagePath, {
      destination: destination,
      metadata: {
        contentType: 'image/png',
      },
    });

    const file = bucket.file(destination);
    await file.makePublic();
    
    return `https://storage.googleapis.com/${bucket.name}/${destination}`;
  } catch (error) {
    console.error('Error uploading to Firebase Storage:', error);
    
    // Alternative: Store image as base64 in Firestore
    console.log('Falling back to Firestore base64 storage...');
    
    try {
      // Read the image file and convert to base64
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const dataUri = `data:image/png;base64,${base64Image}`;
      
      // Store in Firestore
      const db = admin.firestore();
      const graphDoc = await db.collection('graphImages').add({
        fileName: fileName,
        imageData: base64Image,
        contentType: 'image/png',
        uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
        size: imageBuffer.length
      });
      
      // Return a URL that will serve the image from our API
      const baseUrl = req ? `${req.protocol}://${req.get('host')}` : 'http://localhost:3001';
      const imageUrl = `${baseUrl}/api/graph-image/${graphDoc.id}`;
      console.log(`Graph stored in Firestore and available at: ${imageUrl}`);
      
      return imageUrl;
    } catch (firestoreError) {
      console.error('Error storing in Firestore:', firestoreError);
      
      // Final fallback: Return local file URL
      console.log('Final fallback to local file serving...');
      
      // Create a static directory if it doesn't exist
      const staticDir = path.join(__dirname, 'static', 'graphs');
      await fs.mkdir(staticDir, { recursive: true });
      
      // Copy the image to the static directory
      const staticPath = path.join(staticDir, fileName);
      await fs.copyFile(imagePath, staticPath);
      
      // Return a local URL that can be served by Express
      const baseUrl = req ? `${req.protocol}://${req.get('host')}` : 'http://localhost:3001';
      const localUrl = `${baseUrl}/api/static/graphs/${fileName}`;
      console.log(`Graph available locally at: ${localUrl}`);
      
      return localUrl;
    }
  }
};

/**
 * POST /api/generate-graph-plotly
 * Generate a graph using Plotly.js (no Python required)
 */
router.post('/generate-graph-plotly', authenticateUser, async (req, res) => {
  let tempDir = null;
  
  try {
    const { questionId, questionText, graphDescription } = req.body;

    if (!questionId || !questionText || !graphDescription) {
      return res.status(400).json({ 
        error: 'Missing required fields: questionId, questionText, and graphDescription are required' 
      });
    }

    console.log(`Generating Plotly graph for question ${questionId}`);

    // Create temporary directory
    tempDir = path.join(__dirname, 'temp', `graph_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    await fs.mkdir(tempDir, { recursive: true });

    // Step 1: Generate Plotly configuration using Gemini
    console.log('Generating Plotly configuration...');
    const plotlyConfig = await generatePlotlyConfig(questionText, graphDescription);
    console.log('Generated Plotly config:', JSON.stringify(plotlyConfig, null, 2));

    // Step 2: Generate image using Puppeteer
    console.log('Generating graph image...');
    const graphImagePath = await generateGraphImage(plotlyConfig, tempDir);
    console.log('Graph generated successfully at:', graphImagePath);

    // Step 3: Upload to Firebase Storage
    console.log('Uploading graph to storage...');
    const fileName = `${questionId}_plotly_${Date.now()}.png`;
    const graphUrl = await uploadGraphToStorage(graphImagePath, fileName, req);
    console.log('Graph uploaded successfully:', graphUrl);

    // Step 4: Update question in database
    const db = admin.firestore();
    await db.collection('questions').doc(questionId).update({
      graphUrl: graphUrl,
      plotlyConfig: JSON.stringify(plotlyConfig), // Store config as JSON string for future editing
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      generatedGraph: true,
      graphGenerationType: 'plotly'
    });

    console.log('Question updated successfully');

    res.json({
      success: true,
      graphUrl: graphUrl,
      plotlyConfig: plotlyConfig,
      message: 'Graph generated and attached successfully using Plotly.js'
    });

  } catch (error) {
    console.error('Error generating Plotly graph:', error);
    res.status(500).json({ 
      error: 'Failed to generate graph: ' + error.message 
    });
  } finally {
    // Clean up temporary directory
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true });
      } catch (cleanupError) {
        console.error('Error cleaning up temp directory:', cleanupError);
      }
    }
  }
});

/**
 * GET /api/check-plotly-environment
 * Check if Puppeteer and required dependencies are available
 */
router.get('/check-plotly-environment', authenticateUser, async (req, res) => {
  try {
    // Use the same Chrome detection logic as the main function
    const findChrome = () => {
      const possiblePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        process.env.CHROME_PATH
      ];
      
      for (const chromePath of possiblePaths) {
        if (chromePath) {
          try {
            require('fs').accessSync(chromePath);
            return chromePath;
          } catch (e) {
            // Continue to next path
          }
        }
      }
      return null;
    };

    const chromePath = findChrome();
    const launchOptions = { 
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    };
    
    // Use system Chrome if available
    if (chromePath) {
      launchOptions.executablePath = chromePath;
    }
    
    try {
    // Test Puppeteer availability
    const browser = await puppeteer.launch(launchOptions);
    await browser.close();
    
    res.json({
      plotlyReady: true,
      message: 'Plotly.js environment ready - no Python dependencies required!',
      dependencies: ['puppeteer', 'plotly.js', 'node.js'],
      chromeFound: !!chromePath,
      chromePath: chromePath || 'Using Puppeteer bundled Chrome'
    });
  } catch (error) {
    res.json({
      plotlyReady: false,
      error: error.message,
      requirements: 'Puppeteer needs to be installed: npm install puppeteer',
      suggestion: 'Try installing Chrome browsers: npx puppeteer browsers install chrome'
    });
  }
  } catch (error) {
    res.json({
      plotlyReady: false,
      error: error.message,
      requirements: 'Puppeteer needs to be installed: npm install puppeteer',
      suggestion: 'Try installing Chrome browsers: npx puppeteer browsers install chrome'
    });
  }
});

/**
 * GET /api/graph-image/:imageId
 * Serve graph images stored in Firestore
 */
router.get('/graph-image/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    
    const db = admin.firestore();
    const graphDoc = await db.collection('graphImages').doc(imageId).get();
    
    if (!graphDoc.exists) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    const graphData = graphDoc.data();
    const imageBuffer = Buffer.from(graphData.imageData, 'base64');
    
    res.set({
      'Content-Type': graphData.contentType || 'image/png',
      'Content-Length': imageBuffer.length,
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      'ETag': imageId
    });
    
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error serving graph image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

module.exports = router; 