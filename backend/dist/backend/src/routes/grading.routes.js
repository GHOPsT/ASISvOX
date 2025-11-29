"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const grading_controller_1 = require("../controllers/grading.controller");
const router = (0, express_1.Router)();
// Grades CRUD
router.get('/', auth_1.requireTeacherOrAdmin, grading_controller_1.getGrades);
router.get('/statistics', auth_1.requireTeacherOrAdmin, grading_controller_1.getGradeStatistics);
router.get('/:gradeId', auth_1.requireTeacherOrAdmin, grading_controller_1.getGrade);
router.post('/', auth_1.requireTeacherOrAdmin, grading_controller_1.recordGrade);
router.post('/bulk', auth_1.requireTeacherOrAdmin, grading_controller_1.recordGradesBulk);
router.put('/:gradeId', auth_1.requireTeacherOrAdmin, grading_controller_1.updateGrade);
router.delete('/:gradeId', auth_1.requireTeacherOrAdmin, grading_controller_1.deleteGrade);
exports.default = router;
//# sourceMappingURL=grading.routes.js.map