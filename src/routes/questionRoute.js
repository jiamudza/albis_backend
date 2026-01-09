import express from 'express'
import multer from 'multer'
import { createQuestion } from '../controllers/questionController.js'
const storage = multer.memoryStorage()
const upload = multer({storage})

const questionRouter = express.Router()

questionRouter.post(
  '/questions',
  upload.single('image'),
  createQuestion
)

export default questionRouter
