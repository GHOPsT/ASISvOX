"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const attendance_controller_1 = require("../controllers/attendance.controller");
const router = (0, express_1.Router)();
// Attendance sessions
router.get('/sessions', auth_1.requireTeacherOrAdmin, attendance_controller_1.getAttendanceSessions);
router.get('/sessions/:sessionId', auth_1.requireTeacherOrAdmin, attendance_controller_1.getAttendanceSession);
router.post('/sessions', auth_1.requireTeacherOrAdmin, attendance_controller_1.createAttendanceSession);
// Attendance records
router.get('/records', auth_1.requireTeacherOrAdmin, attendance_controller_1.getAttendanceRecords);
router.post('/records', auth_1.requireTeacherOrAdmin, attendance_controller_1.recordAttendance);
router.put('/records/:recordId', auth_1.requireTeacherOrAdmin, attendance_controller_1.updateAttendanceRecord);
exports.default = router;
//# sourceMappingURL=attendance.routes.js.map