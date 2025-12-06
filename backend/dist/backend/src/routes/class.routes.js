"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const class_controller_1 = require("../controllers/class.controller");
const router = (0, express_1.Router)();
// Listar clases (con filtros según rol)
router.get('/', auth_1.requireTeacherOrAdmin, class_controller_1.getClasses);
// Obtener clase por ID
router.get('/:id', auth_1.requireTeacherOrAdmin, class_controller_1.getClassById);
// Crear clase (⭐ auto-asignada para teachers)
router.post('/', auth_1.requireTeacherOrAdmin, class_controller_1.createClass);
// Actualizar clase
router.put('/:id', auth_1.requireTeacherOrAdmin, class_controller_1.updateClass);
// Eliminar clase
router.delete('/:id', auth_1.requireTeacherOrAdmin, class_controller_1.deleteClass);
// Obtener estudiantes de una clase
router.get('/:id/students', auth_1.requireTeacherOrAdmin, class_controller_1.getClassStudents);
// Agregar estudiantes a una clase
router.post('/:classId/students', auth_1.requireTeacherOrAdmin, class_controller_1.addStudentsToClass);
// Obtener clases de un docente específico (el teacher puede ver sus propias clases)
router.get('/teacher/:teacherId', auth_1.requireTeacherOrAdmin, class_controller_1.getTeacherClasses);
// ===============================
// RUTAS DE HORARIOS
// ===============================
// Crear horarios para una clase
router.post('/:classId/schedules', auth_1.requireTeacherOrAdmin, class_controller_1.createSchedules);
// Obtener horarios de una clase
router.get('/:classId/schedules', auth_1.requireTeacherOrAdmin, class_controller_1.getSchedules);
// Actualizar un horario específico
router.put('/:classId/schedules/:scheduleId', auth_1.requireTeacherOrAdmin, class_controller_1.updateSchedule);
// Eliminar un horario específico
router.delete('/:classId/schedules/:scheduleId', auth_1.requireTeacherOrAdmin, class_controller_1.deleteSchedule);
exports.default = router;
//# sourceMappingURL=class.routes.js.map