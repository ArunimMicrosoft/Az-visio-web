const fs = require('fs');
const path = require('path');

const basePath = 'c:\\Users\\labadmin\\Desktop\\python-mini\\Az visio web';
const publicIconsPath = path.join(basePath, 'public', 'icons');
const azureIconsPath = path.join(basePath, 'src', 'utils', 'azureIcons.js');

console.log('\n========================================');
console.log('  COMPREHENSIVE ICON AUDIT');
console.log('========================================\n');

// Read the azureIcons.js file
const content = fs.readFileSync(azureIconsPath, 'utf8');

// Extract all icon paths
const pathRegex = /path:\s*['"]([^'"]+)['"]/g;
let match;
const allConfiguredPaths = [];

while ((match = pathRegex.exec(content)) !== null) {
  allConfiguredPaths.push(match[1]);
}

console.log(`Total configured icons: ${allConfiguredPaths.length}\n`);

// Get all categories (directories)
const categories = fs.readdirSync(publicIconsPath).filter(item => {
  return fs.statSync(path.join(publicIconsPath, item)).isDirectory();
});

let totalMissing = 0;
let totalFound = 0;
const missingReport = [];

categories.forEach(category => {
  // Get actual files in this category
  const categoryPath = path.join(publicIconsPath, category);
  const actualFiles = fs.readdirSync(categoryPath)
    .filter(f => f.endsWith('.svg'));
  
  // Get configured paths for this category
  const configuredInCategory = allConfiguredPaths.filter(p => 
    p.includes(`/icons/${category}/`)
  );
  
  // Extract just filenames from configured paths
  const configuredFiles = configuredInCategory.map(p => {
    const parts = p.split('/');
    return parts[parts.length - 1];
  });
  
  // Find missing files
  const missing = [];
  configuredFiles.forEach(configFile => {
    if (!actualFiles.includes(configFile)) {
      missing.push(configFile);
      missingReport.push({
        category,
        filename: configFile,
        configuredPath: `/icons/${category}/${configFile}`
      });
    }
  });
  
  if (missing.length > 0) {
    console.log(`❌ ${category}: ${missing.length} missing out of ${configuredFiles.length}`);
    totalMissing += missing.length;
    totalFound += (configuredFiles.length - missing.length);
    
    // Show first few missing
    missing.slice(0, 3).forEach(f => {
      console.log(`   - ${f}`);
    });
    if (missing.length > 3) {
      console.log(`   ... and ${missing.length - 3} more`);
    }
  } else if (configuredFiles.length > 0) {
    console.log(`✅ ${category}: ${configuredFiles.length} icons OK`);
    totalFound += configuredFiles.length;
  }
});

console.log('\n========================================');
console.log('  SUMMARY');
console.log('========================================');
console.log(`✅ Working icons: ${totalFound}`);
console.log(`❌ Missing icons: ${totalMissing}`);
console.log(`📊 Success rate: ${((totalFound / (totalFound + totalMissing)) * 100).toFixed(1)}%`);

if (missingReport.length > 0) {
  const reportPath = path.join(basePath, 'MISSING_ICONS_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(missingReport, null, 2));
  console.log(`\n📄 Full report saved to: MISSING_ICONS_REPORT.json`);
}

console.log('\n');
