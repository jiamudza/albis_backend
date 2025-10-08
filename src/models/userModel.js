import supabase from "../config/supabase.js";

export const insertUser = async (userData) => {
  const { data, error } = await supabase
    .from("users")
    .insert([userData])
    .select();
  if (error) throw error;
  return data[0];
};

export const findUserByUsername = async (username) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();
  if (error) return null;
  return data;
};

export const getUserProfile = async (id) => {
  const { data, error } = await supabase
    .from("users")
    .select(`
      *,
      guru: users_id_role_fkey (
        id_guru,
        nip,
        nama_guru,
        email,
        no_hp,
        jenis_kelamin,
        alamat,
        mapel,
        status_aktif,
        tanggal_lahir
      )
    `)
    .ilike("id", id)
    .single();

  if (error) throw error;
  return data;
};
