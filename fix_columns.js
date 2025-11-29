const fs = require('fs');
const path = require('path');

const columnReplacements = [
  // Assessment columns
  { from: /a\.title/g, to: 'a.name' },
  { from: /a\.total_points/g, to: 'a.max_score' },
  // Grade record columns
  { from: /gr\.comments/g, to: 'gr.observations' },
  // Report columns
  { from: /r\.report_type/g, to: 'r.type' },
];

const controllersPath = 'c:\\Users\\GHOPsT\\Desktop\\PPP_Grupo2\\ASISvOX\\backend\\src\\controllers';

const controllers = [
  'grading.controller.ts',
  'report.controller.ts',
  'statistics.controller.ts',
  'assessment.controller.ts'
];

controllers.forEach(controller => {
  const filePath = path.join(controllersPath, controller);
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    columnReplacements.forEach(({ from, to }) => {
      content = content.replace(from, to);
    });
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Fixed columns: ${controller}`);
  } catch (error) {
    console.error(`✗ Error with ${controller}: ${error.message}`);
  }
});

console.log('\nDone! All column names corrected.');
