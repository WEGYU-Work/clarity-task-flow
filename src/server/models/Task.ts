import { supabase } from '../config/supabase.js';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  status: 'pending' | 'completed';
  created_at: string;
}

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  userId: string;
}

export class TaskModel {
  static async getAll(params: TaskQueryParams) {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status, 
      sortBy = 'created_at', 
      sortOrder = 'desc',
      userId
    } = params;
    
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('tasks')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Search filter
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    // Status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Sorting
    query = query.order(sortBy as any, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;
    
    return {
      data: data as Task[],
      count,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0
    };
  }

  static async create(title: string, userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title, status: 'pending', user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  }

  static async update(id: string, updates: Partial<Task>, userId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  }

  static async delete(id: string, userId: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }
}