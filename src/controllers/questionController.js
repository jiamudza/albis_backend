import cloudinary from '../config/cloudinary.js'
import { QuestionModel } from '../models/questionModel.js'

export const createQuestion = async (req, res) => {
  try {
    const {
      date,
      question,
      types,
      options,
      correctAnswer,
      essayAnswer,
      matchInstruction,
      leftItems,
      rightItems,
      matchAnswers,
      isDraft
    } = req.body

    let imageData = null

    // 📸 jika ada file
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'questions',
            resource_type: 'image'
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        ).end(req.file.buffer)
      })

      imageData = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format
      }
    }

    const payload = {
      question_date: date,
      question,
      types: JSON.parse(types),
      image: imageData,
      options: options ? JSON.parse(options) : null,
      correct_answer: correctAnswer,
      essay_answer: essayAnswer,
      match_instruction: matchInstruction,
      left_items: leftItems ? JSON.parse(leftItems) : null,
      right_items: rightItems ? JSON.parse(rightItems) : null,
      match_answers: matchAnswers ? JSON.parse(matchAnswers) : [],
      is_draft: isDraft === 'true'
    }

    const result = await QuestionModel.create(payload)

    return res.status(201).json({
      success: true,
      data: result
    })

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    })
  }
}
