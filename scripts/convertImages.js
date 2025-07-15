const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '../public/images');
const optimizedDir = path.join(imagesDir, 'optimized');

// Ensure optimized directory exists
if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir);
}

const optimizations = [
  {
    input: 'sat-common-mistakes.jpg',
    output: 'sat-common-mistakes',
    width: 768,
    height: 512,
    quality: 85
  },
  {
    input: 'sat-time-management.jpg', 
    output: 'sat-time-management',
    width: 768,
    height: 768,
    quality: 85
  },
  {
    input: 'sat-math-strategies.jpg',
    output: 'sat-math-strategies', 
    width: 768,
    height: 512,
    quality: 85
  },
  {
    input: 'sat-reading-tips.jpg',
    output: 'sat-reading-tips',
    width: 768, 
    height: 512,
    quality: 85
  },
  {
    input: 'sat-test-day.jpg',
    output: 'sat-test-day',
    width: 768,
    height: 512, 
    quality: 85
  },
  {
    input: 'phonescreen.png',
    output: 'phonescreen',
    width: 692,
    height: 350,
    quality: 90
  },
  {
    input: 'middle.png',
    output: 'middle',
    width: 360,
    height: 334,
    quality: 90
  },
  {
    input: 'aihot.png',
    output: 'aihot',
    width: 212,
    height: 72,
    quality: 90
  }
];

async function optimizeImages() {
  console.log('🚀 Starting image optimization...\n');
  
  for (const opt of optimizations) {
    const inputPath = path.join(imagesDir, opt.input);
    const outputWebp = path.join(optimizedDir, `${opt.output}.webp`);
    const outputJpg = path.join(optimizedDir, `${opt.output}.jpg`);
    
    if (!fs.existsSync(inputPath)) {
      console.log(`❌ File not found: ${opt.input}`);
      continue;
    }
    
    try {
      console.log(`📷 Processing ${opt.input}...`);
      
      // Get original file size
      const originalStats = fs.statSync(inputPath);
      const originalSizeMB = (originalStats.size / 1024 / 1024).toFixed(2);
      
      // Create WebP version
      await sharp(inputPath)
        .resize(opt.width, opt.height, { 
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: opt.quality })
        .toFile(outputWebp);
      
      // Create fallback JPG version  
      await sharp(inputPath)
        .resize(opt.width, opt.height, {
          fit: 'cover', 
          position: 'center'
        })
        .jpeg({ quality: opt.quality })
        .toFile(outputJpg);
      
      // Get new file sizes
      const webpStats = fs.statSync(outputWebp);
      const jpgStats = fs.statSync(outputJpg);
      const webpSizeMB = (webpStats.size / 1024 / 1024).toFixed(2);
      const jpgSizeMB = (jpgStats.size / 1024 / 1024).toFixed(2);
      
      const savings = ((originalStats.size - webpStats.size) / originalStats.size * 100).toFixed(1);
      
      console.log(`   ✅ Original: ${originalSizeMB}MB → WebP: ${webpSizeMB}MB, JPG: ${jpgSizeMB}MB`);
      console.log(`   💾 Savings: ${savings}% with WebP\n`);
      
    } catch (error) {
      console.log(`   ❌ Error processing ${opt.input}:`, error.message);
    }
  }
  
  console.log('🎉 Image optimization complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Update components to use optimized images');
  console.log('2. Implement <picture> elements for WebP with JPG fallback');
  console.log('3. Add lazy loading for images');
}

optimizeImages().catch(console.error); 