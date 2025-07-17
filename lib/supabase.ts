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

// Types pour l'authentification
export type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
};

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
};

// Fonction utilitaire pour obtenir l'utilisateur actuel
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Fonction utilitaire pour obtenir la session actuelle
export const getCurrentSession = async (): Promise<AuthSession | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}; 