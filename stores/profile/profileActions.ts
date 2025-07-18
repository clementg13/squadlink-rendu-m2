import { UserProfile } from '@/types/profile';
import { profileService } from '@/services/profileService';
import { locationService } from '@/services/locationService';
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

      const updatedData = await profileService.updateProfile(profile.id_user, updates);
      
      set({ 
        profile: { ...profile, ...updatedData }, 
        saving: false 
      });

      return { error: null };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil';
      console.error('❌ ProfileStore - updateProfile:', errorMessage);
      set({ error: errorMessage, saving: false });
      return { error: error as Error };
    }
  },

  updateLocation: async (locationData) => {
    try {
      set({ saving: true, error: null });

      const { profile } = get();
      if (!profile) {
        throw new Error('Profil non chargé');
      }

      const locationId = await locationService.updateLocationInDatabase(
        profile.id_user,
        locationData,
        profile.id_location
      );

      const updatedLocation = await profileService.getLocationDetails(locationId);

      set({ 
        profile: { 
          ...profile, 
          id_location: locationId,
          location: updatedLocation || undefined 
        }, 
        saving: false 
      });

      return { error: null };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la localisation';
      console.error('❌ ProfileStore - updateLocation:', errorMessage);
      set({ error: errorMessage, saving: false });
      return { error: error as Error };
    }
  },

  handleError: (action: string, error: unknown, defaultMessage: string) => {
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    console.error(`❌ ProfileStore - ${action}:`, errorMessage);
    set({ error: errorMessage, saving: false });
    return { error: error as Error };
  }
});
