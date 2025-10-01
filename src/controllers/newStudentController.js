import cloudinary from '../config/cloudinary.js';
import { countByProgram, createNewStudents, getNewStudents, getStudentPerProgram, getNewStudentById } from '../models/newStudentModel.js';

export async function addStudent(req, res) {
    try {
        let originalUrl = null;
        let derivedUrl = null;

        const student = req.body;
        const { nama_panggilan, pilihan_program, NISN } = student;

        const {count, error: countError}
        = await
        countByProgram(pilihan_program);

        if(countError) throw countError;

        const urutan = (count || 0) + 1;

        const customId = `${nama_panggilan}-${NISN}-${pilihan_program}-${urutan}`
        const password = `${nama_panggilan.toUpperCase()}-${pilihan_program.toUpperCase()}-${urutan}`

        // upload ke cloudinary
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
            folder: `siswa-2026-2027`,
        });

        originalUrl = result.secure_url;
        derivedUrl = cloudinary.url(result.public_id, {
            width: 300,
            height: 300,
            crop: "fill"
        });
        }

        const studentData = { id: customId, ...student, foto: originalUrl, foto_kecil: derivedUrl, password: password };

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
        