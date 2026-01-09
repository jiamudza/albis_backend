import supabase from '../config/supabase.js'

export const QuestionModel = {
  async create(payload) {
    const { data, error } = await supabase
      .from('questions')
      .insert([payload])
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export const ExamModel = {
  table: 'spmb_tes_akademik',

  /**
   * Simpan data submission (gabungan answers + userData)
   * @param {Object} payload
   * @returns data yang baru disimpan
   */
  async create(payload) {
    const { data, error } = await supabase
      .from(this.table)
      .insert([payload])
      .select()
      .single(); // ambil 1 record yang baru saja disimpan

    if (error) throw error;
    return data;
  },

  async updateById(id_calon_siswa, payload) {
    const { data, error } = await supabase
      .from(this.table)
      .update([payload])
      .eq('id_calon_siswa', id_calon_siswa) // JSONB field
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

