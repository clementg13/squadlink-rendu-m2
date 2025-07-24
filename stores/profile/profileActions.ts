import { UserProfile } from '@/types/profile';
import { profileService } from '@/services/profileService';
import { useAuthStore } from '../authStore';

export interface ProfileActions {
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  loadProfile: () => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  updateLocation: (locationData: {
    town: string;
    postal_code: number;
    latitude: number;
    longitude: number;
  }) => Promise<{ error: Error | null }>;
  handleError: (action: string, error: unknown, defaultMessage: string) => { error: Error };
}

export const createProfileActions = (set: any, get: any): ProfileActions => ({
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setSaving: (saving) => set({ saving }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  loadProfile: async () => {
    try {
      set({ loading: true, error: null });
      
      const { user } = useAuthStore.getState();
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      let profileData = await profileService.getProfile(user.id);
      if (!profileData) {
        profileData = await profileService.createProfile(user.id);
        set({ profile: profileData, loading: false });
        return { error: null };
      }

      // Charger les relations
      const [location, gym, gymsubscription, userHobbies, userSports, userSocialMedias] = await Promise.allSettled([
        profileData.id_location ? profileService.getLocationDetails(profileData.id_location) : Promise.resolve(null),
        profileData.id_gym ? profileService.getGymDetails(profileData.id_gym) : Promise.resolve(null),
        profileData.id_gymsubscription ? profileService.getGymSubscriptionDetails(profileData.id_gymsubscription) : Promise.resolve(null),
        import('@/services/hobbyService').then(({ hobbyService }) => hobbyService.getUserHobbies(profileData.id_user)),
        import('@/services/sportService').then(({ sportService }) => sportService.getUserSports(profileData.id_user)),
        import('@/services/socialMediaService').then(({ socialMediaService }) => socialMediaService.getUserSocialMedias(profileData.id_user))
      ]);

      const enrichedProfile: UserProfile = {
        ...profileData,
        location: location.status === 'fulfilled' ? location.value || undefined : undefined,
        gym: gym.status === 'fulfilled' ? gym.value || undefined : undefined,
        gymsubscription: gymsubscription.status === 'fulfilled' ? gymsubscription.value || undefined : undefined,
        hobbies: userHobbies.status === 'fulfilled' ? userHobbies.value : [],
        sports: userSports.status === 'fulfilled' ? userSports.value : [],
        socialMedias: userSocialMedias.status === 'fulfilled' ? userSocialMedias.value : []
      };

      set({ profile: enrichedProfile, loading: false });
      return { error: null };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de chargement du profil';
      console.error('❌ ProfileStore - loadProfile:', error);
      set({ error: errorMessage, loading: false });
      return { error: error as Error };
    }
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    try {
      set({ saving: true, error: null });
      
      const { profile } = get();
      if (!profile) {
        throw new Error('Profil non chargé');
      }

      // Valider et nettoyer les données avant envoi
      const cleanUpdates = { ...updates };
      
      // Valider la date de naissance spécifiquement
      if ('birthdate' in cleanUpdates) {
        if (!cleanUpdates.birthdate || cleanUpdates.birthdate === '') {
          // Supprimer les dates vides
          delete cleanUpdates.birthdate;
        }
      }

      // Valider les champs texte
      ['firstname', 'lastname', 'biography'].forEach(field => {
        if (field in cleanUpdates && typeof cleanUpdates[field as keyof UserProfile] === 'string') {
          const value = cleanUpdates[field as keyof UserProfile] as string;
          if (value.trim() === '') {
            delete cleanUpdates[field as keyof UserProfile];
          } else {
            // Nettoyer les espaces
            (cleanUpdates as any)[field] = value.trim();
          }
        }
      });

      console.log('📝 ProfileActions: Updating profile with cleaned data:', cleanUpdates);
      
      const updatedProfile = await profileService.updateProfile(profile.id_user, cleanUpdates);
      
      set({ 
        profile: updatedProfile,
        saving: false 
      });

      return { error: null };

    } catch (error) {
      return get().handleError('updateProfile', error, 'Erreur lors de la mise à jour du profil');
    }
  },

  updateLocation: async (locationData: { town: string; postal_code: number; latitude: number; longitude: number }) => {
    try {
      set({ saving: true, error: null });
      
      const { profile } = get();
      if (!profile) {
        throw new Error('Profil non chargé');
      }

      console.log('📍 ProfileActions: Updating location with:', locationData);
      
      await profileService.updateLocation(profile.id_user, locationData);
      
      // Recharger le profil pour récupérer la nouvelle localisation
      await get().loadProfile(profile.id_user);
      
      set({ saving: false });
      return { error: null };

    } catch (error) {
      return get().handleError('updateLocation', error, 'Erreur lors de la mise à jour de la localisation');
    }
  },

  handleError: (action: string, error: unknown, defaultMessage: string) => {
    console.error(`❌ ProfileActions: ${action} error:`, error);
    
    let errorMessage = defaultMessage;
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    set({ 
      saving: false, 
      loading: false,
      error: errorMessage 
    });

    return { 
      success: false, 
      error: new Error(errorMessage) 
    };
  },
});
