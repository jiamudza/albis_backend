import express from 'express';
import studentRoutes from './routes/newStudentRoutes.js';
import userRoute from './routes/userRoute.js'
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["https://smpitalbanna.sch.id", "https://albis.netlify.app", "http://localhost:3000"], // frontend React
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true
}));

app.use('/api', studentRoutes);
app.use('/api', userRoute);

export default app;