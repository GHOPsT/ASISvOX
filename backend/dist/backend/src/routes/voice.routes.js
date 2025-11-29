"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/process-attendance', auth_1.requireTeacherOrAdmin, (req, res) => res.json({ message: 'Process voice attendance' }));
router.post('/process-grading', auth_1.requireTeacherOrAdmin, (req, res) => res.json({ message: 'Process voice grading' }));
router.get('/commands', auth_1.requireTeacherOrAdmin, (req, res) => res.json({ message: 'Get voice commands' }));
router.put('/config', auth_1.requireTeacherOrAdmin, (req, res) => res.json({ message: 'Update voice config' }));
exports.default = router;
//# sourceMappingURL=voice.routes.js.map