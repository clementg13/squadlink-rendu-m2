import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { env } from '@/constants/Environment';

// Configuration du client Supabase
const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = env.EXPO_PUBLIC_SUPABASE_KEY;

// Créer le client Supabase avec AsyncStorage pour la persistance
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'musclemeet',
  },
});