import express from 'express'
import { addAbsen, getAbsenSummaryListController } from '../controllers/absensi.js'

const absenRoutes = express.Router()

absenRoutes.post('/absensi', addAbsen.absen)
absenRoutes.get('/absensi', getAbsenSummaryListController)

export default absenRoutes
