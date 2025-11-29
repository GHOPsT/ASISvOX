"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const connection_1 = require("../config/connection");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireTeacherOrAdmin, async (req, res) => {
    try {
        const result = await (0, connection_1.query)('SELECT id, first_name, last_name, identification_number FROM students LIMIT 10', []);
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching students', error: error.message });
    }
});
router.get('/:id', auth_1.requireTeacherOrAdmin, (req, res) => res.json({ message: `Get student ${req.params.id}` }));
router.post('/', auth_1.requireTeacherOrAdmin, (req, res) => res.json({ message: 'Create student' }));
router.put('/:id', auth_1.requireTeacherOrAdmin, (req, res) => res.json({ message: `Update student ${req.params.id}` }));
router.delete('/:id', auth_1.requireTeacherOrAdmin, (req, res) => res.json({ message: `Delete student ${req.params.id}` }));
exports.default = router;
//# sourceMappingURL=student.routes.js.map