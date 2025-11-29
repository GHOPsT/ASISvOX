const fs = require('fs');
const path = require('path');

// Mapeo de reemplazos: classId -> class_id, etc.
const replacements = [
  { from: /classId/g, to: 'class_id' },
  { from: /class_id/g, to: 'class_id' }, // Ensure it's normalized
  { from: /sessionId/g, to: 'session_id' },
  { from: /session_id/g, to: 'session_id' },
  { from: /studentId/g, to: 'student_id' },
  { from: /student_id/g, to: 'student_id' },
  { from: /assessmentId/g, to: 'assessment_id' },
  { from: /assessment_id/g, to: 'assessment_id' },
  { from: /assessmentTypeId/g, to: 'assessment_type_id' },
  { from: /assessment_type_id/g, to: 'assessment_type_id' },
  { from: /totalPoints/g, to: 'total_points' },
  { from: /total_points/g, to: 'total_points' },
  { from: /typeId/g, to: 'type_id' },
  { from: /type_id/g, to: 'type_id' },
  { from: /dueDate/g, to: 'due_date' },
  { from: /due_date/g, to: 'due_date' },
  { from: /isActive/g, to: 'is_active' },
  { from: /is_active/g, to: 'is_active' },
  { from: /reportId/g, to: 'id' }, // report URLs use just 'id' in params
  { from: /gradeId/g, to: 'id' },   // same here
  { from: /recordId/g, to: 'id' },  // and here
];

const controllersPath = 'c:\\Users\\GHOPsT\\Desktop\\PPP_Grupo2\\ASISvOX\\backend\\src\\controllers';

// Controllers to process
const controllers = [
  'assessment.controller.ts',
  'grading.controller.ts',
  'report.controller.ts',
  'statistics.controller.ts'
];

controllers.forEach(controller => {
  const filePath = path.join(controllersPath, controller);
  
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Apply all replacements
    replacements.forEach(({ from, to }) => {
      content = content.replace(from, to);
    });
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Fixed: ${controller}`);
  } catch (error) {
    console.error(`✗ Error with ${controller}: ${error.message}`);
  }
});

console.log('\nDone! All parameter names normalized.');
