import express from 'express';
import { login } from '../controllers/loginTestController.js';

const loginTestRoute = express.Router();

// POST /login
loginTestRoute.post('/loginTest', login);

export default loginTestRoute;
