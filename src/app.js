import express from 'express';
import studentRoutes from './routes/newStudentRoutes.js';
import userRoute from './routes/userRoute.js'
import absenRoutes from './routes/absensiRoute.js'
import questionRouter from './routes/questionRoute.js';
import tahtaRouter from './routes/tahtaRoute.js';
import loginTestRoute from './routes/loginTestRoute.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    "https://smpitalbanna.sch.id",  // production frontend
    "https://www.smpitalbanna.sch.id",  // production frontend
    "https://albis.netlify.app",
    "http://localhost:3000"    // Netlify preview/staging       // optional: untuk pengujian lokal (Vite React)
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
}));

app.use('/api', studentRoutes);
app.use('/api', userRoute);
app.use('/api', absenRoutes);
app.use('/api', questionRouter);
app.use('/api', tahtaRouter);
app.use('/api', loginTestRoute);

export default app;