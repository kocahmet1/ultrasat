# Graph Generation Feature Setup Guide

This guide will help you set up and use the AI-powered graph generation feature that creates matplotlib graphs from text descriptions.

## Overview

The graph generation feature allows you to:
- Automatically generate graphs from question descriptions using OpenAI GPT-4
- Convert text-based graph descriptions into visual matplotlib charts
- Attach generated graphs to questions in your database
- Bulk process multiple questions at once

## Prerequisites

### 1. Python Environment
You need Python 3.8+ installed with matplotlib and numpy packages.

### 2. OpenAI API Key
You need an OpenAI API key with access to GPT-4.

### 3. Firebase Storage
Ensure Firebase Storage is properly configured for your project.

## Installation Steps

### Step 1: Install Python Dependencies

#### Option A: Using pip (Recommended)
```bash
pip install -r requirements.txt
```

#### Option B: Manual Installation
```bash
pip install matplotlib==3.7.1 numpy==1.24.3 seaborn==0.12.2 scipy==1.10.1 pandas==2.0.2 pillow==9.5.0
```

#### Option C: Using conda
```bash
conda install matplotlib numpy seaborn scipy pandas pillow
```

### Step 2: Verify Python Installation
Run this command to verify everything is working:
```bash
python -c "import matplotlib, numpy, seaborn, scipy, pandas; print('All packages installed successfully!')"
```

### Step 3: Set Environment Variables
Add your OpenAI API key to your environment variables:

#### For Development (.env file):
```
OPENAI_API_KEY=your_openai_api_key_here
```

#### For Production:
Set the `OPENAI_API_KEY` environment variable in your deployment platform.

### Step 4: Start the Development Server
```bash
npm run dev
```

This will start both the React frontend and the API server.

## How to Use

### 1. Access the Graph Generation Page
1. Log in as an admin user
2. Navigate to `/admin/graph-generation` or click "Generate Graphs" in the admin dashboard

### 2. Check Environment Status
The page will automatically check if Python and required packages are installed. You should see a green "✅ Python Environment Ready" status.

### 3. Generate Graphs for Individual Questions
1. Use the filter buttons to find questions that need graphs
2. Click the "🎨 Generate Graph" button on any question card
3. Wait for the AI to generate the matplotlib code and create the graph
4. The graph will be automatically uploaded and attached to the question

### 4. Bulk Graph Generation
1. Click "🚀 Generate All Missing Graphs" to process multiple questions
2. Confirm the action (this may take several minutes)
3. The system will stagger requests to avoid overwhelming the API

## Understanding the Process

The graph generation works in 4 steps:

1. **AI Code Generation**: OpenAI GPT-4 analyzes the question text and graph description, then generates clean Python matplotlib code
2. **Python Execution**: The generated code is executed in a temporary environment to create the graph image
3. **File Upload**: The generated PNG image is uploaded to Firebase Storage
4. **Database Update**: The question record is updated with the graph URL and generation flag

## Troubleshooting

### Common Issues

#### "Python Environment Not Ready"
**Problem**: Python or required packages are not installed
**Solution**: 
- Install Python 3.8+ from [python.org](https://python.org)
- Run `pip install -r requirements.txt`
- Restart your API server

#### "OpenAI API Error"
**Problem**: Invalid or missing OpenAI API key
**Solution**:
- Verify your API key is correctly set in environment variables
- Ensure your OpenAI account has sufficient credits
- Check that you have access to GPT-4 (not just GPT-3.5)

#### "Python Execution Failed"
**Problem**: Generated code has syntax errors or missing dependencies
**Solution**:
- Check that all packages in requirements.txt are installed
- Look at the server logs for specific error details
- The AI occasionally generates imperfect code; try regenerating

#### "Firebase Storage Error"
**Problem**: Cannot upload generated graphs
**Solution**:
- Verify Firebase Storage is enabled for your project
- Check Firebase Storage rules allow admin writes
- Ensure the service account has proper permissions

### Development Mode Considerations

- In development, the system uses local file storage instead of Firebase Storage to avoid CORS issues
- Graphs are stored as data URLs in memory during development
- Switch to production mode for full Firebase Storage integration

## Production Deployment

### Server Requirements
- Node.js environment with Python 3.8+ available
- Sufficient memory for matplotlib operations (recommend 1GB+ RAM)
- Storage space for temporary file processing

### Environment Variables for Production
```bash
OPENAI_API_KEY=your_production_openai_key
NODE_ENV=production
FIREBASE_PROJECT_ID=your_project_id
```

### Deployment Platforms

#### Render.com (Recommended)
1. Ensure Python buildpack is enabled
2. Add requirements.txt to your repository
3. Set environment variables in Render dashboard

#### Heroku
1. Add Python buildpack: `heroku buildpacks:add heroku/python`
2. Commit requirements.txt to your repository  
3. Set config vars for API keys

#### Other Platforms
- Ensure Python 3.8+ is available in the runtime
- Install matplotlib and numpy packages
- Configure environment variables appropriately

## API Reference

### Generate Graph Endpoint
```
POST /api/generate-graph
Authorization: Bearer {firebase_token}
Content-Type: application/json

{
  "questionId": "string",
  "questionText": "string", 
  "graphDescription": "string"
}
```

**Response:**
```json
{
  "success": true,
  "graphUrl": "https://storage.googleapis.com/...",
  "message": "Graph generated and attached successfully"
}
```

### Check Python Environment
```
GET /api/check-python
Authorization: Bearer {firebase_token}
```

**Response:**
```json
{
  "pythonInstalled": true,
  "version": "Python 3.9.7",
  "message": "Python environment ready for graph generation"
}
```

## Best Practices

### Graph Descriptions
Write clear, detailed graph descriptions that include:
- Axis labels and ranges
- Data points or functions to plot
- Visual styling preferences
- Mathematical relationships

**Example Good Description:**
"A coordinate plane showing a parabola y = x² - 4x + 3. The x-axis ranges from -1 to 5, y-axis from -2 to 6. Mark the vertex at (2, -1) and x-intercepts at (1, 0) and (3, 0)."

### Performance Tips
- Use bulk generation during off-peak hours
- Monitor OpenAI API usage and costs
- Cache generated graphs to avoid regeneration
- Set reasonable rate limits for API calls

### Quality Control
- Review generated graphs before using in production
- Keep backup copies of original graph descriptions
- Test graph generation with sample questions first
- Monitor success/failure rates through logs

## Cost Considerations

### OpenAI API Costs
- GPT-4 calls cost approximately $0.03-0.06 per graph
- Monitor usage in OpenAI dashboard
- Set usage limits to prevent unexpected charges

### Storage Costs
- Firebase Storage costs are minimal for PNG files
- Each graph is typically 50-200KB
- 1000 graphs ≈ 50-200MB storage

## Support

### Getting Help
1. Check the environment status in the admin panel
2. Review server logs for detailed error messages
3. Test with a single question before bulk processing
4. Ensure all prerequisites are properly installed

### Reporting Issues
When reporting issues, include:
- Environment status screenshot
- Server log output
- Sample question text and description
- Error messages (if any)

## Future Enhancements

Potential improvements for future versions:
- Support for additional graph types (3D plots, statistical charts)
- Integration with LaTeX for mathematical notation
- Custom styling templates for graphs
- Batch processing with progress tracking
- Graph editing capabilities
- Integration with other AI providers

---

**Note**: This feature requires careful setup and monitoring. Test thoroughly in development before deploying to production. 