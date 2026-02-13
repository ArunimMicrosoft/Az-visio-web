// Generate azureIcons.js from actual icon files
const fs = require('fs');
const path = require('path');

const publicIconsPath = path.join(__dirname, 'public', 'icons');
const outputPath = path.join(__dirname, 'src', 'utils', 'azureIcons-NEW.js');

// Category name mapping
const categoryDisplayNames = {
  'compute': 'Compute',
  'storage': 'Storage',
  'databases': 'Databases',
  'networking': 'Networking',
  'security': 'Security',
  'identity': 'Identity',
  'ai + machine learning': 'AI + ML',
  'analytics': 'Analytics',
  'iot': 'IoT',
  'devops': 'DevOps',
  'containers': 'Containers',
  'management + governance': 'Management & Governance',
  'integration': 'Integration',
  'monitor': 'Monitoring',
  'web': 'Web',
  'mobile': 'Mobile',
  'migrate': 'Migration',
  'migration': 'Migration',
  'mixed reality': 'Mixed Reality',
  'blockchain': 'Blockchain',
  'intune': 'Intune',
  'azure stack': 'Azure Stack',
  'azure ecosystem': 'Azure Ecosystem',
  'hybrid + multicloud': 'Hybrid + Multicloud',
  'app services': 'App Services',
  'general': 'General',
  'other': 'Other',
  'new icons': 'New Icons',
  'menu': 'Menu'
};

// Function to generate a reasonable ID from filename
function generateId(filename) {
  return filename
    .replace(/^\d+-icon-service-/, '')
    .replace(/\.svg$/, '')
    .replace(/[^a-z0-9]+/gi, '')
    .toLowerCase();
}

// Function to generate a display name from filename
function generateName(filename) {
  let name = filename
    .replace(/^\d+-icon-service-/, '')
    .replace(/\.svg$/, '')
    .replace(/-/g, ' ');
  
  // Capitalize each word
  return name.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

console.log('Scanning icon directories...\n');

const categories = fs.readdirSync(publicIconsPath).filter(item => {
  const itemPath = path.join(publicIconsPath, item);
  return fs.statSync(itemPath).isDirectory();
}).sort();

const iconData = {};
let totalIcons = 0;

categories.forEach(category => {
  const categoryPath = path.join(publicIconsPath, category);
  const svgFiles = fs.readdirSync(categoryPath)
    .filter(f => f.endsWith('.svg'))
    .sort();
  
  if (svgFiles.length > 0) {
    const safeCategoryName = category.replace(/[^a-z0-9]+/gi, '');
    iconData[safeCategoryName] = svgFiles.map(filename => {
      const id = generateId(filename);
      const name = generateName(filename);
      const iconPath = `/icons/${category}/${filename}`;
      
      return {
        id: id,
        name: name,
        path: iconPath,
        category: safeCategoryName
      };
    });
    
    console.log(`✅ ${category}: ${svgFiles.length} icons`);
    totalIcons += svgFiles.length;
  }
});

console.log(`\n📊 Total: ${totalIcons} icons across ${Object.keys(iconData).length} categories\n`);

// Generate the JavaScript file
let output = `// Auto-generated Azure icon categories\n`;
output += `// Generated on: ${new Date().toISOString()}\n`;
output += `// Total icons: ${totalIcons}\n\n`;
output += `export const azureIconCategories = {\n`;

Object.keys(iconData).forEach((category, index) => {
  const icons = iconData[category];
  output += `  ${category}: [\n`;
  
  icons.forEach((icon, iconIndex) => {
    const comma = iconIndex < icons.length - 1 ? ',' : '';
    output += `    { id: '${icon.id}', name: '${icon.name}', path: '${icon.path}', category: '${icon.category}' }${comma}\n`;
  });
  
  const comma = index < Object.keys(iconData).length - 1 ? ',' : '';
  output += `  ]${comma}\n\n`;
});

output += `};\n\n`;

// Add display names
output += `export const categoryDisplayNames = {\n`;
Object.keys(iconData).forEach((category, index) => {
  const displayName = categoryDisplayNames[category.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()] || category;
  const comma = index < Object.keys(iconData).length - 1 ? ',' : '';
  output += `  ${category}: '${displayName}'${comma}\n`;
});
output += `};\n`;

// Write the new file
fs.writeFileSync(outputPath, output, 'utf8');

console.log(`✅ Generated: ${outputPath}`);
console.log(`\n⚠️  NEXT STEPS:`);
console.log(`1. Review the generated file: azureIcons-NEW.js`);
console.log(`2. Backup current azureIcons.js`);
console.log(`3. Rename azureIcons-NEW.js to azureIcons.js`);
console.log(`4. Test the application\n`);
