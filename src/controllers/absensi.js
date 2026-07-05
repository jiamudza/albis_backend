import { inputAbsen, getAbsenSummaryListModel, getAbsenSummaryByIdModel } from '../models/absensi.js'

export const addAbsen = {
  async absen(req, res) {
    try {
      const { user_id, status } = req.body;

      if (!user_id) {
        return res.status(400).json({
          error: "user_id wajib diisi"
        });
      }

      const now = new Date();
      const tanggal = now
        .toISOString()
        .split("T")[0];

      const jam = now
        .toTimeString()
        .split(" ")[0];

      const existing =
        await inputAbsen.getAbsenByUserAndDate(
          user_id,
          tanggal
        );

      let result;

      if (existing) {
        result = await inputAbsen.updateAbsen(
          existing.id,
          jam,
          status || "hadir"
        );
      } else {
        result =
          await inputAbsen.insertAbsen(
            user_id,
            tanggal,
            jam,
            status || "hadir"
          );
      }

      return res.status(200).json({
        success: true,
        message: existing
          ? "Absen diperbarui"
          : "Absen berhasil disimpan",
        data: result
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};


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


    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error.message
      });
    }

    return res.status(200).json({
      success: true,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      total: result.total,
      data: result.data
    });
  } catch (err) {

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

export async function getAbsenSummaryByIdController(req, res) {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const result = await getAbsenSummaryByIdModel({
      id,
      startDate,
      endDate
    });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error.message
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}