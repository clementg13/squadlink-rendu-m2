import { z } from 'zod';
import Constants from 'expo-constants';

// Schéma de validation pour les variables d'environnement
const envSchema = z.object({
  // Variables d'environnement requises
  API_URL: z.string().url('API_URL doit être une URL valide'),
  
  // Variables Supabase (requises)
  EXPO_PUBLIC_SUPABASE_URL: z.string().url('EXPO_PUBLIC_SUPABASE_URL doit être une URL valide'),
  EXPO_PUBLIC_SUPABASE_KEY: z.string().min(1, 'EXPO_PUBLIC_SUPABASE_KEY est requis'),
  
  // Variables d'environnement optionnelles avec valeurs par défaut
  DEBUG: z.string().default('false').transform((val) => val === 'true'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Variables pour différents environnements
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  
  // Exemple d'autres variables communes
  SENTRY_DSN: z.string().optional(),
  ANALYTICS_KEY: z.string().optional(),

  // Sentry
  SENTRY_AUTH_TOKEN: z.string().optional(),
});

// Type TypeScript généré automatiquement depuis le schéma
export type Environment = z.infer<typeof envSchema>;

// Fonction pour valider et récupérer les variables d'environnement
function getEnvironmentVariables(): Environment {
  try {
    // Récupération des variables depuis Expo Constants
    const rawEnv = Constants.expoConfig?.extra || {};
    
    // Validation avec Zod
    const env = envSchema.parse(rawEnv);
    
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(
        (err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`
      );
      throw new Error(
        `Variables d'environnement invalides:\n${errorMessages.join('\n')}`
      );
    }
    throw error;
  }
}

// Export de l'instance singleton des variables d'environnement
export const env = getEnvironmentVariables();

// Fonction utilitaire pour vérifier l'environnement
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isStaging = env.NODE_ENV === 'staging'; 