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
const { requireAuth } = require('./middleware/auth');

// Alternative: Use puppeteer for image generation
const puppeteer = require('puppeteer');

// Initialize Gemini AI
let genAI;
try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (error) {
  console.warn('Gemini AI initialization warning:', error.message);
}

const authenticateUser = requireAuth({
  missingTokenMessage: 'Unauthorized - Missing or invalid token',
  invalidTokenMessage: 'Unauthorized - Invalid token',
  logLabel: 'Authentication error',
});

/**
 * Generate Plotly.js configuration from question text and graph description using OpenAI
 */
const generatePlotlyConfig = async (questionText, graphDescription) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not found in environment variables.');
  }

  const prompt = `You are an expert in data visualization using Plotly.js. Generate a complete Plotly.js configuration to accurately represent the following data visualization for an SAT exam question.

Question Text: "${questionText}"
Graph/Visual Description: "${graphDescription}"

CRITICAL INSTRUCTIONS:
1. MATCH THE DESCRIPTION EXACTLY. If the description says "table", generate a Plotly TABLE (type: "table"). If it says "scatter plot", generate a scatter plot. If it says "bar chart", generate a bar chart. Etc.
2. Include ALL data values from the description — do not omit any rows or data points.
3. Use appropriate chart types:
   - For tables: use { type: "table", header: {...}, cells: {...} }
   - For bar charts: use { type: "bar" }
   - For scatter/line: use { type: "scatter" }
   - For histograms: use { type: "histogram" }
4. Style for educational/academic use: clear fonts (size 14+), readable colors, proper axis labels.
5. Set figure size: width: 800, height: 600 (or taller for tables with many rows).
6. Use distinct, high-contrast colors suitable for SAT test materials.

Return ONLY a valid JSON object with "data" and "layout" properties. No explanations, no markdown, no code blocks.

Example for a table:
{
  "data": [{
    "type": "table",
    "header": { "values": ["Col A", "Col B"], "fill": { "color": "#2c3e50" }, "font": { "color": "white", "size": 14 }, "align": "center" },
    "cells": { "values": [["Row1A", "Row2A"], ["Row1B", "Row2B"]], "fill": { "color": ["#f8f9fa", "#ecf0f1"] }, "font": { "size": 13 }, "align": "center" }
  }],
  "layout": { "title": "Table Title", "width": 800, "height": 400 }
}

Example for a bar chart:
{
  "data": [{ "x": ["A", "B"], "y": [10, 20], "type": "bar" }],
  "layout": { "title": "Chart Title", "xaxis": { "title": "X" }, "yaxis": { "title": "Y" }, "width": 800, "height": 600 }
}`;

  try {
    const fetch = require('node-fetch');
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.4',
        input: [
          {
            role: 'system',
            content: 'You are an expert data visualization developer. Return ONLY valid JSON for Plotly.js configurations. No markdown, no explanations.'
          },
          { role: 'user', content: prompt }
        ],
        max_output_tokens: 16384,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `OpenAI API error: ${response.status}`);
    }

    // Extract text from the Responses API format
    let configText = '';
    if (data.output && Array.isArray(data.output)) {
      const messageOutput = data.output.find(item => item.type === 'message');
      if (messageOutput?.content && Array.isArray(messageOutput.content)) {
        const textContent = messageOutput.content.find(item => item.type === 'output_text');
        if (textContent?.text) {
          configText = textContent.text;
        }
      }
    }
    if (!configText) {
      configText = data.output_text || '';
    }
    if (!configText) {
      throw new Error('No content returned from OpenAI');
    }

    // Clean up and parse JSON
    let cleanConfig = configText.trim()
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Extract the JSON object
    const firstBrace = cleanConfig.indexOf('{');
    const lastBrace = cleanConfig.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('No valid JSON object found in OpenAI response');
    }
    cleanConfig = cleanConfig.substring(firstBrace, lastBrace + 1);

    // Fix common JSON issues
    cleanConfig = cleanConfig
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']');

    const parsedConfig = JSON.parse(cleanConfig);

    if (!parsedConfig.data || !parsedConfig.layout) {
      throw new Error('Invalid Plotly config: missing required data or layout properties');
    }

    return parsedConfig;
  } catch (error) {
    console.error('Error generating Plotly config with OpenAI:', error);
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
