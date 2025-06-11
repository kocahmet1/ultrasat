/**
 * API Endpoint for generating graphs from text descriptions using LLM
 * Integrates with OpenAI to generate matplotlib code and executes it to create graph images
 */

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');

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
 * Generate matplotlib code from question text and graph description using OpenAI
 */
const generateMatplotlibCode = async (questionText, graphDescription) => {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not found in environment variables');
  }

  const prompt = `You are an expert Python matplotlib developer. Generate Python code to create a mathematical graph based on the following:

Question Text: "${questionText}"
Graph Description: "${graphDescription}"

Requirements:
1. Generate clean, executable Python matplotlib code
2. Include all necessary imports (matplotlib.pyplot, numpy, etc.)
3. Set appropriate figure size (10, 8)
4. Use clear, readable fonts (size 12+)
5. Include proper axis labels, title if needed
6. Use educational/academic styling
7. Save the figure as 'graph.png' with 300 DPI
8. Make sure all mathematical elements are clearly visible
9. Use colors that work well for educational materials
10. Close the figure after saving to free memory

IMPORTANT: 
- Only return the Python code, no explanations
- Code must be ready to execute directly
- Include plt.tight_layout() for better spacing
- Use plt.savefig('graph.png', dpi=300, bbox_inches='tight')
- Include plt.close() at the end

Example structure:
import matplotlib.pyplot as plt
import numpy as np

# Your code here
plt.figure(figsize=(10, 8))
# ... plotting code ...
plt.savefig('graph.png', dpi=300, bbox_inches='tight')
plt.close()`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Python matplotlib developer focused on creating educational mathematical graphs.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const code = data.choices[0].message.content.trim();
    
    // Clean up the code - remove markdown code blocks if present
    return code.replace(/```python\n?/g, '').replace(/```\n?/g, '').trim();
  } catch (error) {
    console.error('Error generating matplotlib code:', error);
    throw error;
  }
};

/**
 * Execute Python matplotlib code and generate graph image
 */
const executeMatplotlibCode = async (pythonCode, tempDir) => {
  return new Promise((resolve, reject) => {
    const pythonFilePath = path.join(tempDir, 'generate_graph.py');
    const outputImagePath = path.join(tempDir, 'graph.png');

    // Write Python code to file
    fs.writeFile(pythonFilePath, pythonCode)
      .then(() => {
        // Execute Python code
        exec(`python "${pythonFilePath}"`, { cwd: tempDir }, async (error, stdout, stderr) => {
          if (error) {
            console.error('Python execution error:', error);
            console.error('stderr:', stderr);
            reject(new Error(`Python execution failed: ${error.message}`));
            return;
          }

          try {
            // Check if graph was created
            await fs.access(outputImagePath);
            resolve(outputImagePath);
          } catch (accessError) {
            reject(new Error('Graph image was not generated successfully'));
          }
        });
      })
      .catch(reject);
  });
};

/**
 * Upload graph to Firebase Storage using Admin SDK
 */
const uploadGraphToStorage = async (imagePath, fileName) => {
  try {
    const bucket = admin.storage().bucket();
    const destination = `graphs/${fileName}`;
    
    // Upload file to Firebase Storage
    await bucket.upload(imagePath, {
      destination: destination,
      metadata: {
        contentType: 'image/png',
      },
    });

    // Make the file publicly accessible
    const file = bucket.file(destination);
    await file.makePublic();
    
    // Return the public URL
    return `https://storage.googleapis.com/${bucket.name}/${destination}`;
  } catch (error) {
    console.error('Error uploading to Firebase Storage:', error);
    throw error;
  }
};

/**
 * POST /api/generate-graph
 * Generate a graph from question text and description
 * 
 * Request body:
 * {
 *   questionId: string,        // Question ID to update
 *   questionText: string,      // Full question text
 *   graphDescription: string   // Description of the graph to generate
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   graphUrl: string,          // URL of the generated graph
 *   message: string
 * }
 */
router.post('/generate-graph', authenticateUser, async (req, res) => {
  let tempDir = null;
  
  try {
    const { questionId, questionText, graphDescription } = req.body;

    if (!questionId || !questionText || !graphDescription) {
      return res.status(400).json({ 
        error: 'Missing required fields: questionId, questionText, and graphDescription are required' 
      });
    }

    console.log(`Generating graph for question ${questionId}`);

    // Create temporary directory for Python execution
    tempDir = path.join(__dirname, 'temp', `graph_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    await fs.mkdir(tempDir, { recursive: true });

    // Step 1: Generate matplotlib code using OpenAI
    console.log('Generating matplotlib code...');
    const pythonCode = await generateMatplotlibCode(questionText, graphDescription);
    console.log('Generated Python code:', pythonCode.substring(0, 200) + '...');

    // Step 2: Execute Python code to generate graph
    console.log('Executing Python code...');
    const graphImagePath = await executeMatplotlibCode(pythonCode, tempDir);
    console.log('Graph generated successfully at:', graphImagePath);

    // Step 3: Upload graph to Firebase Storage
    console.log('Uploading graph to storage...');
    const fileName = `${questionId}_generated_${Date.now()}.png`;
    const graphUrl = await uploadGraphToStorage(graphImagePath, fileName);
    console.log('Graph uploaded successfully:', graphUrl);

    // Step 4: Update question in database with new graph URL
    const db = admin.firestore();
    await db.collection('questions').doc(questionId).update({
      graphUrl: graphUrl,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      generatedGraph: true // Flag to indicate this was AI-generated
    });

    console.log('Question updated successfully');

    res.json({
      success: true,
      graphUrl: graphUrl,
      message: 'Graph generated and attached successfully'
    });

  } catch (error) {
    console.error('Error generating graph:', error);
    res.status(500).json({ 
      error: 'Failed to generate graph: ' + error.message 
    });
  } finally {
    // Clean up temporary directory
    if (tempDir) {
      try {
        await fs.rmdir(tempDir, { recursive: true });
      } catch (cleanupError) {
        console.error('Error cleaning up temp directory:', cleanupError);
      }
    }
  }
});

/**
 * GET /api/check-python
 * Check if Python and required packages are installed
 */
router.get('/check-python', authenticateUser, async (req, res) => {
  try {
    exec('python --version && python -c "import matplotlib, numpy; print(\'Dependencies OK\')"', (error, stdout, stderr) => {
      if (error) {
        res.json({
          pythonInstalled: false,
          error: error.message,
          requirements: 'Python with matplotlib and numpy packages required'
        });
      } else {
        res.json({
          pythonInstalled: true,
          version: stdout.trim(),
          message: 'Python environment ready for graph generation'
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check Python installation' });
  }
});

module.exports = router; 