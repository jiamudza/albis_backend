import { inputAbsen, getAbsenSummaryListModel } from '../models/absensi.js'

export const addAbsen = {
  async absen(req, res) {
    try {
      const { user_id, status } = req.body
      if (!user_id) return res.status(400).json({ error: 'user_id wajib diisi' })

      // ambil tanggal & jam saat ini
      const now = new Date()
      const tanggal = now.toISOString().split('T')[0] // format YYYY-MM-DD
      const jam = now.toTimeString().split(' ')[0] // format HH:MM:SS

      // cek apakah user sudah absen hari ini
      const existing = await inputAbsen.getAbsenByUserAndDate(user_id, tanggal)

      let result
      if (existing) {
        // update absen yang sudah ada
        result = await inputAbsen.updateAbsen(existing.id, jam, status || 'hadir')
      } else {
        // insert absen baru
        result = await inputAbsen.insertAbsen(user_id, tanggal, jam, status || 'hadir')
      }

      return res.status(200).json({
        message: existing ? 'Absen diperbarui' : 'Absen berhasil disimpan',
        data: result
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: error.message })
    }
  }
}



// controllers/absenSummaryController.js
export async function getAbsenSummaryListController(req, res) {
  try {
    const { page, limit, search, startDate, endDate } = req.query;

    const result = await getAbsenSummaryListModel({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search: search || "",
      startDate: startDate || "",
      endDate: endDate || ""
    });

    if (result.error)
      return res.status(400).json({ error: result.error.message });

    return res.status(200).json({
      success: true,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      total: result.total,
      data: result.data
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

