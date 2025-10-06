import express from 'express';
import studentRoutes from './routes/newStudentRoutes.js';
import cors from 'cors';

const app = express();
app.use(cors({
    origin: '*', // frontend React
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

app.use('/api', studentRoutes);

export default app;