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
