const fs = require('fs');
const content = fs.readFileSync('src/utils/costCalculator.js', 'utf8');

// Extract the azurePricing object
const pricingStart = content.indexOf('const azurePricing = {');
const pricingEnd = content.indexOf('};', pricingStart) + 2;
const pricingSection = content.substring(pricingStart, pricingEnd);

// Find all keys with line numbers
const lines = pricingSection.split('\n');
const keys = [];
lines.forEach((line, index) => {
  const match = line.match(/^\s+([a-z0-9]+):\s*{/);
  if (match) {
    keys.push({ key: match[1], line: index + 1 });
  }
});

// Find duplicates
const keyCount = {};
const keyLines = {};
keys.forEach(({ key, line }) => {
  keyCount[key] = (keyCount[key] || 0) + 1;
  if (!keyLines[key]) keyLines[key] = [];
  keyLines[key].push(line);
});

const duplicates = Object.entries(keyCount).filter(([key, count]) => count > 1);

console.log('Total keys:', keys.length);
console.log('Duplicate keys found:', duplicates.length);
console.log('\n==== DUPLICATES ====\n');
duplicates.forEach(([key, count]) => {
  console.log(`${key}: appears ${count} times at lines ${keyLines[key].join(', ')}`);
});
