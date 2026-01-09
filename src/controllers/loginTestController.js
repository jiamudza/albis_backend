import { getLoginUser, getCalonSiswaById } from '../models/loginTestModel.js';

export const login = async (req, res) => {
  try {
    const { id, nama_panggilan } = req.body;

    if (!id || !nama_panggilan) {
      return res.status(400).json({ message: 'ID dan nama_panggilan wajib diisi' });
    }

    // Cek login
    const user = await getLoginUser(id, nama_panggilan.toLowerCase());

    if (!user) {
      return res.status(401).json({ message: 'Login gagal: User tidak ditemukan' });
    }

    // Ambil data calon_siswa berdasarkan id login
    const calonSiswa = await getCalonSiswaById(user.id);

    return res.status(200).json({
      message: 'Login berhasil',
      data: calonSiswa,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
