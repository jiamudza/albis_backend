import cloudinary from '../config/cloudinary.js'
import { QuestionModel, } from '../models/questionModel.js'
import supabase from '../config/supabase.js'

export const createQuestion = async (req, res) => {
  try {
    const {
      date,
      question,
      wacana,
      types,
      options,
      correctAnswer,
      essayAnswer,
      matchInstruction,
      leftItems,
      rightItems,
      matchAnswers,
      isDraft,
      category
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
      wacana,
      category,
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

import { ExamModel } from '../models/questionModel.js';

export const submitExam = async (req, res) => {
  try {
    const payload = req.body;

    if (!payload || !payload.id_calon_siswa) {
      return res.status(400).json({ message: 'id_calon_siswa wajib diisi' });
    }

    // Cek apakah record sudah ada
    const { data: existing } = await supabase
      .from('spmb_tes_akademik')
      .select('id_calon_siswa')
      .eq('id_calon_siswa', payload.id_calon_siswa)
      .single();

    let result;

    if (existing) {
      // Update existing record
      result = await ExamModel.updateById(payload.id_calon_siswa, payload);
    } else {
      // Insert baru
      result = await ExamModel.create(payload);
    }

    return res.status(200).json({
      message: 'Exam submitted successfully',
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

