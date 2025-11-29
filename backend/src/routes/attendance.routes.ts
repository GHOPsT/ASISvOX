import { Router } from 'express';
import { requireTeacherOrAdmin } from '../middleware/auth';
import {
  getAttendanceSessions,
  getAttendanceSession,
  createAttendanceSession,
  getAttendanceRecords,
  recordAttendance,
  updateAttendanceRecord,
} from '../controllers/attendance.controller';

const router = Router();

// Attendance sessions
router.get('/sessions', requireTeacherOrAdmin, getAttendanceSessions);
router.get('/sessions/:sessionId', requireTeacherOrAdmin, getAttendanceSession);
router.post('/sessions', requireTeacherOrAdmin, createAttendanceSession);

// Attendance records
router.get('/records', requireTeacherOrAdmin, getAttendanceRecords);
router.post('/records', requireTeacherOrAdmin, recordAttendance);
router.put('/records/:recordId', requireTeacherOrAdmin, updateAttendanceRecord);

export default router;