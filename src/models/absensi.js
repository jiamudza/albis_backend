import supabase from '../config/supabase.js';

export const inputAbsen = {
  async getAbsenByUserAndDate(user_id, tanggal) {
    const { data, error } = await supabase
      .from('absensi')
      .select('*')
      .eq('user_id', user_id)
      .eq('tanggal_absen', tanggal)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async insertAbsen(user_id, tanggal, jam, status) {
    const { data, error } = await supabase
      .from('absensi')
      .insert([
        {
          user_id,
          tanggal_absen: tanggal,
          jam_absen: jam,
          status,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateAbsen(id, jam, status) {
    const { data, error } = await supabase
      .from('absensi')
      .update({
        jam_absen: jam,
        status,
        created_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

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

export async function getAbsenSummaryListModel({
  page = 1,
  limit = 10,
  search = "",
  startDate = "",
  endDate = ""
}) {
  const offset = (page - 1) * limit;

  // Ambil user list dahulu (ini yang dipagination)
  let userQuery = supabase
    .from("users")
    .select("*", { count: "exact" })
    .order("nama_lengkap", { ascending: true })
    .range(offset, offset + limit - 1);

  if (search) {
    userQuery = userQuery.ilike("nama_lengkap", `%${search}%`);
  }

  const { data: users, count: totalUsers, error: userError } = await userQuery;

  if (userError) return { error: userError, data: null };

  const { start, end } = parseDateRange(startDate, endDate);

  // Loop setiap user dan hitung jumlah absennya
  const results = [];

  for (const user of users) {
    const { count: total_absen, error: absenError } = await supabase
      .from("absensi")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id_role)
      .gte("tanggal_absen", start)
      .lte("tanggal_absen", end);

    if (absenError) return { error: absenError, data: null };
    console.log(start)
    results.push({
      user,
      total_absen
    });
  }

  return {
    data: results,
    total: totalUsers,
    error: null
  };
}