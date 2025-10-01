import express from 'express';
import multer from 'multer';
import { addStudent, fetchStudentsBySummary, getRegisterById } from '../controllers/newStudentController.js';

const studentRoutes = express.Router();
const upload = multer({ dest: 'uploads/' }); // Folder sementara untuk upload

studentRoutes.post('/newStudents', upload.single('foto'), addStudent);
studentRoutes.get('/getNewStudents', fetchStudentsBySummary);
studentRoutes.get('/getNewStudents/:id', getRegisterById)

export default studentRoutes;