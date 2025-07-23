// Types pour les profils compatibles basés sur la fonction Supabase get_compatible_profiles
export interface CompatibleProfile {
  profile_id: number;
  user_id: string;
  firstname: string;
  lastname: string;
  biography: string | null;
  score: number;
  compatibility_score: number;
  total_count: number;
}

// Type pour les paramètres de pagination
export interface PaginationParams {
  page_offset: number;
  page_size: number;
}

// Type pour la réponse de la fonction avec métadonnées
export interface CompatibleProfilesResponse {
  profiles: CompatibleProfile[];
  total_count: number;
  has_more: boolean;
  current_page: number;
}

// Type pour l'état du hook de chargement
export interface CompatibleProfilesState {
  profiles: CompatibleProfile[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
} 