"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const assessment_controller_1 = require("../controllers/assessment.controller");
const router = (0, express_1.Router)();
// Assessment CRUD
router.get('/', auth_1.requireTeacherOrAdmin, assessment_controller_1.getAssessments);
router.get('/types', auth_1.requireTeacherOrAdmin, assessment_controller_1.getAssessmentTypes);
router.get('/:assessmentId', auth_1.requireTeacherOrAdmin, assessment_controller_1.getAssessment);
router.post('/', auth_1.requireTeacherOrAdmin, assessment_controller_1.createAssessment);
router.put('/:assessmentId', auth_1.requireTeacherOrAdmin, assessment_controller_1.updateAssessment);
router.delete('/:assessmentId', auth_1.requireTeacherOrAdmin, assessment_controller_1.deleteAssessment);
exports.default = router;
//# sourceMappingURL=assessment.routes.js.map