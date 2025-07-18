import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './authStore';
import { ProfileState, UserProfile } from '@/types/profile';
import { profileService } from '@/services/profileService';
import { hobbyService } from '@/services/hobbyService';
import { locationService } from '@/services/locationService';

interface ProfileActions {
  // Actions de base
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  
  // Actions principales
  loadProfile: () => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  updateLocation: (locationData: { town: string; postal_code: number; latitude: number; longitude: number }) => Promise<{ error: Error | null }>;
  
  // Actions pour les hobbies
  addUserHobby: (hobbyId: string, isHighlighted?: boolean) => Promise<{ error: Error | null }>;
  removeUserHobby: (hobbyId: string) => Promise<{ error: Error | null }>;
  toggleHighlightHobby: (hobbyId: string) => Promise<{ error: Error | null }>;
  
  // Actions pour les données de référence
  loadAllGyms: () => Promise<{ error: Error | null }>;
  loadGymSubscriptions: (gymId?: string) => Promise<{ error: Error | null }>;
  loadAllHobbies: () => Promise<{ error: Error | null }>;
  
  // Actions utilitaires
  initialize: () => Promise<void>;
  clearError: () => void;
  cleanup: () => void;
}

type ProfileStoreState = ProfileState & ProfileActions;

export const useProfileStore = create<ProfileStoreState>()(
  persist(
    (set, get) => ({
      // État initial
      profile: null,
      gyms: [],
      gymSubscriptions: [],
      hobbies: [],
      loading: false,
      saving: false,
      error: null,
      initialized: false,

      // Actions de base
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),
      setSaving: (saving) => set({ saving }),
      setError: (error) => set({ error }),
      setInitialized: (initialized) => set({ initialized }),

      // Chargement et mise à jour du profil
      loadProfile: async () => {
        try {
          set({ loading: true, error: null });
          
          const { user } = useAuthStore.getState();
          if (!user) throw new Error('Utilisateur non connecté');

          let profileData = await profileService.getProfile(user.id);
          
          if (!profileData) {
            profileData = await profileService.createProfile(user.id);
            set({ profile: profileData, loading: false });
            return { error: null };
          }

          // Charger les relations
          const [location, gym, gymsubscription, userHobbies] = await Promise.all([
            profileData.id_location ? profileService.getLocationDetails(profileData.id_location) : null,
            profileData.id_gym ? profileService.getGymDetails(profileData.id_gym) : null,
            profileData.id_gymsubscription ? profileService.getGymSubscriptionDetails(profileData.id_gymsubscription) : null,
            hobbyService.getUserHobbies(profileData.id_user)
          ]);

          if (location) profileData.location = location;
          if (gym) profileData.gym = gym;
          if (gymsubscription) profileData.gymsubscription = gymsubscription;
          if (userHobbies) profileData.hobbies = userHobbies;

          set({ profile: profileData, loading: false });
          return { error: null };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur de chargement du profil';
          console.error('❌ ProfileStore: Erreur lors du chargement du profil:', errorMessage);
          set({ error: errorMessage, loading: false });
          return { error: error as Error };
        }
      },

      updateProfile: async (updates: Partial<UserProfile>) => {
        try {
          set({ saving: true, error: null });

          const { profile } = get();
          if (!profile) throw new Error('Profil non chargé');

          const updatedProfile = await profileService.updateProfile(profile.id_user, updates);
          set({ profile: { ...profile, ...updatedProfile }, saving: false });
          return { error: null };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil';
          console.error('❌ ProfileStore: Erreur lors de la mise à jour du profil:', errorMessage);
          set({ error: errorMessage, saving: false });
          return { error: error as Error };
        }
      },

      updateLocation: async (locationData) => {
        try {
          set({ saving: true, error: null });

          const { profile } = get();
          if (!profile) throw new Error('Profil non chargé');

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
              location: updatedLocation ?? undefined 
            }, 
            saving: false 
          });

          return { error: null };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la localisation';
          console.error('❌ ProfileStore: Erreur lors de la mise à jour de la localisation:', errorMessage);
          set({ error: errorMessage, saving: false });
          return { error: error as Error };
        }
      },

      // Actions pour les hobbies
      addUserHobby: async (hobbyId: string, isHighlighted = false) => {
        try {
          set({ saving: true, error: null });
          
          const { profile } = get();
          if (!profile) throw new Error('Profil non chargé');

          if (isHighlighted) {
            const highlightedCount = profile.hobbies?.filter(h => h.is_highlighted).length || 0;
            if (highlightedCount >= 3) {
              throw new Error('Vous ne pouvez avoir que 3 hobbies en favoris maximum');
            }
          }

          const newHobby = await hobbyService.addUserHobby(profile.id_user, hobbyId, isHighlighted);
          const updatedHobbies = [...(profile.hobbies || []), newHobby];
          
          set({ 
            profile: { ...profile, hobbies: updatedHobbies },
            saving: false 
          });

          return { error: null };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'ajout du hobby';
          console.error('❌ ProfileStore: Erreur lors de l\'ajout du hobby:', errorMessage);
          set({ error: errorMessage, saving: false });
          return { error: error as Error };
        }
      },

      removeUserHobby: async (hobbyId: string) => {
        try {
          set({ saving: true, error: null });
          
          const { profile } = get();
          if (!profile) throw new Error('Profil non chargé');

          await hobbyService.removeUserHobby(profile.id_user, hobbyId);
          const updatedHobbies = profile.hobbies?.filter(h => h.id_hobbie !== hobbyId) || [];
          
          set({ 
            profile: { ...profile, hobbies: updatedHobbies },
            saving: false 
          });

          return { error: null };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression du hobby';
          console.error('❌ ProfileStore: Erreur lors de la suppression du hobby:', errorMessage);
          set({ error: errorMessage, saving: false });
          return { error: error as Error };
        }
      },

      toggleHighlightHobby: async (hobbyId: string) => {
        try {
          set({ saving: true, error: null });
          
          const { profile } = get();
          if (!profile) throw new Error('Profil non chargé');

          const userHobby = profile.hobbies?.find(h => h.id_hobbie === hobbyId);
          if (!userHobby) throw new Error('Hobby non trouvé');

          const newHighlightStatus = !userHobby.is_highlighted;

          if (newHighlightStatus) {
            const highlightedCount = profile.hobbies?.filter(h => h.is_highlighted && h.id_hobbie !== hobbyId).length || 0;
            if (highlightedCount >= 3) {
              throw new Error('Vous ne pouvez avoir que 3 hobbies en favoris maximum');
            }
          }

          await hobbyService.toggleHighlightHobby(profile.id_user, hobbyId, newHighlightStatus);
          
          const updatedHobbies = profile.hobbies?.map(h => 
            h.id_hobbie === hobbyId ? { ...h, is_highlighted: newHighlightStatus } : h
          ) || [];
          
          set({ 
            profile: { ...profile, hobbies: updatedHobbies },
            saving: false 
          });

          return { error: null };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la modification du favori';
          console.error('❌ ProfileStore: Erreur lors du toggle highlight:', errorMessage);
          set({ error: errorMessage, saving: false });
          return { error: error as Error };
        }
      },

      // Actions pour les données de référence
      loadAllGyms: async () => {
        try {
          const gyms = await profileService.getAllGyms();
          set({ gyms });
          return { error: null };
        } catch (error) {
          console.error('❌ ProfileStore: Erreur lors du chargement des salles:', error);
          return { error: error as Error };
        }
      },

      loadGymSubscriptions: async (gymId?: string) => {
        try {
          const gymSubscriptions = await profileService.getGymSubscriptions(gymId);
          set({ gymSubscriptions });
          return { error: null };
        } catch (error) {
          console.error('❌ ProfileStore: Erreur lors du chargement des abonnements:', error);
          return { error: error as Error };
        }
      },

      loadAllHobbies: async () => {
        try {
          const hobbies = await profileService.getAllHobbies();
          set({ hobbies });
          return { error: null };
        } catch (error) {
          console.error('❌ ProfileStore: Erreur lors du chargement des hobbies:', error);
          return { error: error as Error };
        }
      },

      // Initialisation
      initialize: async () => {
        try {
          set({ loading: true, error: null });
          
          await Promise.all([
            get().loadAllGyms(),
            get().loadGymSubscriptions(),
            get().loadAllHobbies(),
          ]);
          
          const { user } = useAuthStore.getState();
          if (user) {
            await get().loadProfile();
          } else {
            set({ loading: false });
          }
          
          set({ initialized: true });
        } catch (error) {
          console.error('❌ ProfileStore: Erreur lors de l\'initialisation:', error);
          set({ loading: false, initialized: true });
        }
      },

      // Utilitaires
      clearError: () => set({ error: null }),
      
      cleanup: () => set({ 
        profile: null, 
        gyms: [],
        gymSubscriptions: [],
        hobbies: [],
        loading: false, 
        saving: false, 
        error: null, 
        initialized: false 
      }),
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        gyms: state.gyms,
        gymSubscriptions: state.gymSubscriptions,
        hobbies: state.hobbies,
        initialized: state.initialized,
      }),
    }
  )
);

// Hooks optimisés
export const useProfile = () => {
  const store = useProfileStore();
  return {
    profile: store.profile,
    gyms: store.gyms,
    gymSubscriptions: store.gymSubscriptions,
    hobbies: store.hobbies,
    loading: store.loading,
    saving: store.saving,
    error: store.error,
    initialized: store.initialized,
    loadProfile: store.loadProfile,
    updateProfile: store.updateProfile,
    updateLocation: store.updateLocation,
    loadAllGyms: store.loadAllGyms,
    loadGymSubscriptions: store.loadGymSubscriptions,
    loadAllHobbies: store.loadAllHobbies,
    addUserHobby: store.addUserHobby,
    removeUserHobby: store.removeUserHobby,
    toggleHighlightHobby: store.toggleHighlightHobby,
    clearError: store.clearError,
    initialize: store.initialize,
    cleanup: store.cleanup
  };
};

// Hooks spécialisés
export const useProfileData = () => useProfileStore((state) => state.profile);
export const useProfileLoading = () => useProfileStore((state) => state.loading);
export const useProfileSaving = () => useProfileStore((state) => state.saving);
export const useProfileError = () => useProfileStore((state) => state.error);
export const useProfileInitialized = () => useProfileStore((state) => state.initialized);