"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireTeacherOrAdmin, (req, res) => res.json({ message: 'Get students' }));
router.get('/:id', auth_1.requireTeacherOrAdmin, (req, res) => res.json({ message: `Get student ${req.params.id}` }));
router.post('/', auth_1.requireTeacherOrAdmin, (req, res) => res.json({ message: 'Create student' }));
router.put('/:id', auth_1.requireTeacherOrAdmin, (req, res) => res.json({ message: `Update student ${req.params.id}` }));
router.delete('/:id', auth_1.requireTeacherOrAdmin, (req, res) => res.json({ message: `Delete student ${req.params.id}` }));
exports.default = router;
//# sourceMappingURL=student.routes.js.map