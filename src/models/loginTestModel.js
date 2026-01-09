import supabase from '../config/supabase.js';

export const getLoginUser = async (id, namaPanggilan) => {
  const { data, error } = await supabase
    .from('calon_siswa')
    .select('*')
    .ilike('id', `${id}`) // case-insensitive untuk string id
    .ilike('nama_panggilan', namaPanggilan);

  if (error) throw error;

  return data[0]; // hanya 1 user
};

// Ambil seluruh data calon_siswa berdasarkan id
export const getCalonSiswaById = async (id) => {
  const { data, error } = await supabase
    .from('calon_siswa')
    .select('*')
    .eq('id', id);

  if (error) throw error;

  return data[0]; // asumsi id unik
};