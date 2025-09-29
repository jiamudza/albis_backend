import express from 'express';
import multer from 'multer';
import { addStudent, fetchStudentsBySummary } from '../controllers/newStudentController.js';

const studentRoutes = express.Router();
const upload = multer({ dest: 'uploads/' }); // Folder sementara untuk upload

studentRoutes.post('/newStudents', upload.single('foto'), addStudent);
studentRoutes.get('/getNewStudents', fetchStudentsBySummary);

export default studentRoutes;