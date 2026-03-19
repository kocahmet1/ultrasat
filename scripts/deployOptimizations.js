#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 UltraSAT Performance Optimization Deployment Script');
console.log('=====================================================\n');

// Track optimization steps
const optimizations = {
  imageOptimization: false,
  serviceWorkerSetup: false,
  cacheConfigSetup: false,
  buildOptimization: false,
  finalValidation: false
};

// Helper function to run command and capture output
function runCommand(command, description) {
  console.log(`⚡ ${description}...`);
  try {
    execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} completed successfully\n`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} failed: ${error.message}\n`);
    return false;
  }
}

// Check if directory exists
function checkDir(dirPath, createIfMissing = false) {
  if (!fs.existsSync(dirPath)) {
    if (createIfMissing) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dirPath}`);
      return true;
    }
    return false;
  }
  return true;
}

// Step 1: Image Optimization
async function optimizeImages() {
  console.log('📸 STEP 1: Image Optimization');
  console.log('==============================');
  
  if (!checkDir('apps/web/public/images/optimized', true)) {
    console.log('❌ Failed to create optimized images directory');
    return false;
  }
  
  // Check if Sharp is installed
  try {
    require('sharp');
  } catch (error) {
    console.log('📦 Installing image optimization dependencies...');
    if (!runCommand('npm install sharp imagemin imagemin-webp imagemin-mozjpeg imagemin-pngquant', 'Installing dependencies')) {
      return false;
    }
  }
  
  // Run image optimization
  if (runCommand('node scripts/convertImages.js', 'Converting images to WebP')) {
    optimizations.imageOptimization = true;
    return true;
  }
  return false;
}

// Step 2: Service Worker Setup Validation
function validateServiceWorker() {
  console.log('🛡️  STEP 2: Service Worker Validation');
  console.log('====================================');
  
  const swPath = 'apps/web/public/sw.js';
  const swRegPath = 'apps/web/src/utils/serviceWorkerRegistration.js';
  
  if (!fs.existsSync(swPath)) {
    console.log('❌ Service Worker file missing: public/sw.js');
    return false;
  }
  
  if (!fs.existsSync(swRegPath)) {
    console.log('❌ Service Worker registration missing: src/utils/serviceWorkerRegistration.js');
    return false;
  }
  
  console.log('✅ Service Worker files are present');
  optimizations.serviceWorkerSetup = true;
  return true;
}

// Step 3: Cache Configuration
function validateCacheConfig() {
  console.log('⚡ STEP 3: Cache Configuration Validation');
  console.log('========================================');
  
  const cacheConfigPath = 'apps/web/src/utils/cacheConfig.js';
  
  if (!fs.existsSync(cacheConfigPath)) {
    console.log('❌ Cache configuration missing: src/utils/cacheConfig.js');
    return false;
  }
  
  console.log('✅ Cache configuration is present');
  optimizations.cacheConfigSetup = true;
  return true;
}

// Step 4: Build Optimization
function optimizeBuild() {
  console.log('🏗️  STEP 4: Build Optimization');
  console.log('==============================');
  
  // Update package.json with optimization scripts if not present
  const packagePath = 'package.json';
  const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const optimizedScripts = {
    'build:prod': 'npm run build:prod --workspace @ultrasat/web',
    'build:analyze': 'npm run build:analyze --workspace @ultrasat/web',
    'optimize:complete': 'npm run optimize:images && npm run build:prod'
  };
  
  let updated = false;
  Object.entries(optimizedScripts).forEach(([key, value]) => {
    if (!packageData.scripts[key]) {
      packageData.scripts[key] = value;
      updated = true;
    }
  });
  
  if (updated) {
    fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
    console.log('✅ Updated package.json with optimization scripts');
  }
  
  // Create production environment file
  const envProdPath = '.env.production';
  const envProdContent = `GENERATE_SOURCEMAP=false
PUBLIC_URL=/
`;
  
  if (!fs.existsSync(envProdPath)) {
    fs.writeFileSync(envProdPath, envProdContent);
    console.log('✅ Created .env.production file');
  }
  
  // Run production build
  let buildSuccess = false;
  
  // Try optimized build first
  if (runCommand('npm run build:prod', 'Building optimized production bundle')) {
    buildSuccess = true;
  } else {
    console.log('⚠️ Optimized build failed, falling back to standard build...');
    // Fallback to standard build
    if (runCommand('npm run build', 'Building standard production bundle')) {
      buildSuccess = true;
      console.log('✅ Standard build completed successfully');
    }
  }
  
  if (buildSuccess) {
    optimizations.buildOptimization = true;
    return true;
  }
  return false;
}

// Step 5: Final Validation
function validateOptimizations() {
  console.log('✅ STEP 5: Final Validation');
  console.log('===========================');
  
  const buildDir = 'build';
  if (!checkDir(buildDir)) {
    console.log('❌ Build directory not found');
    return false;
  }
  
  // Check for optimized images
  const optimizedImagesDir = 'apps/web/public/images/optimized';
  if (checkDir(optimizedImagesDir)) {
    const optimizedFiles = fs.readdirSync(optimizedImagesDir);
    const webpFiles = optimizedFiles.filter(f => f.endsWith('.webp'));
    console.log(`✅ Found ${webpFiles.length} optimized WebP images`);
  }
  
  // Check build size
  const staticDir = path.join(buildDir, 'static');
  if (checkDir(staticDir)) {
    const jsDir = path.join(staticDir, 'js');
    const cssDir = path.join(staticDir, 'css');
    
    if (checkDir(jsDir)) {
      const jsFiles = fs.readdirSync(jsDir);
      console.log(`✅ Generated ${jsFiles.length} JavaScript chunks`);
    }
    
    if (checkDir(cssDir)) {
      const cssFiles = fs.readdirSync(cssDir);
      console.log(`✅ Generated ${cssFiles.length} CSS files`);
    }
  }
  
  optimizations.finalValidation = true;
  return true;
}

// Generate deployment report
function generateReport() {
  console.log('\n📊 OPTIMIZATION REPORT');
  console.log('======================');
  
  const completedOptimizations = Object.values(optimizations).filter(Boolean).length;
  const totalOptimizations = Object.keys(optimizations).length;
  const completionRate = (completedOptimizations / totalOptimizations * 100).toFixed(1);
  
  console.log(`\n🎯 Completion Rate: ${completionRate}% (${completedOptimizations}/${totalOptimizations})\n`);
  
  Object.entries(optimizations).forEach(([key, completed]) => {
    const status = completed ? '✅' : '❌';
    const name = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${name}`);
  });
  
  console.log('\n🚀 NEXT STEPS');
  console.log('=============');
  
  if (completionRate === 100) {
    console.log('🎉 All optimizations completed successfully!');
    console.log('\n1. Deploy your build/ directory to production');
    console.log('2. Configure server cache headers (see CACHING_DEPLOYMENT_GUIDE.md)');
    console.log('3. Test with PageSpeed Insights: https://pagespeed.web.dev/');
    console.log('4. Monitor performance with Core Web Vitals');
    console.log('\n📈 Expected Results:');
    console.log('   • Performance Score: 90+');
    console.log('   • FCP: < 2.0s');
    console.log('   • LCP: < 2.5s');
    console.log('   • TBT: < 100ms');
    console.log('   • CLS: < 0.1');
  } else {
    console.log('⚠️  Some optimizations failed. Please check the errors above and retry.');
    console.log('\nFailed optimizations:');
    Object.entries(optimizations).forEach(([key, completed]) => {
      if (!completed) {
        const name = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        console.log(`   • ${name}`);
      }
    });
  }
  
  console.log('\n📚 Documentation:');
  console.log('   • PERFORMANCE_TESTING_GUIDE.md');
  console.log('   • CACHING_DEPLOYMENT_GUIDE.md');
  console.log('   • build-analysis.json (if generated)');
}

// Main execution
async function main() {
  try {
    console.log('Starting comprehensive performance optimization...\n');
    
    await optimizeImages();
    validateServiceWorker();
    validateCacheConfig();
    optimizeBuild();
    validateOptimizations();
    
    generateReport();
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { optimizations, main }; 
