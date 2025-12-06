"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const student_controller_1 = require("../controllers/student.controller");
const router = (0, express_1.Router)();
// Obtener todos los estudiantes
router.get('/', auth_1.requireTeacherOrAdmin, student_controller_1.getStudents);
// Obtener estudiantes de una clase específica
router.get('/class/:classId', auth_1.requireTeacherOrAdmin, student_controller_1.getStudentsByClassId);
// Crear uno o varios estudiantes
router.post('/', auth_1.requireTeacherOrAdmin, student_controller_1.createStudents);
// Obtener estudiante por ID
router.get('/:id', auth_1.requireTeacherOrAdmin, student_controller_1.getStudentById);
// Actualizar estudiante
router.put('/:id', auth_1.requireTeacherOrAdmin, student_controller_1.updateStudent);
exports.default = router;
//# sourceMappingURL=student.routes.js.map