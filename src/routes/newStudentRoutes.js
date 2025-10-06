import express from 'express';
import multer from 'multer';
import { addStudent, fetchStudentsBySummary, getRegisterById, togglePayment } from '../controllers/newStudentController.js';

const studentRoutes = express.Router();
const storage = multer.memoryStorage()
const upload = multer({storage}) // Folder sementara untuk upload

studentRoutes.post('/newStudents', upload.fields([
    {name: 'foto', maxCount: 1},
    {name: 'bukti_pembayaran', maxCount: 1}
]), addStudent);
studentRoutes.get('/getNewStudents', fetchStudentsBySummary);
studentRoutes.get('/getNewStudents/:id', getRegisterById)
studentRoutes.patch('/:id/togglePayment', togglePayment)

export default studentRoutes;