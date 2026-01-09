import express from 'express'
import { fetchTesTahtaBySummary, updateTahsinTahfidz  } from '../controllers/testTahta.controller.js'

const tahtaRouter = express.Router()

tahtaRouter.get('/tahta', fetchTesTahtaBySummary)
tahtaRouter.patch('/tahta/:id', updateTahsinTahfidz)
export default tahtaRouter