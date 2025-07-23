import { supabase } from '@/lib/supabase';
import { CompatibleProfile, PaginationParams, CompatibleProfilesResponse } from '@/types/profile';

/**
 * Service pour gérer les appels aux fonctions Supabase liées aux profils
 */
export class ProfileService {
  /**
   * Récupère les profils compatibles avec pagination via la fonction Supabase
   */
  static async getCompatibleProfiles(
    currentUserId: string,
    params: PaginationParams = { page_offset: 0, page_size: 10 }
  ): Promise<CompatibleProfilesResponse> {
    try {
      const { data, error } = await supabase.rpc('get_compatible_profiles', {
        current_user_id: currentUserId,
        page_offset: params.page_offset,
        page_size: params.page_size
      });

      if (error) {
        console.error('❌ Erreur lors de la récupération des profils compatibles:', error);
        throw new Error(`Erreur Supabase: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return {
          profiles: [],
          total_count: 0,
          has_more: false,
          current_page: Math.floor(params.page_offset / params.page_size)
        };
      }

      // Transformer les données de la fonction Supabase
      const profiles: CompatibleProfile[] = data.map((row: any) => ({
        profile_id: row.profile_id,
        user_id: row.user_id,
        firstname: row.firstname,
        lastname: row.lastname,
        biography: row.biography,
        score: row.score,
        compatibility_score: parseFloat(row.compatibility_score),
        total_count: parseInt(row.total_count)
      }));

      const totalCount = profiles.length > 0 ? profiles[0].total_count : 0;
      const currentPage = Math.floor(params.page_offset / params.page_size);
      const hasMore = params.page_offset + profiles.length < totalCount;

      return {
        profiles,
        total_count: totalCount,
        has_more: hasMore,
        current_page: currentPage
      };

    } catch (error) {
      console.error('❌ Erreur dans ProfileService.getCompatibleProfiles:', error);
      throw error;
    }
  }

  /**
   * Rafraîchit la liste des profils compatibles (recharge depuis le début)
   */
  static async refreshCompatibleProfiles(
    currentUserId: string,
    pageSize: number = 10
  ): Promise<CompatibleProfilesResponse> {
    return this.getCompatibleProfiles(currentUserId, {
      page_offset: 0,
      page_size: pageSize
    });
  }
} 