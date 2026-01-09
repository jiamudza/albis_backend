import express from 'express';
import multer from 'multer';
import { addStudent, fetchStudentsBySummary, getRegisterById, removeNewStudent, togglePayment } from '../controllers/newStudentController.js';
import { authenticateToken, isAdmin, isSPMB } from '../middleware/authMiddleware.js';

const studentRoutes = express.Router();
const storage = multer.memoryStorage()
const upload = multer({storage})

studentRoutes.post('/newStudents', upload.fields([
    {name: 'foto', maxCount: 1},
    {name: 'bukti_pembayaran', maxCount: 1}
]), addStudent);
studentRoutes.get('/getNewStudents',authenticateToken, fetchStudentsBySummary);
studentRoutes.get('/getNewStudents/:id', authenticateToken, isSPMB, getRegisterById)
studentRoutes.patch('/:id/togglePayment', togglePayment)
studentRoutes.delete('/newStudents/:id', authenticateToken, isSPMB, removeNewStudent)

export default studentRoutes;