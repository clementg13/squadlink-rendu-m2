import { supabase } from '@/lib/supabase';
import { UserProfile, Location, Gym, GymSubscription, Hobbie } from '@/types/profile';
import { CompatibleProfile } from '@/services/compatibleProfileService';

/**
 * Service pour gérer les appels aux fonctions Supabase liées aux profils utilisateur
 * Note: Les profils compatibles sont maintenant gérés par CompatibleProfileService
 */
export class ProfileService {
  // Cache pour stocker les profils
  private static profileCache = new Map<string, any>();
  private static lastCacheUpdate = new Map<string, number>();

  // === Profile Management ===
  async getProfile(userId: string, forceRefresh = false): Promise<UserProfile | null> {
    const cacheKey = `profile_${userId}`;
    const now = Date.now();
    const cacheExpiry = 30000; // 30 secondes

    // Vérifier le cache si pas de force refresh
    if (!forceRefresh && 
        ProfileService.profileCache.has(cacheKey) && 
        ProfileService.lastCacheUpdate.has(cacheKey) &&
        (now - ProfileService.lastCacheUpdate.get(cacheKey)!) < cacheExpiry) {
      console.log('📋 ProfileService: Returning cached profile');
      return ProfileService.profileCache.get(cacheKey);
    }

    console.log('🔍 ProfileService: Loading complete profile with all relations for user:', userId);
    console.log('🔄 ProfileService: Force refresh:', forceRefresh);

    // Récupérer le profil avec toutes les relations
    const { data, error } = await supabase
      .schema('musclemeet') // ✅ Spécifier le schéma pour cohérence
      .from('profile')
      .select(`
        *,
        location(*),
        gym(*),
        gymsubscription(*)
      `)
      .eq('id_user', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ ProfileService: Failed to load profile:', error);
      throw error;
    }

    if (!data) {
      console.log('📭 ProfileService: No profile found for user:', userId);
      return null;
    }

    console.log('✅ ProfileService: Base profile loaded:', {
      id: data.id,
      firstname: data.firstname,
      lastname: data.lastname,
      hasLocation: !!data.location,
      hasGym: !!data.gym,
      hasGymSubscription: !!data.gymsubscription,
      id_gym: data.id_gym,
      id_gymsubscription: data.id_gymsubscription,
      gym_name: data.gym?.name,
      gymsubscription_name: data.gymsubscription?.name,
      gymsubscription_id_gym: data.gymsubscription?.id_gym
    });

    // Récupérer les sports du profil
    const { data: sportsData, error: sportsError } = await supabase
      .schema('musclemeet')
      .from('profilesport')
      .select(`
        *,
        sport(*),
        sportlevel(*)
      `)
      .eq('id_profile', data.id);

    if (sportsError) {
      console.warn('⚠️ ProfileService: Failed to load sports:', sportsError);
    } else {
      console.log('✅ ProfileService: Sports loaded:', sportsData?.length || 0);
    }

    // Récupérer les hobbies du profil
    const { data: hobbiesData, error: hobbiesError } = await supabase
      .from('profilehobbie')
      .select(`
        *,
        hobbie(*)
      `)
      .eq('id_profile', data.id);

    if (hobbiesError) {
      console.warn('⚠️ ProfileService: Failed to load hobbies:', hobbiesError);
    } else {
      console.log('✅ ProfileService: Hobbies loaded:', hobbiesData?.length || 0);
    }

    // Récupérer les réseaux sociaux du profil
    const { data: socialMediaData, error: socialMediaError } = await supabase
      .from('profilesocialmedia')
      .select(`
        *,
        socialmedia(*)
      `)
      .eq('id_profile', data.id);

    if (socialMediaError) {
      console.warn('⚠️ ProfileService: Failed to load social media:', socialMediaError);
    } else {
      console.log('✅ ProfileService: Social media loaded:', socialMediaData?.length || 0);
    }

    // Construire le profil complet avec toutes les données
    const completeProfile = {
      ...data,
      sports: sportsData || [],
      hobbies: hobbiesData || [],
      socialMedias: socialMediaData || []
    };

    console.log('✅ ProfileService: Complete profile assembled:', {
      location: data.location ? 'YES' : 'NO',
      gym: data.gym ? `YES (${data.gym.name})` : 'NO',
      gymSubscription: data.gymsubscription ? `YES (${data.gymsubscription.name})` : 'NO',
      sportsCount: sportsData?.length || 0,
      hobbiesCount: hobbiesData?.length || 0,
      socialMediaCount: socialMediaData?.length || 0
    });
    
    // Stocker en cache
    ProfileService.profileCache.set(cacheKey, completeProfile);
    ProfileService.lastCacheUpdate.set(cacheKey, now);
    
    return completeProfile;
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
    console.log('🔄 ProfileService: Starting updateProfile for user:', userId);
    console.log('🔄 ProfileService: Raw updates received:', updates);

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

    // Vérifier que l'utilisateur existe d'abord
    const { data: existingProfile, error: checkError } = await supabase
      .from('profile')
      .select('id, id_user')
      .eq('id_user', userId)
      .single();

    if (checkError) {
      console.error('❌ ProfileService: User profile not found:', checkError);
      throw new Error('Profil utilisateur non trouvé');
    }

    console.log('✅ ProfileService: Existing profile found:', existingProfile);

    // Ne rien faire si aucune données à mettre à jour
    if (Object.keys(cleanUpdates).length === 0) {
      console.log('📝 ProfileService: No data to update, returning current profile');
      return await this.getProfile(userId, true) as UserProfile;
    }

    // Effectuer la mise à jour
    console.log('🚀 ProfileService: Executing update query...');
    const { data, error } = await supabase
      .from('profile')
      .update(cleanUpdates)
      .eq('id_user', userId)
      .select('*')
      .single();

    if (error) {
      console.error('❌ ProfileService: Profile update failed:', error);
      console.error('❌ ProfileService: Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    if (!data) {
      console.error('❌ ProfileService: No data returned after update');
      throw new Error('Aucune donnée retournée après la mise à jour');
    }

    console.log('✅ ProfileService: Profile updated successfully:', data);
    
    // Invalider le cache après mise à jour
    this.invalidateProfileCache(userId);
    
    // Vérifier que les données ont bien été sauvegardées
    const verificationProfile = await this.forceReloadProfile(userId);
    console.log('🔍 ProfileService: Verification profile after update:', verificationProfile);
    
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
      
      // Invalider le cache après mise à jour de la localisation
      this.invalidateProfileCache(userId);
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
  async getProfileDetails(userId: string, forceRefresh = false): Promise<CompatibleProfile | null> {
    const cacheKey = `profile_details_${userId}`;
    const now = Date.now();
    const cacheExpiry = 30000; // 30 secondes

    // Vérifier le cache si pas de force refresh
    if (!forceRefresh && 
        ProfileService.profileCache.has(cacheKey) && 
        ProfileService.lastCacheUpdate.has(cacheKey) &&
        (now - ProfileService.lastCacheUpdate.get(cacheKey)!) < cacheExpiry) {
      return ProfileService.profileCache.get(cacheKey);
    }

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

      // Stocker en cache
      ProfileService.profileCache.set(cacheKey, compatibleProfile);
      ProfileService.lastCacheUpdate.set(cacheKey, now);

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

  // Nouvelle méthode pour invalider le cache
  invalidateProfileCache(userId: string): void {
    const cacheKey = `profile_${userId}`;
    const detailsKey = `profile_details_${userId}`;
    
    ProfileService.profileCache.delete(cacheKey);
    ProfileService.profileCache.delete(detailsKey);
    ProfileService.lastCacheUpdate.delete(cacheKey);
    ProfileService.lastCacheUpdate.delete(detailsKey);
    
    // Invalider aussi les caches liés
    this.invalidateRelatedCaches(userId);
  }

  // Invalider les caches liés au profil
  private invalidateRelatedCaches(userId: string): void {
    // Invalider le cache des profils compatibles si il existe
    const compatibleCacheKeys = Array.from(ProfileService.profileCache.keys())
      .filter(key => key.includes('compatible') || key.includes('enriched'));
    
    compatibleCacheKeys.forEach(key => {
      ProfileService.profileCache.delete(key);
      ProfileService.lastCacheUpdate.delete(key);
    });
  }

  // Méthode publique pour forcer le rechargement complet
  async refreshProfile(userId: string): Promise<UserProfile | null> {
    this.invalidateProfileCache(userId);
    return this.getProfile(userId, true);
  }

  // Nouvelle méthode pour forcer un appel API complet
  async forceReloadProfile(userId: string): Promise<UserProfile | null> {
    console.log('🔄 ProfileService: Force reload profile for user:', userId);
    
    // Vider complètement le cache pour cet utilisateur
    this.invalidateProfileCache(userId);
    
    // Utiliser getProfile avec forceRefresh pour récupérer toutes les données
    return this.getProfile(userId, true);
  }

  // Méthode pour forcer le rechargement des détails complets
  async forceReloadProfileDetails(userId: string): Promise<CompatibleProfile | null> {
    console.log('🔄 ProfileService: Force reload profile details for user:', userId);
    
    // Vider le cache des détails
    const detailsKey = `profile_details_${userId}`;
    ProfileService.profileCache.delete(detailsKey);
    ProfileService.lastCacheUpdate.delete(detailsKey);
    
    try {
      // Appel API direct pour les détails complets
      const { data, error } = await supabase
        .rpc('get_profile_details', {
          target_user_id: userId
        });

      if (error) {
        console.error('❌ ProfileService: Force reload profile details failed:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ ProfileService: No profile details found for user:', userId);
        return null;
      }

      const profileData = data[0];
      console.log('✅ ProfileService: Profile details force reloaded:', profileData);

      // Construire l'objet CompatibleProfile
      const compatibleProfile: CompatibleProfile = {
        profile_id: profileData.profile_id,
        user_id: profileData.user_id,
        firstname: profileData.firstname,
        lastname: profileData.lastname,
        biography: profileData.biography,
        compatibility_score: 0,
        total_count: 0,
        age: profileData.age,
        location: profileData.location || undefined,
        gym: profileData.gym || undefined,
        gymSubscription: profileData.gym_subscription || undefined,
        hobbies: profileData.hobbies || [],
        sports: profileData.sports || [],
        socialMedias: profileData.social_medias || []
      };

      // Remettre en cache
      const now = Date.now();
      ProfileService.profileCache.set(detailsKey, compatibleProfile);
      ProfileService.lastCacheUpdate.set(detailsKey, now);

      return compatibleProfile;
    } catch (error) {
      console.error('❌ ProfileService: Unexpected error force reloading profile details:', error);
      return null;
    }
  }

  // Méthode pour recharger toutes les données liées au profil
  async forceReloadAllProfileData(userId: string): Promise<{
    profile: UserProfile | null;
    details: CompatibleProfile | null;
  }> {
    console.log('🔄 ProfileService: Force reload ALL profile data for user:', userId);
    
    // Invalider tout le cache lié à cet utilisateur
    this.invalidateProfileCache(userId);
    
    // Charger en parallèle le profil de base et les détails complets
    const [profile, details] = await Promise.all([
      this.forceReloadProfile(userId),
      this.forceReloadProfileDetails(userId)
    ]);
    
    console.log('✅ ProfileService: All profile data force reloaded');
    
    return { profile, details };
  }

  // Méthode pour déboguer l'état actuel du profil avec toutes les relations
  // (Duplicate removed)

  // Méthode pour forcer un rechargement complet SANS CACHE du tout
  async forceReloadCompleteProfile(userId: string): Promise<UserProfile | null> {
    console.log('🔥 ProfileService: FORCE COMPLETE RELOAD for user:', userId);
    
    try {
      // 1. Récupérer le profil de base sans cache
      console.log('📊 Step 1: Loading base profile...');
      const { data: baseProfile, error: baseError } = await supabase
        .from('profile')
        .select('*')
        .eq('id_user', userId)
        .single();

      if (baseError) {
        console.error('❌ Failed to load base profile:', baseError);
        return null;
      }

      console.log('✅ Base profile loaded:', baseProfile);

      // 2. Récupérer la localisation si elle existe
      let location = null;
      if (baseProfile.id_location) {
        console.log('📍 Step 2: Loading location...');
        const { data: locationData, error: locationError } = await supabase
          .from('location')
          .select('*')
          .eq('id', baseProfile.id_location)
          .single();
        
        if (!locationError && locationData) {
          location = locationData;
          console.log('✅ Location loaded:', location);
        } else {
          console.warn('⚠️ Failed to load location:', locationError);
        }
      }

      // 3. Récupérer la gym si elle existe
      let gym = null;
      if (baseProfile.id_gym) {
        console.log('🏋️ Step 3: Loading gym...');
        const { data: gymData, error: gymError } = await supabase
          .from('gym')
          .select('*')
          .eq('id', baseProfile.id_gym)
          .single();
        
        if (!gymError && gymData) {
          gym = gymData;
          console.log('✅ Gym loaded:', gym);
        } else {
          console.warn('⚠️ Failed to load gym:', gymError);
        }
      }

      // 4. Récupérer l'abonnement gym si il existe
      let gymSubscription = null;
      if (baseProfile.id_gym_subscription) {
        console.log('💳 Step 4: Loading gym subscription...');
        const { data: gymSubData, error: gymSubError } = await supabase
          .from('gymsubscription')
          .select('*')
          .eq('id', baseProfile.id_gym_subscription)
          .single();
        
        if (!gymSubError && gymSubData) {
          gymSubscription = gymSubData;
          console.log('✅ Gym subscription loaded:', gymSubscription);
        } else {
          console.warn('⚠️ Failed to load gym subscription:', gymSubError);
        }
      }

      // 5. Récupérer les sports
      console.log('🏃 Step 5: Loading sports...');
      const { data: sports, error: sportsError } = await supabase
        .from('profilesport')
        .select(`
          *,
          sport(*),
          sportlevel(*)
        `)
        .eq('id_profile', baseProfile.id);

      if (sportsError) {
        console.warn('⚠️ Failed to load sports:', sportsError);
      } else {
        console.log('✅ Sports loaded:', sports?.length || 0, 'items');
      }

      // 6. Récupérer les hobbies
      console.log('🎯 Step 6: Loading hobbies...');
      const { data: hobbies, error: hobbiesError } = await supabase
        .from('profilehobbie')
        .select(`
          *,
          hobbie(*)
        `)
        .eq('id_profile', baseProfile.id);

      if (hobbiesError) {
        console.warn('⚠️ Failed to load hobbies:', hobbiesError);
      } else {
        console.log('✅ Hobbies loaded:', hobbies?.length || 0, 'items');
      }

      // 7. Récupérer les réseaux sociaux
      console.log('📱 Step 7: Loading social media...');
      const { data: socialMedias, error: socialError } = await supabase
        .from('profilesocialmedia')
        .select(`
          *,
          socialmedia(*)
        `)
        .eq('id_profile', baseProfile.id);

      if (socialError) {
        console.warn('⚠️ Failed to load social media:', socialError);
      } else {
        console.log('✅ Social media loaded:', socialMedias?.length || 0, 'items');
      }

      // 8. Construire le profil complet
      const completeProfile = {
        ...baseProfile,
        location,
        gym,
        gymsubscription: gymSubscription,
        sports: sports || [],
        hobbies: hobbies || [],
        socialMedias: socialMedias || []
      };

      console.log('🎉 COMPLETE PROFILE ASSEMBLED:', {
        id: completeProfile.id,
        firstname: completeProfile.firstname,
        lastname: completeProfile.lastname,
        hasLocation: !!location,
        hasGym: !!gym,
        hasGymSubscription: !!gymSubscription,
        sportsCount: sports?.length || 0,
        hobbiesCount: hobbies?.length || 0,
        socialMediaCount: socialMedias?.length || 0
      });

      // 9. Mettre en cache le résultat
      const cacheKey = `profile_${userId}`;
      const now = Date.now();
      ProfileService.profileCache.set(cacheKey, completeProfile);
      ProfileService.lastCacheUpdate.set(cacheKey, now);

      return completeProfile;

    } catch (error) {
      console.error('💥 ProfileService: CRITICAL ERROR in forceReloadCompleteProfile:', error);
      return null;
    }
  }

  // Méthode pour vider TOUT le cache et recharger
  async nukeAndReload(userId: string): Promise<UserProfile | null> {
    console.log('💣 ProfileService: NUKE AND RELOAD for user:', userId);
    
    // Vider tout le cache
    ProfileService.profileCache.clear();
    ProfileService.lastCacheUpdate.clear();
    
    // Recharger complètement
    return this.forceReloadCompleteProfile(userId);
  }

  // Méthode pour déboguer l'état actuel du profil avec toutes les relations
  async debugProfile(userId: string): Promise<void> {
    console.log('🐛 ProfileService: Debug profile for user:', userId);
    
    try {
      // Vérifier le profil de base
      const { data: baseProfile, error: baseError } = await supabase
        .from('profile')
        .select('*')
        .eq('id_user', userId)
        .single();

      if (baseError) {
        console.error('🐛 ProfileService: Debug - Profile not found:', baseError);
        return;
      }

      console.log('🐛 ProfileService: Debug - Base profile:', baseProfile);

      // Vérifier la localisation
      if (baseProfile.id_location) {
        const { data: location } = await supabase
          .from('location')
          .select('*')
          .eq('id', baseProfile.id_location)
          .single();
        console.log('🐛 ProfileService: Debug - Location:', location);
      }

      // Vérifier la gym
      if (baseProfile.id_gym) {
        const { data: gym } = await supabase
          .from('gym')
          .select('*')
          .eq('id', baseProfile.id_gym)
          .single();
        console.log('🐛 ProfileService: Debug - Gym:', gym);
      }

      // Vérifier l'abonnement gym
      if (baseProfile.id_gym_subscription) {
        const { data: gymSub } = await supabase
          .from('gymsubscription')
          .select('*')
          .eq('id', baseProfile.id_gym_subscription)
          .single();
        console.log('🐛 ProfileService: Debug - Gym subscription:', gymSub);
      }

      // Vérifier les sports
      const { data: sports } = await supabase
        .from('profilesport')
        .select(`
          *,
          sport(*),
          sportlevel(*)
        `)
        .eq('id_profile', baseProfile.id);
      console.log('🐛 ProfileService: Debug - Sports:', sports);

      // Vérifier les hobbies
      const { data: hobbies } = await supabase
        .from('profilehobbie')
        .select(`
          *,
          hobbie(*)
        `)
        .eq('id_profile', baseProfile.id);
      console.log('🐛 ProfileService: Debug - Hobbies:', hobbies);

    } catch (err) {
      console.error('🐛 ProfileService: Debug - Unexpected error:', err);
    }
  }

  // Méthode pour déboguer et afficher TOUTES les données en base
  async debugAndDisplayAllData(userId: string): Promise<void> {
    console.log('🔍 ProfileService: =================================');
    console.log('🔍 ProfileService: DEBUGGING ALL DATA FOR USER:', userId);
    console.log('🔍 ProfileService: =================================');
    
    try {
      // 1. Profil de base
      const { data: baseProfile, error: baseError } = await supabase
        .from('profile')
        .select('*')
        .eq('id_user', userId)
        .single();

      console.log('📊 BASE PROFILE:');
      if (baseError) {
        console.error('❌ Error:', baseError);
      } else {
        console.log('✅ Data:', baseProfile);
        console.log('📍 Location ID:', baseProfile?.id_location);
        console.log('🏋️ Gym ID:', baseProfile?.id_gym);
        console.log('💳 Gym Subscription ID:', baseProfile?.id_gym_subscription);
      }

      if (!baseProfile) return;

      // 2. Localisation
      if (baseProfile.id_location) {
        console.log('\n📍 LOCATION DATA:');
        const { data: location, error: locationError } = await supabase
          .from('location')
          .select('*')
          .eq('id', baseProfile.id_location)
          .single();
        
        if (locationError) {
          console.error('❌ Location Error:', locationError);
        } else {
          console.log('✅ Location:', location);
        }
      } else {
        console.log('\n📍 NO LOCATION ID IN PROFILE');
      }

      // 3. Gym
      if (baseProfile.id_gym) {
        console.log('\n🏋️ GYM DATA:');
        const { data: gym, error: gymError } = await supabase
          .from('gym')
          .select('*')
          .eq('id', baseProfile.id_gym)
          .single();
        
        if (gymError) {
          console.error('❌ Gym Error:', gymError);
        } else {
          console.log('✅ Gym:', gym);
        }
      } else {
        console.log('\n🏋️ NO GYM ID IN PROFILE');
      }

      // 4. Abonnement gym
      if (baseProfile.id_gym_subscription) {
        console.log('\n💳 GYM SUBSCRIPTION DATA:');
        const { data: gymSub, error: gymSubError } = await supabase
          .from('gymsubscription')
          .select('*')
          .eq('id', baseProfile.id_gym_subscription)
          .single();
        
        if (gymSubError) {
          console.error('❌ Gym Subscription Error:', gymSubError);
        } else {
          console.log('✅ Gym Subscription:', gymSub);
        }
      } else {
        console.log('\n💳 NO GYM SUBSCRIPTION ID IN PROFILE');
      }

      // 5. Sports - requête directe
      console.log('\n🏃 SPORTS DATA:');
      const { data: sports, error: sportsError } = await supabase
        .from('profilesport')
        .select(`
          *,
          sport(*),
          sportlevel(*)
        `)
        .eq('id_profile', baseProfile.id);

      if (sportsError) {
        console.error('❌ Sports Error:', sportsError);
      } else {
        console.log(`✅ Found ${sports?.length || 0} sports:`, sports);
      }

      // 6. Hobbies - requête directe
      console.log('\n🎯 HOBBIES DATA:');
      const { data: hobbies, error: hobbiesError } = await supabase
        .from('profilehobbie')
        .select(`
          *,
          hobbie(*)
        `)
        .eq('id_profile', baseProfile.id);

      if (hobbiesError) {
        console.error('❌ Hobbies Error:', hobbiesError);
      } else {
        console.log(`✅ Found ${hobbies?.length || 0} hobbies:`, hobbies);
      }

      // 7. Réseaux sociaux
      console.log('\n📱 SOCIAL MEDIA DATA:');
      const { data: socialMedia, error: socialError } = await supabase
        .from('profilesocialmedia')
        .select(`
          *,
          socialmedia(*)
        `)
        .eq('id_profile', baseProfile.id);

      if (socialError) {
        console.error('❌ Social Media Error:', socialError);
      } else {
        console.log(`✅ Found ${socialMedia?.length || 0} social medias:`, socialMedia);
      }

      console.log('\n🔍 ProfileService: =================================');
      console.log('🔍 ProfileService: END DEBUG');
      console.log('🔍 ProfileService: =================================');

    } catch (error) {
      console.error('💥 ProfileService: Critical error in debugAndDisplayAllData:', error);
    }
  }

  // Méthode pour forcer l'affichage de TOUTES les données
  async forceDisplayAllUserData(userId: string): Promise<UserProfile | null> {
    console.log('🔥 ProfileService: FORCE DISPLAY ALL DATA for user:', userId);
    
    // D'abord déboguer pour voir ce qu'il y a en base
    await this.debugAndDisplayAllData(userId);
    
    // Puis recharger le profil complet
    return this.forceReloadCompleteProfile(userId);
  }

  // === Gym Subscription Management ===
  async updateGymSubscription(userId: string, gymId: string, subscriptionId: string): Promise<void> {
    try {
      console.log('💳 ProfileService: Updating gym subscription for user:', userId);
      console.log('💳 Raw Gym ID:', gymId, 'Raw Subscription ID:', subscriptionId);
      
      // Valider les paramètres
      if (!userId || userId === 'undefined' || userId === 'null' || userId.trim() === '') {
        throw new Error('User ID invalide');
      }
      
      if (!gymId || gymId === 'undefined' || gymId === 'null' || gymId.trim() === '') {
        throw new Error('Gym ID invalide');
      }
      
      if (!subscriptionId || subscriptionId === 'undefined' || subscriptionId === 'null' || subscriptionId.trim() === '') {
        throw new Error('Subscription ID invalide');
      }

      // Nettoyer les IDs (convertir en entier si nécessaire)
      const cleanGymId = parseInt(gymId.toString(), 10);
      const cleanSubscriptionId = parseInt(subscriptionId.toString(), 10);
      
      if (isNaN(cleanGymId) || isNaN(cleanSubscriptionId)) {
        throw new Error('IDs doivent être des nombres valides');
      }

      console.log('💳 Clean Gym ID:', cleanGymId, 'Clean Subscription ID:', cleanSubscriptionId);
      
      const { error } = await supabase
        .from('profile')
        .update({ 
          id_gym: cleanGymId,
          id_gym_subscription: cleanSubscriptionId 
        })
        .eq('id_user', userId);

      if (error) {
        console.error('❌ ProfileService: Gym subscription update failed:', error);
        throw error;
      }

      console.log('✅ ProfileService: Gym subscription updated successfully');
      
      // Invalider le cache après mise à jour
      this.invalidateProfileCache(userId);
      
      // Forcer le rechargement du profil
      await this.nukeAndReload(userId);
      
    } catch (error) {
      console.error('❌ ProfileService: Gym subscription update error:', error);
      throw error;
    }
  }

  async removeGymSubscription(userId: string): Promise<void> {
    try {
      console.log('💳 ProfileService: Removing gym subscription for user:', userId);
      
      const { error } = await supabase
        .from('profile')
        .update({ 
          id_gym: null,
          id_gym_subscription: null 
        })
        .eq('id_user', userId);

      if (error) {
        console.error('❌ ProfileService: Gym subscription removal failed:', error);
        throw error;
      }

      console.log('✅ ProfileService: Gym subscription removed successfully');
      
      // Invalider le cache après suppression
      this.invalidateProfileCache(userId);
      
      // Forcer le rechargement du profil
      await this.nukeAndReload(userId);
      
    } catch (error) {
      console.error('❌ ProfileService: Gym subscription removal error:', error);
      throw error;
    }
  }

  // Méthode pour récupérer tous les abonnements d'une gym
  async getAllGymSubscriptions(): Promise<GymSubscription[]> {
    console.log('💳 ProfileService: Getting ALL gym subscriptions');
    
    try {
      const { data, error } = await supabase
        .from('gymsubscription')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ ProfileService: Error loading all gym subscriptions:', error);
        throw error;
      }

      console.log(`✅ ProfileService: Found ${data?.length || 0} total subscriptions:`, data);
      return data || [];
    } catch (error) {
      console.error('❌ ProfileService: Exception in getAllGymSubscriptions:', error);
      return [];
    }
  }

  async getGymSubscriptions(gymId: string): Promise<GymSubscription[]> {
    console.log('💳 ProfileService: Getting subscriptions for gym:', gymId);
    
    // Valider que gymId est défini et valide
    if (!gymId || gymId === 'undefined' || gymId === 'null' || gymId.trim() === '') {
      console.warn('❌ ProfileService: Invalid gym ID provided:', gymId);
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('gymsubscription')
        .select('*')
        .eq('id_gym', gymId)
        .order('name');

      if (error) {
        console.error('❌ ProfileService: Error loading gym subscriptions:', error);
        throw error;
      }

      console.log(`✅ ProfileService: Found ${data?.length || 0} subscriptions for gym ${gymId}:`, data);
      return data || [];
    } catch (error) {
      console.error('❌ ProfileService: Exception in getGymSubscriptions:', error);
      return [];
    }
  }

  // Méthode pour récupérer l'abonnement actuel d'un utilisateur
  async getUserGymSubscription(userId: string): Promise<{ gym: Gym | null; subscription: GymSubscription | null }> {
    console.log('💳 ProfileService: Getting current gym subscription for user:', userId);
    
    // Valider que userId est défini et valide
    if (!userId || userId === 'undefined' || userId === 'null' || userId.trim() === '') {
      console.warn('❌ ProfileService: Invalid user ID provided:', userId);
      return { gym: null, subscription: null };
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profile')
        .select('id_gym, id_gym_subscription')
        .eq('id_user', userId)
        .single();

      if (profileError || !profile) {
        console.log('❌ ProfileService: Profile not found for user:', userId);
        return { gym: null, subscription: null };
      }

      let gym = null;
      let subscription = null;

      // Récupérer la gym si elle existe et est valide
      if (profile.id_gym && profile.id_gym !== 'undefined' && profile.id_gym !== 'null') {
        const { data: gymData, error: gymError } = await supabase
          .from('gym')
          .select('*')
          .eq('id', profile.id_gym)
          .single();
        
        if (!gymError && gymData) {
          gym = gymData;
          console.log('✅ ProfileService: User gym found:', gym);
        }
      }

      // Récupérer l'abonnement si il existe et est valide
      if (profile.id_gym_subscription && profile.id_gym_subscription !== 'undefined' && profile.id_gym_subscription !== 'null') {
        const { data: subData, error: subError } = await supabase
          .from('gymsubscription')
          .select('*')
          .eq('id', profile.id_gym_subscription)
          .single();
        
        if (!subError && subData) {
          subscription = subData;
          console.log('✅ ProfileService: User subscription found:', subscription);
        }
      }

      return { gym, subscription };
    } catch (error) {
      console.error('❌ ProfileService: Exception in getUserGymSubscription:', error);
      return { gym: null, subscription: null };
    }
  }
}

export const profileService = new ProfileService();
