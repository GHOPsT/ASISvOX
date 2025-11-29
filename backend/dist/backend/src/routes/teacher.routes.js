"use strict";
// ===============================
// RUTAS DE PROFESORES
// ===============================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teacher_controller_1 = require("../controllers/teacher.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/teachers
router.get('/', auth_1.requireTeacherOrAdmin, teacher_controller_1.getTeachers);
// GET /api/teachers/:id
router.get('/:id', auth_1.requireTeacherOrAdmin, teacher_controller_1.getTeacherById);
// GET /api/teachers/:id/schedule
router.get('/:id/schedule', auth_1.requireTeacherOrAdmin, teacher_controller_1.getTeacherSchedule);
// GET /api/teachers/:id/classes
router.get('/:id/classes', auth_1.requireTeacherOrAdmin, teacher_controller_1.getTeacherClasses);
// GET /api/teachers/:id/students
router.get('/:id/students', auth_1.requireTeacherOrAdmin, teacher_controller_1.getTeacherStudents);
// PUT /api/teachers/:id/schedule
router.put('/:id/schedule', auth_1.requireTeacherOrAdmin, teacher_controller_1.updateTeacherSchedule);
exports.default = router;
//# sourceMappingURL=teacher.routes.js.map