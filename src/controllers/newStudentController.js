import cloudinary from '../config/cloudinary.js';
import { countByProgram, createNewStudents, getNewStudents, getStudentPerProgram, getNewStudentById, togglePaymentStatus } from '../models/newStudentModel.js';
import bcrypt from 'bcryptjs';
import { uploadToCloudinary } from '../config/cloudinary.js';

export async function addStudent(req, res) {
    try {
        let pasFotoUrl = null;
        let buktiBayarUrl = null;
        let pasFotoThumb = null;
        let buktiBayarThumb = null;

        const student = req.body;
        const { nama_panggilan, pilihan_program, NISN } = student;

        // ambil urutan
        const { count, error: countError } = await countByProgram(pilihan_program);
        if (countError) throw countError;
        const urutan = (count || 0) + 1;

        const customId = `${nama_panggilan}-${NISN}-${pilihan_program}-${urutan}`;
        const plainPassword = `${nama_panggilan.toUpperCase()}-${pilihan_program.toUpperCase()}-${urutan}`;

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds)
        // Upload pas_foto
        if (req.files?.foto?.[0]) {
            const result = await uploadToCloudinary(
                req.files.foto[0].buffer,
                "siswa-2026-2027"
            );

            pasFotoUrl = result.secure_url;

            // generate derived thumbnail (300x300, crop fill)
            pasFotoThumb = cloudinary.url(result.public_id, {
                width: 300,
                height: 300,
                crop: "fill",
            });
        }


        // Upload bukti_pembayaran
        if (req.files?.bukti_pembayaran?.[0]) {
            const result = await uploadToCloudinary(
                req.files.bukti_pembayaran[0].buffer,
                "bukti_daftar-2026-2027"
            );

            buktiBayarUrl = result.secure_url;
        }

        const studentData = {
            id: customId,
            ...student,
            foto: pasFotoUrl,
            foto_kecil: pasFotoThumb,
            bukti_pembayaran: buktiBayarUrl,
            password: hashedPassword,
            status_pembayaran: "Belum Lunas"
        };

        // simpan ke supabase
        const newStudent = await createNewStudents(studentData);

        res.json({ success: true, data: newStudent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Gagal Menyimpan Data" });
    }
}


export const getRegisterById = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await getNewStudentById(id);

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Student not found" });

    console.log("CONTROLLER:", data);
    return res.json(data);
};

export const fetchStudentsBySummary = async (req, res) => {
    try {
        const {
            page,
            limit,
            sort,
            search,
            gender,
            program,
            hasPrevPage,
            hasNextPage,
            startDate,
            endDate
        } = req.query;

        const result = await getNewStudents({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sort: sort || 'asc',
            search: search || '',
            gender: gender || null,
            program: program || null,
            startDate: startDate || null,
            endDate: endDate || null,
        });

        //summary by program
        const summary = await getStudentPerProgram();

        res.json({
            success: true, data: result.data, total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages, hasPrevPage: result.hasPreviousPage, hasNextPage: result.hasNextPage, summary,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Gagal Mengambil Data" });

    }
}

export const togglePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await togglePaymentStatus(id);

    res.status(200).json({
      message: "Status pembayaran berhasil diubah",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
