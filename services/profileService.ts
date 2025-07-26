import { supabase } from '@/lib/supabase';
import { CompatibleProfile, PaginationParams, CompatibleProfilesResponse, UserProfile, Location, Gym, GymSubscription, Hobbie } from '@/types/profile';

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
      const profiles: CompatibleProfile[] = data.map((row: {
        profile_id: number;
        user_id: string;
        firstname: string;
        lastname: string;
        biography: string | null;
        score: number;
        compatibility_score: string;
        total_count: string;
      }) => ({
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

  // === Profile Management ===
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('id_user', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profile')
      .insert([{
        id_user: userId,
        score: 0,
        fully_completed: false,
        created_at: new Date().toISOString(),
      }])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    // Nettoyer les données avant mise à jour
    const cleanUpdates = { ...updates };
    
    // Supprimer les champs calculés/joints qui ne doivent pas être mis à jour
    delete cleanUpdates.id_user;
    delete cleanUpdates.created_at;
    delete cleanUpdates.updated_at;
    
    // Gérer la date de naissance avec validation
    if ('birthdate' in cleanUpdates) {
      if (!cleanUpdates.birthdate) {
        // Si birthdate est vide, null ou undefined, on la supprime du payload
        delete cleanUpdates.birthdate;
      } else if (
        cleanUpdates.birthdate !== null &&
        typeof cleanUpdates.birthdate === 'object' &&
        Object.prototype.toString.call(cleanUpdates.birthdate) === '[object Date]'
      ) {
        // Convertir Date en string format YYYY-MM-DD
        cleanUpdates.birthdate = (cleanUpdates.birthdate as Date).toISOString().split('T')[0];
      } else if (typeof cleanUpdates.birthdate === 'string') {
        // Valider le format de date string
        const dateStr = cleanUpdates.birthdate.trim();
        if (dateStr === '') {
          // String vide - supprimer du payload
          delete cleanUpdates.birthdate;
        } else {
          // Vérifier que c'est une date valide
          const dateObj = new Date(dateStr);
          if (isNaN(dateObj.getTime())) {
            console.warn('⚠️ ProfileService: Invalid date format:', dateStr);
            delete cleanUpdates.birthdate;
          } else {
            // Format correct YYYY-MM-DD
            cleanUpdates.birthdate = dateObj.toISOString().split('T')[0];
          }
        }
      }
    }

    // Nettoyer les strings vides pour éviter les erreurs de base de données
    Object.keys(cleanUpdates).forEach(key => {
      const value = cleanUpdates[key as keyof UserProfile];
      if (typeof value === 'string' && value.trim() === '') {
        // Supprimer les strings vides plutôt que d'envoyer des valeurs vides
        delete cleanUpdates[key as keyof UserProfile];
      }
    });

    console.log('📝 ProfileService: Updating profile for user:', userId);
    console.log('📝 ProfileService: Clean update payload:', cleanUpdates);

    // Ne rien faire si aucune données à mettre à jour
    if (Object.keys(cleanUpdates).length === 0) {
      console.log('📝 ProfileService: No data to update, returning current profile');
      return await this.getProfile(userId) as UserProfile;
    }

    const { data, error } = await supabase
      .from('profile')
      .update(cleanUpdates)
      .eq('id_user', userId)
      .select('*')
      .single();

    if (error) {
      console.error('❌ ProfileService: Profile update failed:', error);
      throw error;
    }

    console.log('✅ ProfileService: Profile updated successfully');
    return data;
  }

  // === Location Management ===
  async updateLocation(userId: string, locationData: { town: string; postal_code: number; latitude: number; longitude: number }): Promise<void> {
    try {
      console.log('📍 ProfileService: Updating location for user:', userId);
      
      // 1. Créer la nouvelle localisation
      const locationPayload = {
        town: locationData.town,
        postal_code: locationData.postal_code,
        location: `POINT(${locationData.longitude} ${locationData.latitude})`
      };

      const { data: newLocation, error: locationError } = await supabase
        .from('location')
        .insert(locationPayload)
        .select('*')
        .single();

      if (locationError) {
        console.error('❌ ProfileService: Location creation failed:', locationError);
        throw locationError;
      }

      // 2. Mettre à jour le profil avec la nouvelle localisation
      const { error: profileError } = await supabase
        .from('profile')
        .update({ id_location: newLocation.id })
        .eq('id_user', userId);

      if (profileError) {
        console.error('❌ ProfileService: Profile location update failed:', profileError);
        throw profileError;
      }

      console.log('✅ ProfileService: Location updated successfully');
    } catch (error) {
      console.error('❌ ProfileService: Location update error:', error);
      throw error;
    }
  }

  // === Related Data Fetchers ===
  async getLocationDetails(locationId: string): Promise<Location | null> {
    const { data, error } = await supabase
      .from('location')
      .select('*')
      .eq('id', locationId)
      .single();

    return error ? null : data;
  }

  async getGymDetails(gymId: string): Promise<Gym | null> {
    const { data, error } = await supabase
      .from('gym')
      .select('*')
      .eq('id', gymId)
      .single();

    return error ? null : data;
  }

  async getGymSubscriptionDetails(subscriptionId: string): Promise<GymSubscription | null> {
    const { data, error } = await supabase
      .from('gymsubscription')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    return error ? null : data;
  }

  // === Reference Data ===
  async getAllGyms(): Promise<Gym[]> {
    const { data, error } = await supabase
      .from('gym')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getGymSubscriptions(gymId?: string): Promise<GymSubscription[]> {
    let query = supabase.from('gymsubscription').select('*');
    if (gymId) query = query.eq('id_gym', gymId);
    
    const { data, error } = await query.order('name');
    if (error) throw error;
    return data || [];
  }

  async getAllHobbies(): Promise<Hobbie[]> {
    const { data, error } = await supabase
      .from('hobbie')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }
}

export const profileService = new ProfileService();
