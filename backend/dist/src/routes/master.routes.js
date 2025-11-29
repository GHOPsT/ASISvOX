"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const master_controller_1 = require("../controllers/master.controller");
const router = (0, express_1.Router)();
// Obtener asignaturas
router.get('/subjects', auth_1.requireTeacherOrAdmin, master_controller_1.getSubjects);
// Obtener secciones
router.get('/sections', auth_1.requireTeacherOrAdmin, master_controller_1.getSections);
// Obtener años académicos
router.get('/academic-years', auth_1.requireTeacherOrAdmin, master_controller_1.getAcademicYears);
// Obtener grados
router.get('/grades', auth_1.requireTeacherOrAdmin, master_controller_1.getGrades);
exports.default = router;
//# sourceMappingURL=master.routes.js.map