import supabase from '../config/supabase.js';

export async function createNewStudents(students) {

    const { data, error } = await supabase
        .from('calon_siswa')
        .insert([students])
        .select();

    if (error) throw error;
    return data[0];
}


export const getNewStudents = async({
    page = 1,
    limit=10,
    sort='asc',
    search='',
    gender,
    program,
    startDate,
    endDate
}) => {
    let query = supabase
        .from('calon_siswa')
        .select('*', { count: 'exact' });

    // Filter berdasarkan pencarian nama
    if (search) {
        query = query.ilike('nama_lengkap', `%${search}%`);
    }

    // Filter berdasarkan jenis kelamin
    if (gender) {
        query = query.ilike('jenis_kelamin', gender);
    }

    // Filter berdasarkan pilihan program
    if (program) {
        query = query.ilike('pilihan_program', program);
    }

    // Filter berdasarkan rentang tanggal pendaftaran
    if (startDate && endDate) {
        query = query.gte('created_at', startDate).lte('created_at', endDate);
    } else if (startDate) {
        query = query.gte('created_at', startDate);
    } else if (endDate) {
        query = query.lte('created_at', endDate);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.order('nama_lengkap', { ascending: sort === 'asc' }).range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;
    return { 
        data,
        total: count, 
        page, 
        limit, 
        totalPages: count ? Math.ceil(count / limit) : 0,
        hasPreviousPage: page > 1,
        hasNextPage: page < Math.ceil(count / limit) 
    };
}

export const getStudentPerProgram = async() => {
    const { data, error } = await supabase.rpc('summary_calon_siswa')

    if (error) throw error;
    return data;
}
