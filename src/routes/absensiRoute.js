import express from 'express'
import { addAbsen, getAbsenSummaryByIdController, getAbsenSummaryListController } from '../controllers/absensi.js'

const absenRoutes = express.Router()

absenRoutes.post('/absensi', addAbsen.absen)
absenRoutes.get('/absensi', getAbsenSummaryListController)
absenRoutes.get('/absensi/:id', getAbsenSummaryByIdController)

export default absenRoutes
