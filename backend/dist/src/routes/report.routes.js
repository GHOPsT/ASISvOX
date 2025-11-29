"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const report_controller_1 = require("../controllers/report.controller");
const router = (0, express_1.Router)();
// Reports CRUD
router.get('/', auth_1.requireTeacherOrAdmin, report_controller_1.getReports);
router.get('/:reportId', auth_1.requireTeacherOrAdmin, report_controller_1.getReport);
router.post('/', auth_1.requireTeacherOrAdmin, report_controller_1.createReport);
router.put('/:reportId', auth_1.requireTeacherOrAdmin, report_controller_1.updateReport);
router.delete('/:reportId', auth_1.requireTeacherOrAdmin, report_controller_1.deleteReport);
exports.default = router;
//# sourceMappingURL=report.routes.js.map