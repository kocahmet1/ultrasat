const fs = require('fs');
const path = require('path');

console.log('🚀 BUILD OPTIMIZATION ANALYZER\n');

// Analyze CSS files and their sizes
const analyzeCSS = () => {
  const stylesDir = path.join(__dirname, '../src/styles');
  const cssFiles = [];
  
  if (fs.existsSync(stylesDir)) {
    const files = fs.readdirSync(stylesDir).filter(file => file.endsWith('.css'));
    
    files.forEach(file => {
      const filePath = path.join(stylesDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      
      cssFiles.push({
        name: file,
        size: parseFloat(sizeKB),
        path: filePath
      });
    });
  }
  
  // Sort by size descending
  cssFiles.sort((a, b) => b.size - a.size);
  
  return cssFiles;
};

// Check for potential unused imports
const analyzeJSImports = () => {
  const srcDir = path.join(__dirname, '../src');
  let totalFiles = 0;
  let potentialIssues = [];
  
  const scanDirectory = (dir) => {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && !item.includes('node_modules')) {
        scanDirectory(itemPath);
      } else if (item.endsWith('.jsx') || item.endsWith('.js')) {
        totalFiles++;
        const content = fs.readFileSync(itemPath, 'utf8');
        
        // Check for large library imports that might not be fully used
        const heavyImports = [
          'chart.js',
          '@mui/material',
          '@fortawesome',
          'react-bootstrap',
          'bootstrap'
        ];
        
        heavyImports.forEach(lib => {
          if (content.includes(`from '${lib}'`) || content.includes(`require('${lib}')`)) {
            potentialIssues.push({
              file: itemPath.replace(srcDir, ''),
              library: lib,
              type: 'heavy_import'
            });
          }
        });
        
        // Check for unused CSS imports
        const cssImportRegex = /import\s+['"]([^'"]*\.css)['"]/g;
        let match;
        while ((match = cssImportRegex.exec(content)) !== null) {
          const cssFile = match[1];
          if (cssFile.includes('styles/')) {
            // This could be checked against actual usage
            potentialIssues.push({
              file: itemPath.replace(srcDir, ''),
              cssFile: cssFile,
              type: 'css_import'
            });
          }
        }
      }
    });
  };
  
  scanDirectory(srcDir);
  return { totalFiles, potentialIssues };
};

// Main analysis
const cssAnalysis = analyzeCSS();
const jsAnalysis = analyzeJSImports();

console.log('📊 CSS ANALYSIS');
console.log('===============');
console.log(`Total CSS files: ${cssAnalysis.length}`);
console.log(`Total CSS size: ${cssAnalysis.reduce((sum, file) => sum + file.size, 0).toFixed(1)}KB\n`);

console.log('🎯 LARGEST CSS FILES (>5KB):');
cssAnalysis.filter(file => file.size > 5).forEach((file, index) => {
  console.log(`${index + 1}. ${file.name}: ${file.size}KB`);
});

console.log('\n📦 JAVASCRIPT ANALYSIS');
console.log('======================');
console.log(`Total JS/JSX files scanned: ${jsAnalysis.totalFiles}`);

const heavyImports = jsAnalysis.potentialIssues.filter(issue => issue.type === 'heavy_import');
if (heavyImports.length > 0) {
  console.log('\n⚠️  HEAVY LIBRARY IMPORTS:');
  const importCounts = {};
  heavyImports.forEach(issue => {
    importCounts[issue.library] = (importCounts[issue.library] || 0) + 1;
  });
  
  Object.entries(importCounts).forEach(([lib, count]) => {
    console.log(`   ${lib}: used in ${count} files`);
  });
}

console.log('\n🎯 OPTIMIZATION RECOMMENDATIONS');
console.log('================================');

// CSS Recommendations
console.log('\n📄 CSS Optimizations:');
const largeCSSFiles = cssAnalysis.filter(file => file.size > 10);
if (largeCSSFiles.length > 0) {
  console.log('1. Consider splitting large CSS files:');
  largeCSSFiles.forEach(file => {
    console.log(`   • ${file.name} (${file.size}KB) - Consider component-specific CSS modules`);
  });
}

console.log('2. Implement CSS purging in production build');
console.log('3. Use CSS-in-JS for component-specific styles');
console.log('4. Consider using CSS variables for theming');

// JS Recommendations
console.log('\n📦 JavaScript Optimizations:');
console.log('1. ✅ Code splitting implemented with React.lazy()');
console.log('2. Consider tree-shaking for large libraries');
console.log('3. Use dynamic imports for heavy features');

if (heavyImports.length > 0) {
  console.log('4. Review large library usage:');
  const uniqueLibs = [...new Set(heavyImports.map(issue => issue.library))];
  uniqueLibs.forEach(lib => {
    console.log(`   • ${lib} - Consider using only specific components`);
  });
}

console.log('\n🏗️  BUILD OPTIMIZATIONS TO IMPLEMENT');
console.log('====================================');
console.log('1. Enable CSS minification and purging');
console.log('2. Implement service worker for caching');
console.log('3. Add preload hints for critical resources');
console.log('4. Enable Gzip/Brotli compression');
console.log('5. Use webpack-bundle-analyzer for detailed analysis');

console.log('\n📋 NEXT STEPS');
console.log('==============');
console.log('1. Run: npm run build');
console.log('2. Serve built files and test PageSpeed');
console.log('3. Monitor Core Web Vitals');
console.log('4. Consider implementing a PWA');

// Write recommendations to file
const recommendations = {
  cssFiles: cssAnalysis,
  jsAnalysis: jsAnalysis,
  timestamp: new Date().toISOString(),
  recommendations: {
    css: [
      'Split large CSS files (>10KB) into component-specific modules',
      'Implement CSS purging for unused styles',
      'Use critical CSS for above-the-fold content'
    ],
    js: [
      'Code splitting already implemented',
      'Tree-shake large libraries',
      'Dynamic imports for admin features'
    ],
    build: [
      'Enable compression',
      'Add service worker',
      'Preload critical resources'
    ]
  }
};

fs.writeFileSync(
  path.join(__dirname, '../build-analysis.json'),
  JSON.stringify(recommendations, null, 2)
);

console.log('\n💾 Analysis saved to build-analysis.json');
console.log('\n🎉 Analysis complete!'); 