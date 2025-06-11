# Plotly.js Graph Generation Setup (Recommended)

## Why Plotly.js?

✅ **No Python dependencies** - Pure JavaScript solution  
✅ **Easier deployment** - Single runtime environment  
✅ **Better security** - No code execution, just JSON configuration  
✅ **High quality** - Professional mathematical graphs  
✅ **Better performance** - No process spawning overhead  

## Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install puppeteer
```

### 2. Set OpenAI API Key
Add to your `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Start the Server
```bash
npm run dev
```

### 4. Test the Feature
1. Go to `/admin/graph-generation`
2. You should see: ✅ **Plotly.js Environment Ready (Recommended)**
3. Click "Generate Graph" on any question with a graph description

## That's it! 🎉

The system will:
1. Use GPT-4 to generate Plotly.js configuration
2. Render the graph using Puppeteer + Plotly.js
3. Save as PNG and upload to Firebase Storage
4. Attach to your question automatically

## Deployment Notes

### For Render.com:
- Puppeteer installs automatically
- No additional buildpacks needed
- Just set your `OPENAI_API_KEY` environment variable

### For Heroku:
Add this buildpack for Puppeteer support:
```bash
heroku buildpacks:add jontewks/puppeteer
```

### For Other Platforms:
- Ensure Chrome/Chromium is available for Puppeteer
- Set environment variables appropriately

## Sample Generated Code

Instead of Python matplotlib code, the system now generates clean Plotly.js configurations:

```json
{
  "data": [
    {
      "x": [-2, -1, 0, 1, 2, 3, 4, 5],
      "y": [7, 4, 3, 4, 7, 12, 19, 28],
      "type": "scatter",
      "mode": "lines",
      "name": "y = x² - 4x + 3",
      "line": { "color": "#2196F3", "width": 3 }
    }
  ],
  "layout": {
    "title": "Parabola: y = x² - 4x + 3",
    "xaxis": { "title": "x", "range": [-1, 5] },
    "yaxis": { "title": "y", "range": [-2, 6] },
    "width": 800,
    "height": 600,
    "font": { "size": 14 }
  }
}
```

## Troubleshooting

### "Puppeteer Not Found"
```bash
npm install puppeteer
```

### "TimeoutError" or Browser Issues
This typically happens on some server environments. Try:
```bash
npm install puppeteer --unsafe-perm=true
```

### Memory Issues
Puppeteer can be memory-intensive. Ensure your server has at least 512MB RAM available.

## Comparison to Python Approach

| Feature | Plotly.js | Python/matplotlib |
|---------|-----------|-------------------|
| Setup Complexity | ⭐⭐⭐⭐⭐ Simple | ⭐⭐ Complex |
| Dependencies | Just Puppeteer | Python + packages |
| Security | ⭐⭐⭐⭐⭐ Safe | ⭐⭐ Code execution risk |
| Performance | ⭐⭐⭐⭐ Fast | ⭐⭐⭐ Slower |
| Graph Quality | ⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Excellent |
| Deployment | ⭐⭐⭐⭐⭐ Easy | ⭐⭐ Complex |

**Recommendation**: Use Plotly.js for 95% of mathematical graphs. Only consider Python/matplotlib for very specialized scientific plots.

## Next Steps

Once setup is complete:
1. Test with a few sample questions
2. Use bulk generation for processing many questions
3. Monitor graph quality and adjust prompts if needed
4. Consider the interactive graph viewer feature (coming soon!)

---

**Questions?** Check the main [Graph Generation Setup Guide](./GRAPH_GENERATION_SETUP.md) for more detailed information. 