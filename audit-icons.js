// Icon path audit script
const fs = require('fs');
const path = require('path');

// Import the icon configuration
const azureIconsPath = './src/utils/azureIcons.js';
const publicIconsPath = './public/icons';

// Read the azureIcons.js file
const azureIconsContent = fs.readFileSync(azureIconsPath, 'utf8');

// Extract all icon paths using regex
const pathRegex = /path:\s*['"]([^'"]+)['"]/g;
let match;
const configuredPaths = [];

while ((match = pathRegex.exec(azureIconsContent)) !== null) {
  configuredPaths.push(match[1]);
}

console.log(`Found ${configuredPaths.length} icon paths in azureIcons.js\n`);

// Check each path
const missingIcons = [];
const existingIcons = [];

configuredPaths.forEach(iconPath => {
  // Remove leading slash and construct full path
  const relativePath = iconPath.startsWith('/') ? iconPath.slice(1) : iconPath;
  const fullPath = path.join(publicIconsPath, relativePath.replace('icons/', ''));
  
  if (fs.existsSync(fullPath)) {
    existingIcons.push(iconPath);
  } else {
    missingIcons.push({ configured: iconPath, expected: fullPath });
  }
});

console.log(`✅ Existing icons: ${existingIcons.length}`);
console.log(`❌ Missing icons: ${missingIcons.length}\n`);

if (missingIcons.length > 0) {
  console.log('MISSING ICONS:');
  console.log('=============\n');
  missingIcons.forEach(icon => {
    console.log(`❌ ${icon.configured}`);
    console.log(`   Expected at: ${icon.expected}\n`);
  });
}

// Now scan actual files and find ones not in config
console.log('\n\nSCANNING ACTUAL FILES...\n');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.svg')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const actualFiles = getAllFiles(publicIconsPath);
console.log(`Found ${actualFiles.length} SVG files in ${publicIconsPath}\n`);

// Convert actual files to icon paths
const actualPaths = actualFiles.map(f => {
  return '/' + f.replace(/\\/g, '/').replace('public/', '');
});

// Find files that exist but aren't in config
const notConfigured = actualPaths.filter(p => !configuredPaths.includes(p));

if (notConfigured.length > 0) {
  console.log(`📁 Files exist but NOT in config: ${notConfigured.length}\n`);
  notConfigured.slice(0, 20).forEach(p => console.log(`  ${p}`));
  if (notConfigured.length > 20) {
    console.log(`  ... and ${notConfigured.length - 20} more`);
  }
}
