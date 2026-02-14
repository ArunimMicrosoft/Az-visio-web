const fs = require('fs');
let c = fs.readFileSync('src/utils/costCalculator.js', 'utf8');
const search = "'workloadorchestration':'monitor',";
const replace = "'workloadorchestration':'monitor','applens':'monitor','azurechaosstudio':'monitor','ceres':'monitor',";
if (c.includes(search)) {
  c = c.replace(search, replace);
  fs.writeFileSync('src/utils/costCalculator.js', c);
  console.log('Fixed - added 3 missing mappings');
} else {
  console.log('Search string not found');
}
