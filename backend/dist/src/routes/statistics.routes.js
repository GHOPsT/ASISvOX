"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const statistics_controller_1 = require("../controllers/statistics.controller");
const router = (0, express_1.Router)();
// Statistics
router.get('/dashboard', auth_1.requireTeacherOrAdmin, statistics_controller_1.getEntityStatistics);
router.get('/class', auth_1.requireTeacherOrAdmin, statistics_controller_1.getClassStatistics);
router.get('/student', auth_1.requireTeacherOrAdmin, statistics_controller_1.getStudentStatistics);
exports.default = router;
//# sourceMappingURL=statistics.routes.js.map