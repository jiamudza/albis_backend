import express from 'express'
import { addAbsen, getAbsenSummaryByIdController, getAbsenSummaryListController } from '../controllers/absensi.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const absenRoutes = express.Router()

absenRoutes.post('/absensi', addAbsen.absen)
absenRoutes.get('/absensi', authenticateToken, getAbsenSummaryListController)
absenRoutes.get('/absensi/:id', authenticateToken, getAbsenSummaryByIdController)

export default absenRoutes
