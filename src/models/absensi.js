import supabase from '../config/supabase.js';

export const inputAbsen = {
  async getAbsenByUserAndDate(userId, tanggal) {
    const { data, error } = await supabase
      .from("absensi")
      .select("*")
      .eq("user_id", userId)
      .eq("tanggal_absen", tanggal)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async insertAbsen(userId, tanggal, jam, status = "hadir") {

    const day = new Date(tanggal).getDay();

    if (day === 0) {
      throw new Error("Hari Minggu tidak dapat melakukan absensi.");
    }

    const { data, error } = await supabase
      .from("absensi")
      .insert({
        user_id: userId,
        tanggal_absen: tanggal,
        jam_absen: jam,
        status,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateAbsen(id, jam, status) {
    const { data: current } = await supabase
      .from("absensi")
      .select("tanggal_absen")
      .eq("id", id)
      .single();

    if (new Date(current.tanggal_absen).getDay() === 0) {
      throw new Error("Absensi hari Minggu tidak dapat diubah.");
    }

    if (error) throw error;
    return data;
  }
};

function formatYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateRange(startDate, endDate) {
  const today = new Date();

  const start = startDate
    ? new Date(startDate)
    : new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const end = endDate
    ? new Date(endDate)
    : new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return {
    start: formatYMD(start),
    end: formatYMD(end)
  };
}

function getDateRange(startDate, endDate) {
  const dates = [];

  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    // Lewati hari Minggu
    if (current.getDay() !== 0) {
      dates.push(formatYMD(current));
    }

    current.setDate(current.getDate() + 1);
  }

  return dates;
}



function getMonthRange(month, year) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;

  const lastDay = new Date(year, month, 0).getDate();

  const end = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  return { start, end };
}

export async function getAbsenSummaryByIdModel({
  id,
  startDate = "",
  endDate = ""
}) {
  const { start, end } = parseDateRange(
    startDate,
    endDate
  );

  const { data: user, error: userError } =
    await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

  if (userError) {
    return {
      error: userError,
      data: null
    };
  }

  const {
    data: absensi,
    error: absenError
  } = await supabase
    .from("absensi")
    .select("*")
    .eq("user_id", id)
    .gte("tanggal_absen", start)
    .lte("tanggal_absen", end)
    .order("tanggal_absen", {
      ascending: true
    });

  if (absenError) {
    return {
      error: absenError,
      data: null
    };
  }

  const allDates = getDateRange(start, end);

  const absenMap = {};

  absensi.forEach(item => {
    absenMap[item.tanggal_absen] = item;
  });

  let hadir = 0;
  let izin = 0;
  let sakit = 0;
  let tidak_hadir = 0;

  const detail_absensi = [];

  allDates.forEach(tanggal => {
    const absen = absenMap[tanggal];

    if (absen) {
      switch (
      absen.status?.toLowerCase()
      ) {
        case "hadir":
          hadir++;
          break;

        case "izin":
          izin++;
          break;

        case "sakit":
          sakit++;
          break;

        default:
          tidak_hadir++;
      }

      detail_absensi.push({
        id: absen.id,
        tanggal: absen.tanggal_absen,
        jam_absen: absen.jam_absen,
        status: absen.status,
        created_at: absen.created_at
      });
    } else {
      tidak_hadir++;

      detail_absensi.push({
        tanggal,
        jam_absen: null,
        status: "tidak hadir",
        created_at: null
      });
    }
  });

  const totalHari = allDates.length;

  const tidakHadir =
    totalHari - hadir - izin - sakit;

  console.log({
    nama: user.nama_lengkap,
    userId: user.id,
    // userAbsensi,
    hadir,
    izin,
    sakit,
    tidak_hadir,
  });

  return {
    error: null,
    data: {
      id: user.id_role,
      username: user.username,
      nama_lengkap: user.nama_lengkap,
      email: user.email,

      jumlah_hadir: hadir,
      jumlah_izin: izin,
      jumlah_sakit: sakit,
      jumlah_tidak_hadir: tidakHadir,

      total_hari: totalHari,

      persentase_kehadiran: Number(
        ((hadir / totalHari) * 100).toFixed(2)
      ),

      detail_absensi
    }
  };
}
export async function getAbsenSummaryListModel({
  page = 1,
  limit = 10,
  search = "",
  startDate = "",
  endDate = ""
}) {
  const offset = (page - 1) * limit;

  // 1. QUERY USERS (search dulu, baru pagination)
  let userQuery = supabase
    .from("users")
    .select("*", { count: "exact" });

  if (search) {
    userQuery = userQuery.ilike(
      "nama_lengkap",
      `%${search}%`
    );
  }

  userQuery = userQuery
    .order("nama_lengkap", { ascending: true })
    .range(offset, offset + limit - 1);

  const { data: users, count: totalUsers, error: userError } =
    await userQuery;

  if (userError) {
    return { error: userError, data: null };
  }

  if (!users || users.length === 0) {
    return {
      data: [],
      total: 0,
      error: null
    };
  }

  // 2. DATE RANGE
  const { start, end } = parseDateRange(startDate, endDate);
  const allDates = getDateRange(start, end);

  // 3. FIX: gunakan userIds (INI BUG UTAMA YANG KAMU PUNYA)
  const userIds = users.map((user) => user.id);

  const { data: allAbsensi, error: absenError } = await supabase
    .from("absensi")
    .select("*")
    .in("user_id", userIds)
    .gte("tanggal_absen", start)
    .lte("tanggal_absen", end);

  // console.log("User IDs:", userIds);
  // console.log("Start:", start);
  // console.log("End:", end);
  // console.log("Absensi:", allAbsensi);

  if (absenError) {
    return { error: absenError, data: null };
  }

  // 4. GROUPING ABSENSI PER USER
  const absensiByUser = {};

  (allAbsensi || []).forEach((absen) => {
    if (!absensiByUser[absen.user_id]) {
      absensiByUser[absen.user_id] = [];
    }
    absensiByUser[absen.user_id].push(absen);
  });

  // 5. BUILD RESULT
  const results = users.map((user) => {
    const userAbsensi = (allAbsensi || []).filter(
      (item) => item.user_id === user.id
    );

    // console.log("========================================");
    // console.log("NAMA USER :", user.nama_lengkap);
    // console.log("USER ID   :", user.id);
    // console.log("ABSENSI USER :", userAbsensi);

    let hadir = 0;
    let izin = 0;
    let sakit = 0;

    userAbsensi.forEach((item) => {
      // console.log("DATA ABSEN :", item);

      switch ((item.status || "").trim().toLowerCase()) {
        case "hadir":
          hadir++;
          break;

        case "izin":
          izin++;
          break;

        case "sakit":
          sakit++;
          break;
      }
    });

    // console.log("TOTAL HADIR :", hadir);

    const detail_absensi = allDates.map((tanggal) => {
      const absen = userAbsensi.find(
        (item) => item.tanggal_absen === tanggal
      );

      // console.log(
      //   "Tanggal:",
      //   tanggal,
      //   "| Ketemu:",
      //   absen ? "YA" : "TIDAK"
      // );

      if (absen) {
        return {
          tanggal,
          status: absen.status,
          jam_absen: absen.jam_absen,
          created_at: absen.created_at,
        };
      }

      return {
        tanggal,
        status: "tidak hadir",
        jam_absen: null,
        created_at: null,
      };
    });

    const totalHari = allDates.length;

    const tidak_hadir =
      totalHari - hadir - izin - sakit;

    console.log({
      hasil: {
        hadir,
        izin,
        sakit,
        tidak_hadir,
        totalHari,
      },
    });

    return {
      id: user.id,
      username: user.username,
      nama_lengkap: user.nama_lengkap,
      email: user.email,

      jumlah_hadir: hadir,
      jumlah_izin: izin,
      jumlah_sakit: sakit,
      jumlah_tidak_hadir: tidak_hadir,

      total_hari: totalHari,

      persentase_kehadiran: Number(
        ((hadir / (totalHari || 1)) * 100).toFixed(2)
      ),

      detail_absensi,
    };
  });

  return {
    data: results,
    total: totalUsers,
    error: null
  };
}