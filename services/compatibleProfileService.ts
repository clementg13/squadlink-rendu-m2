import { supabase } from '@/lib/supabase';
import { ProfileHobby, ProfileSport, ProfileSocialMedia, Location, Gym, GymSubscription } from '@/types/profile';

/**
 * Service pour gérer les profils compatibles
 * Le filtrage des profils incomplets se fait automatiquement côté Supabase
 * 
 * Exemple d'utilisation :
 * ```typescript
 * // Récupérer les profils complets (filtrage automatique)
 * const response = await CompatibleProfileService.getCompatibleProfiles(userId, {
 *   page_offset: 0,
 *   page_size: 10
 * });
 * ```
 */

// Interface pour un profil compatible de base (avant enrichissement)
interface BaseCompatibleProfile {
  profile_id: number;
  user_id: string;
  firstname: string;
  lastname: string;
  biography: string | null;
  compatibility_score: number;
  total_count: number;
}

// Interface pour un profil compatible avec toutes ses données enrichies
export interface CompatibleProfile extends BaseCompatibleProfile {
  // Données enrichies
  location?: Location;
  gym?: Gym;
  gymSubscription?: GymSubscription;
  hobbies?: ProfileHobby[];
  sports?: ProfileSport[];
  socialMedias?: ProfileSocialMedia[];
  age?: number;
}

export class CompatibleProfileService {
  /**
   * Enrichit un profil compatible avec toutes ses informations détaillées
   */
  static async enrichProfile(profile: BaseCompatibleProfile): Promise<CompatibleProfile> {
    try {
      // Récupérer le profil complet
      const { data: fullProfile, error: profileError } = await supabase
        .from('profile')
        .select(`
          *,
          location(*),
          gym(*),
          gymsubscription(*)
        `)
        .eq('id_user', profile.user_id)
        .single();

      if (profileError) {
        console.warn('⚠️ Erreur lors de la récupération du profil complet:', profileError);
        return profile;
      }

      // Récupérer les hobbies
      const { data: hobbies } = await supabase
        .from('profilehobbie')
        .select(`
          *,
          hobbie(*)
        `)
        .eq('id_profile', fullProfile.id);

      // Récupérer les sports
      const { data: sports } = await supabase
        .from('profilesport')
        .select(`
          *,
          sport(*),
          sportlevel(*)
        `)
        .eq('id_profile', fullProfile.id);

      // Récupérer les réseaux sociaux
      const { data: socialMedias } = await supabase
        .from('profilesocialmedia')
        .select(`
          *,
          socialmedia(*)
        `)
        .eq('id_profile', fullProfile.id);

      // Calculer l'âge si la date de naissance est disponible
      let age: number | undefined;
      if (fullProfile.birthdate) {
        const birthDate = new Date(fullProfile.birthdate);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      return {
        ...profile,
        location: fullProfile.location,
        gym: fullProfile.gym,
        gymSubscription: fullProfile.gymsubscription,
        hobbies: hobbies || [],
        sports: sports || [],
        socialMedias: socialMedias || [],
        age,
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'enrichissement du profil:', error);
      return profile;
    }
  }

  /**
   * Enrichit une liste de profils compatibles
   */
  static async enrichProfiles(profiles: BaseCompatibleProfile[]): Promise<CompatibleProfile[]> {
    const enrichmentPromises = profiles.map(profile => this.enrichProfile(profile));
    return Promise.all(enrichmentPromises);
  }

  /**
   * Récupère les profils compatibles avec pagination
   * Les profils incomplets sont automatiquement filtrés côté Supabase
   */
  static async getCompatibleProfiles(
    currentUserId: string,
    params: { page_offset: number; page_size: number } = { page_offset: 0, page_size: 10 }
  ): Promise<{
    profiles: CompatibleProfile[];
    total_count: number;
    has_more: boolean;
    current_page: number;
  }> {
    try {
      // Récupérer les profils compatibles de base
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

      // Transformer et enrichir les données
      const baseProfiles: BaseCompatibleProfile[] = data.map((row: {
        profile_id: number;
        user_id: string;
        firstname: string;
        lastname: string;
        biography: string | null;
        compatibility_score: string;
        total_count: string;
      }) => ({
        profile_id: row.profile_id,
        user_id: row.user_id,
        firstname: row.firstname,
        lastname: row.lastname,
        biography: row.biography,
        compatibility_score: parseFloat(row.compatibility_score),
        total_count: parseInt(row.total_count)
      }));

      // Enrichir tous les profils
      const enrichedProfiles = await this.enrichProfiles(baseProfiles);
      
      console.log(`📊 Profils récupérés: ${enrichedProfiles.length} profils depuis Supabase`);

      const totalCount = baseProfiles.length > 0 ? baseProfiles[0].total_count : 0;
      const currentPage = Math.floor(params.page_offset / params.page_size);
      const hasMore = params.page_offset + baseProfiles.length < totalCount;

      return {
        profiles: enrichedProfiles,
        total_count: totalCount,
        has_more: hasMore,
        current_page: currentPage
      };

    } catch (error) {
      console.error('❌ Erreur dans CompatibleProfileService.getCompatibleProfiles:', error);
      throw error;
    }
  }
} 