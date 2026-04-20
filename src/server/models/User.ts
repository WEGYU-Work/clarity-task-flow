import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export class UserModel {
  static async create(email: string, passwordPlain: string) {
    const password_hash = await bcrypt.hash(passwordPlain, 10);
    
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password_hash }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('User already exists');
      }
      throw error;
    }
    return data as User;
  }

  static async findByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data as User | null;
  }
}