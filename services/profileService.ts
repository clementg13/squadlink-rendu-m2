import { supabase } from '@/lib/supabase';
import { UserProfile, Location, Gym, GymSubscription, Hobbie } from '@/types/profile';
import { CompatibleProfile } from '@/services/compatibleProfileService';

/**
 * Service pour gérer les appels aux fonctions Supabase liées aux profils utilisateur
 * Note: Les profils compatibles sont maintenant gérés par CompatibleProfileService
 */
export class ProfileService {

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

  /**
   * Récupère les détails complets d'un profil à partir de son user_id
   * @param userId - ID de l'utilisateur
   * @returns Promise<CompatibleProfile | null>
   */
  async getProfileDetails(userId: string): Promise<CompatibleProfile | null> {
    try {
      // Utiliser la fonction RPC Supabase
      const { data, error } = await supabase
        .rpc('get_profile_details', {
          target_user_id: userId
        });

      if (error) {
        console.error('❌ ProfileService: Failed to fetch profile details:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ ProfileService: No profile details found for user:', userId);
        return null;
      }

      const profileData = data[0];
      console.log('✅ ProfileService: Profile details loaded:', profileData);

      // Construire l'objet CompatibleProfile
      const compatibleProfile: CompatibleProfile = {
        profile_id: profileData.profile_id,
        user_id: profileData.user_id,
        firstname: profileData.firstname,
        lastname: profileData.lastname,
        biography: profileData.biography,
        compatibility_score: 0, // Pas de calcul de compatibilité pour les demandes
        total_count: 0,
        age: profileData.age,
        location: profileData.location || undefined,
        gym: profileData.gym || undefined,
        gymSubscription: profileData.gym_subscription || undefined,
        hobbies: profileData.hobbies || [],
        sports: profileData.sports || [],
        socialMedias: profileData.social_medias || []
      };

      return compatibleProfile;
    } catch (error) {
      console.error('❌ ProfileService: Unexpected error fetching profile details:', error);
      return null;
    }
  }

  /**
   * Supprime le compte utilisateur et toutes ses données personnelles.
   * Utilise la fonction RPC sécurisée côté Supabase (auth_delete_current_user).
   */
  async deleteAccountAndData(): Promise<{ error?: string }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        return { error: 'Impossible de récupérer votre compte.' };
      }

      // Supprimer le profil utilisateur (et données liées si FK ON DELETE CASCADE)
      const { error: profileError } = await supabase
        .from('profile')
        .delete()
        .eq('id_user', user.id);

      if (profileError) {
        return { error: 'Erreur lors de la suppression des données du profil.' };
      }

      // Attendre un court instant pour laisser la cascade s'effectuer côté base
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Tentative de suppression du compte Supabase Auth via la fonction RPC
      const { error: rpcError, data } = await supabase.rpc('auth_delete_current_user');
      console.log('RPC delete user result:', { data, rpcError });
      if (rpcError) {
        if (rpcError.code === '23503') {
          return {
            error:
              "Impossible de supprimer votre compte car certaines de vos données sont encore référencées ailleurs (ex : groupes, matches, etc.). Veuillez d'abord quitter ou supprimer ces éléments avant de réessayer."
          };
        }
        return { error: 'Erreur lors de la suppression du compte utilisateur.' };
      }
      // data est null si la fonction SQL retourne void ou rien, mais la suppression a réussi
      // On considère donc la suppression comme un succès si rpcError est null
      return {};
    } catch {
      return { error: 'Une erreur est survenue lors de la suppression du compte.' };
    }
  }
}

export const profileService = new ProfileService();
