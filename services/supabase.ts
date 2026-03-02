import { createClient } from '@supabase/supabase-js';
import { CareerDatabase } from '../types';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signIn = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof chrome !== 'undefined' && chrome.identity 
        ? chrome.identity.getRedirectURL() 
        : window.location.origin
    }
  });
  if (error) {
    console.error("Error signing in:", error);
    throw error;
  }
  return data;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const saveUserCareerData = async (userId: string, data: CareerDatabase) => {
  // Assuming a table named 'user_profiles' with columns 'id' (uuid) and 'career_data' (jsonb)
  const { error } = await supabase
    .from('user_profiles')
    .upsert({ 
      id: userId, 
      career_data: data, 
      updated_at: new Date().toISOString() 
    });
  
  if (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
};

export const getUserCareerData = async (userId: string): Promise<CareerDatabase | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('career_data')
    .eq('id', userId)
    .single();
    
  if (error) {
    // PGRST116 means no rows returned, which is fine for a new user
    if (error.code !== 'PGRST116') {
      console.error("Error fetching user data:", error);
    }
    return null;
  }
  
  return data?.career_data as CareerDatabase || null;
};
