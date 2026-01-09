import {
  getTesTahta,
  getTesTahtaSummary,
  updateTahsinTahfidzById
} from '../models/tesTahta.model.js';

export const fetchTesTahtaBySummary = async (req, res) => {
  try {
    const {
      page,
      limit,
      sort,
      search,
      penguji,
      jalur,
      startDate,
      endDate,
    } = req.query;

    const sortDirection =
      sort && ['asc', 'desc'].includes(sort.toLowerCase())
        ? sort.toLowerCase()
        : 'desc';

    const result = await getTesTahta({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      sort: sortDirection,
      search: search || '',
      penguji: penguji || null,
      jalur: jalur || null,
      startDate: startDate || null,
      endDate: endDate || null,
    });

    const summary = await getTesTahtaSummary();

    res.json({
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasPrevPage: result.hasPreviousPage,
      hasNextPage: result.hasNextPage,
      summary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data Tes TAHTA',
    });
  }
};



export const updateTahsinTahfidz = async (req, res) => {
  try {
    const { id } = req.params
    const payload = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID tidak ditemukan',
      })
    }

    const updated = await updateTahsinTahfidzById(id, payload)

    return res.json({
      success: true,
      message: 'Data tahsin & tahfidz berhasil diperbarui',
      data: updated,
    })
  } catch (error) {
    console.error('PATCH TAHTA ERROR:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data',
    })
  }
}

