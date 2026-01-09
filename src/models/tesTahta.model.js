import supabase from '../config/supabase.js';

/* =============================
   GET DATA TES TAHTA (PAGING)
============================= */
export const getTesTahta = async ({
  page = 1,
  limit = 100,
  sort = 'desc',
  search = '',
  penguji,
  jalur,
  startDate,
  endDate,
}) => {
  let query = supabase
    .from('tes_tahta')
    .select('*', { count: 'exact' });

  // 🔍 search nama
  if (search) {
    query = query.ilike('nama_siswa', `%${search}%`);
  }

  // 🎓 filter jalur
  if (jalur) {
    query = query.eq('jalur_pendaftaran', jalur);
  }

  // 👳 filter penguji
  if (penguji) {
    query = query.eq('penguji', penguji);
  }

//   // 📅 filter tanggal
//   if (startDate && endDate) {
//     query = query.gte('created_at', startDate).lte('created_at', endDate);
//   } else if (startDate) {
//     query = query.gte('created_at', startDate);
//   } else if (endDate) {
//     query = query.lte('created_at', endDate);
//   }

  // 📄 pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query
    .order('id', { ascending: sort === 'asc' })
    .range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    data,
    total: count,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
    hasPreviousPage: page > 1,
    hasNextPage: page < Math.ceil(count / limit),
  };
};

export const getTesTahtaSummary = async () => {
  const { data, error } = await supabase
    .from('tes_tahta')
    .select('tajwid_average, hafalan, penguji');

  if (error) throw error;

  const summary = [];

  /* =============================
     SUMMARY TAJWID
  ============================ */
  const tajwidMap = {
    'Sangat Baik': 0,
    'Baik': 0,
    'Cukup': 0,
    'Perlu Bimbingan': 0,
  };

  data.forEach(row => {
    if (row.rata_rata_tajwid >= 88) tajwidMap['Sangat Baik']++;
    else if (row.rata_rata_tajwid > 80) tajwidMap['Baik']++;
    else if (row.rata_rata_tajwid > 70) tajwidMap['Cukup']++;
    else tajwidMap['Perlu Bimbingan']++;
  });

  Object.entries(tajwidMap).forEach(([key, val]) => {
    summary.push({
      kategori: 'Tajwid',
      sub_kategori: key,
      jumlah: val,
    });
  });

  /* =============================
     SUMMARY HAFALAN
  ============================ */
  const hafalanMap = {};
  data.forEach(row => {
    hafalanMap[row.hafalan] = (hafalanMap[row.hafalan] || 0) + 1;
  });

  Object.entries(hafalanMap).forEach(([key, val]) => {
    summary.push({
      kategori: 'Hafalan',
      sub_kategori: key,
      jumlah: val,
    });
  });

  /* =============================
     SUMMARY PENGUJI
  ============================ */
  const pengujiMap = {};
  data.forEach(row => {
    pengujiMap[row.penguji] = (pengujiMap[row.penguji] || 0) + 1;
  });

  Object.entries(pengujiMap).forEach(([key, val]) => {
    summary.push({
      kategori: 'Penguji',
      sub_kategori: key,
      jumlah: val,
    });
  });

  return summary;
};


export const updateTahsinTahfidzById = async (id, data) => {
  const {
    nama_siswa,
    asal_sekolah,
    jalur_pendaftaran,
    istiadzah,
    basmallah,
    makhrijul_huruf,
    tanwin,
    sukun,
    bacaan_panjang,
    tajwid_average,
    kelancaran,
    hafalan,
    tempat_mengaji,
    penguji,
    catatan,
    hasil_tajwid,
    hasil_kelancaran,
    hasil_hafalan,
    rangkuman
  } = data

  let dataMengaji
  if (tempat_mengaji === "Ada") {
    dataMengaji = true;
  } else {
    dataMengaji = false;
  }

  const { data: updatedData, error } = await supabase
    .from('tes_tahta')
    .update({
      nama_siswa,
      asal_sekolah,
      jalur_pendaftaran,
      istiadzah,
      basmallah,
      makhrijul_huruf,
      tanwin,
      sukun,
      bacaan_panjang,
      tajwid_average,
      kelancaran,
      hafalan,
      tempat_mengaji: dataMengaji,
      penguji,
      catatan,
      hasil_tajwid,
      hasil_kelancaran,
      hasil_hafalan,
      rangkuman
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return updatedData
}

