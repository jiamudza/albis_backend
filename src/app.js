import express from 'express';
import studentRoutes from './routes/newStudentRoutes.js';
import userRoute from './routes/userRoute.js'
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    "https://smpitalbanna.sch.id",  // production frontend
    "https://albis.netlify.app",    // Netlify preview/staging       // optional: untuk pengujian lokal (Vite React)
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
}));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
app.set("trust proxy", 1); // untuk Vercel HTTPS reverse proxy

app.use('/api', studentRoutes);
app.use('/api', userRoute);

export default app;