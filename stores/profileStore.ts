import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './authStore';
import { 
  ProfileState, 
  UserProfile, 
  Gym, 
  GymSubscription, 
  Hobbie, 
  Sport, 
  SportLevel 
} from '@/types/profile';
import { profileService } from '@/services/profileService';
import { hobbyService } from '@/services/hobbyService';
import { sportService } from '@/services/sportService';
import { locationService } from '@/services/locationService';

// Types pour les actions du store
interface ProfileActions {
  // Actions de base
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Actions principales
  loadProfile: () => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  
  // Actions pour la localisation
  updateLocation: (locationData: {
    town: string;
    postal_code: number;
    latitude: number;
    longitude: number;
  }) => Promise<{ error: Error | null }>;
  
  // Actions pour les hobbies
  addUserHobby: (hobbyId: string, isHighlighted?: boolean) => Promise<{ error: Error | null }>;
  removeUserHobby: (hobbyId: string) => Promise<{ error: Error | null }>;
  toggleHighlightHobby: (hobbyId: string) => Promise<{ error: Error | null }>;
  
  // Actions pour les sports
  addUserSport: (sportId: string, levelId: string) => Promise<{ error: Error | null }>;
  removeUserSport: (sportId: string) => Promise<{ error: Error | null }>;
  
  // Actions pour les données de référence
  loadAllGyms: () => Promise<{ error: Error | null }>;
  loadGymSubscriptions: (gymId?: string) => Promise<{ error: Error | null }>;
  loadAllHobbies: () => Promise<{ error: Error | null }>;
  loadAllSports: () => Promise<{ error: Error | null }>;
  loadAllSportLevels: () => Promise<{ error: Error | null }>;
  
  // Actions système
  initialize: () => Promise<void>;
  cleanup: () => void;

  // Méthode utilitaire pour la gestion d'erreurs
  handleError: (action: string, error: unknown, defaultMessage: string) => { error: Error };
}

type ProfileStoreState = ProfileState & ProfileActions;

// Configuration du store
export const useProfileStore = create<ProfileStoreState>()(
  persist(
    (set, get) => ({
      // État initial
      profile: null,
      gyms: [],
      gymSubscriptions: [],
      hobbies: [],
      sports: [],
      sportLevels: [],
      loading: false,
      saving: false,
      error: null,
      initialized: false,

      // Actions de base
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),
      setSaving: (saving) => set({ saving }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Action principale : Chargement du profil
      loadProfile: async () => {
        try {
          set({ loading: true, error: null });
          
          const { user } = useAuthStore.getState();
          if (!user) {
            throw new Error('Utilisateur non connecté');
          }

          console.log('🔄 ProfileStore: Chargement du profil pour l\'utilisateur:', user.id);

          // Récupérer ou créer le profil
          let profileData = await profileService.getProfile(user.id);
          if (!profileData) {
            console.log('➕ ProfileStore: Création d\'un nouveau profil');
            profileData = await profileService.createProfile(user.id);
            set({ profile: profileData, loading: false });
            return { error: null };
          }

          console.log('✅ ProfileStore: Profil trouvé:', profileData.id_user);

          // Charger les relations en série pour éviter les problèmes de concurrence
            let location: UserProfile['location'] | undefined;
            let gym: Gym | undefined;
            let gymsubscription: GymSubscription | undefined;
            let userHobbies: UserProfile['hobbies'] | undefined;
            let userSports: UserProfile['sports'] | undefined;

          try {
            // Charger la localisation si elle existe
            if (profileData.id_location) {
              console.log('📍 ProfileStore: Chargement de la localisation');
              const loc = await profileService.getLocationDetails(profileData.id_location);
              location = loc === null ? undefined : loc;
            }
          } catch (error) {
            console.warn('⚠️ ProfileStore: Erreur lors du chargement de la localisation:', error);
          }

          try {
            // Charger la salle de sport si elle existe
            if (profileData.id_gym) {
              console.log('🏋️ ProfileStore: Chargement de la salle de sport');
              const gymResult = await profileService.getGymDetails(profileData.id_gym);
              gym = gymResult === null ? undefined : gymResult;
            }
          } catch (error) {
            console.warn('⚠️ ProfileStore: Erreur lors du chargement de la salle:', error);
          }

          try {
            // Charger l'abonnement salle si il existe
            if (profileData.id_gymsubscription) {
              console.log('💳 ProfileStore: Chargement de l\'abonnement');
              const gymSubResult = await profileService.getGymSubscriptionDetails(profileData.id_gymsubscription);
              gymsubscription = gymSubResult === null ? undefined : gymSubResult;
            }
          } catch (error) {
            console.warn('⚠️ ProfileStore: Erreur lors du chargement de l\'abonnement:', error);
          }

          try {
            // Charger les hobbies utilisateur
            console.log('🎯 ProfileStore: Chargement des hobbies');
            userHobbies = await hobbyService.getUserHobbies(profileData.id_user);
          } catch (error) {
            console.warn('⚠️ ProfileStore: Erreur lors du chargement des hobbies:', error);
            userHobbies = [];
          }

          try {
            // Charger les sports utilisateur
            console.log('⚽ ProfileStore: Chargement des sports');
            userSports = await sportService.getUserSports(profileData.id_user);
          } catch (error) {
            console.warn('⚠️ ProfileStore: Erreur lors du chargement des sports:', error);
            userSports = [];
          }

          // Populer les relations
          const enrichedProfile: UserProfile = {
            ...profileData,
            location: location || undefined,
            gym: gym || undefined,
            gymsubscription: gymsubscription || undefined,
            hobbies: userHobbies || [],
            sports: userSports || []
          };

          console.log('✅ ProfileStore: Profil enrichi avec succès');
          set({ profile: enrichedProfile, loading: false });
          return { error: null };

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur de chargement du profil';
          console.error('❌ ProfileStore - loadProfile:', error);
          set({ error: errorMessage, loading: false });
          return { error: error as Error };
        }
      },

      // Action principale : Mise à jour du profil
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

      // Action pour la localisation
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

      // Actions pour les hobbies
      addUserHobby: async (hobbyId: string, isHighlighted = false) => {
        try {
          set({ saving: true, error: null });
          
          const { profile } = get();
          if (!profile) {
            throw new Error('Profil non chargé');
          }

          // Validation des contraintes métier
          if (isHighlighted) {
            const highlightedCount = profile.hobbies?.filter(h => h.is_highlighted).length || 0;
            if (highlightedCount >= 3) {
              throw new Error('Vous ne pouvez avoir que 3 hobbies en favoris maximum');
            }
          }

          const newHobby = await hobbyService.addUserHobby(profile.id_user, hobbyId, isHighlighted);
          
          set({ 
            profile: { 
              ...profile, 
              hobbies: [...(profile.hobbies || []), newHobby] 
            },
            saving: false 
          });

          return { error: null };

        } catch (error) {
          return get().handleError('addUserHobby', error, 'Erreur lors de l\'ajout du hobby');
        }
      },

      removeUserHobby: async (hobbyId: string) => {
        try {
          set({ saving: true, error: null });
          
          const { profile } = get();
          if (!profile) {
            throw new Error('Profil non chargé');
          }

          await hobbyService.removeUserHobby(profile.id_user, hobbyId);
          
          set({ 
            profile: { 
              ...profile, 
              hobbies: profile.hobbies?.filter(h => h.id_hobbie !== hobbyId) || [] 
            },
            saving: false 
          });

          return { error: null };

        } catch (error) {
          return get().handleError('removeUserHobby', error, 'Erreur lors de la suppression du hobby');
        }
      },

      toggleHighlightHobby: async (hobbyId: string) => {
        try {
          set({ saving: true, error: null });
          
          const { profile } = get();
          if (!profile) {
            throw new Error('Profil non chargé');
          }

          const userHobby = profile.hobbies?.find(h => h.id_hobbie === hobbyId);
          if (!userHobby) {
            throw new Error('Hobby non trouvé');
          }

          const newHighlightStatus = !userHobby.is_highlighted;

          // Validation des contraintes
          if (newHighlightStatus) {
            const highlightedCount = profile.hobbies?.filter(h => h.is_highlighted && h.id_hobbie !== hobbyId).length || 0;
            if (highlightedCount >= 3) {
              throw new Error('Vous ne pouvez avoir que 3 hobbies en favoris maximum');
            }
          }

          await hobbyService.toggleHighlightHobby(profile.id_user, hobbyId, newHighlightStatus);
          
          set({ 
            profile: { 
              ...profile, 
              hobbies: profile.hobbies?.map(h => 
                h.id_hobbie === hobbyId ? { ...h, is_highlighted: newHighlightStatus } : h
              ) || [] 
            },
            saving: false 
          });

          return { error: null };

        } catch (error) {
          return get().handleError('toggleHighlightHobby', error, 'Erreur lors de la modification du favori');
        }
      },

      // Actions pour les sports
      addUserSport: async (sportId: string, levelId: string) => {
        try {
          set({ saving: true, error: null });
          
          const { profile } = get();
          if (!profile) {
            throw new Error('Profil non chargé');
          }

          const newSport = await sportService.addUserSport(profile.id_user, sportId, levelId);
          
          set({ 
            profile: { 
              ...profile, 
              sports: [...(profile.sports || []), newSport] 
            },
            saving: false 
          });

          return { error: null };

        } catch (error) {
          return get().handleError('addUserSport', error, 'Erreur lors de l\'ajout du sport');
        }
      },

      removeUserSport: async (sportId: string) => {
        try {
          set({ saving: true, error: null });
          
          const { profile } = get();
          if (!profile) {
            throw new Error('Profil non chargé');
          }

          await sportService.removeUserSport(profile.id_user, sportId);
          
          set({ 
            profile: { 
              ...profile, 
              sports: profile.sports?.filter(s => s.id_sport !== sportId) || [] 
            },
            saving: false 
          });

          return { error: null };

        } catch (error) {
          return get().handleError('removeUserSport', error, 'Erreur lors de la suppression du sport');
        }
      },

      // Actions pour les données de référence
      loadAllGyms: async () => {
        try {
          const gyms = await profileService.getAllGyms();
          set({ gyms });
          return { error: null };
        } catch (error) {
          console.error('❌ ProfileStore - loadAllGyms:', error);
          return { error: error as Error };
        }
      },

      loadGymSubscriptions: async (gymId?: string) => {
        try {
          const gymSubscriptions = await profileService.getGymSubscriptions(gymId);
          set({ gymSubscriptions });
          return { error: null };
        } catch (error) {
          console.error('❌ ProfileStore - loadGymSubscriptions:', error);
          return { error: error as Error };
        }
      },

      loadAllHobbies: async () => {
        try {
          const hobbies = await profileService.getAllHobbies();
          set({ hobbies });
          return { error: null };
        } catch (error) {
          console.error('❌ ProfileStore - loadAllHobbies:', error);
          return { error: error as Error };
        }
      },

      loadAllSports: async () => {
        try {
          const sports = await sportService.getAllSports();
          set({ sports });
          return { error: null };
        } catch (error) {
          console.error('❌ ProfileStore - loadAllSports:', error);
          return { error: error as Error };
        }
      },

      loadAllSportLevels: async () => {
        try {
          const sportLevels = await sportService.getAllSportLevels();
          set({ sportLevels });
          return { error: null };
        } catch (error) {
          console.error('❌ ProfileStore - loadAllSportLevels:', error);
          return { error: error as Error };
        }
      },

      // Initialisation du store
      initialize: async () => {
        try {
          // Forcer la re-initialisation si les données essentielles manquent
          const currentState = get();
          const needsReinit = currentState.sports.length === 0 || currentState.sportLevels.length === 0;
          
          if (currentState.initialized && !needsReinit) {
            return;
          }

          set({ loading: true, error: null, initialized: false });
          
          // Forcer le rechargement en remettant à zéro les données
          set({ 
            sports: [],
            sportLevels: [],
            hobbies: [],
            gyms: [],
            gymSubscriptions: []
          });
          
          // Charger les sports directement
          try {
            const sportsFromService = await sportService.getAllSports();
            set(state => ({ 
              ...state, 
              sports: sportsFromService 
            }));
          } catch (error) {
            console.error('❌ ProfileStore: Erreur lors du chargement des sports:', error);
          }

          // Charger les niveaux directement
          try {
            const levelsFromService = await sportService.getAllSportLevels();
            set(state => ({ 
              ...state, 
              sportLevels: levelsFromService 
            }));
          } catch (error) {
            console.error('❌ ProfileStore: Erreur lors du chargement des niveaux:', error);
          }

          // Charger les autres données
          await Promise.allSettled([
            get().loadAllGyms(),
            get().loadGymSubscriptions(),
            get().loadAllHobbies(),
          ]);
          
          // Charger le profil utilisateur si connecté
          const { user } = useAuthStore.getState();
          if (user) {
            await get().loadProfile();
          } else {
            set({ loading: false });
          }
          
          set({ initialized: true });

        } catch (error) {
          console.error('❌ ProfileStore - initialize:', error);
          set({ 
            loading: false, 
            initialized: true,
            error: 'Erreur lors de l\'initialisation' 
          });
        }
      },

      // Nettoyage
      cleanup: () => {
        set({ 
          profile: null, 
          gyms: [],
          gymSubscriptions: [],
          hobbies: [],
          sports: [],
          sportLevels: [],
          loading: false, 
          saving: false, 
          error: null, 
          initialized: false 
        });
      },

      // Méthode utilitaire pour la gestion d'erreurs
      handleError: (action: string, error: unknown, defaultMessage: string) => {
        const errorMessage = error instanceof Error ? error.message : defaultMessage;
        console.error(`❌ ProfileStore - ${action}:`, errorMessage);
        set({ error: errorMessage, saving: false });
        return { error: error as Error };
      },
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Optimisation : ne persister que les données essentielles
      partialize: (state) => ({
        profile: state.profile,
        gyms: state.gyms,
        gymSubscriptions: state.gymSubscriptions,
        hobbies: state.hobbies,
        sports: state.sports,
        sportLevels: state.sportLevels,
        initialized: state.initialized,
      }),
      // Configuration pour éviter l'hydratation lors du chargement
      skipHydration: false,
    }
  )
);

// Hook principal optimisé avec sélecteurs
export const useProfile = () => {
  const store = useProfileStore();
  
  return {
    // État
    profile: store.profile,
    gyms: store.gyms,
    gymSubscriptions: store.gymSubscriptions,
    hobbies: store.hobbies,
    sports: store.sports,
    sportLevels: store.sportLevels,
    loading: store.loading,
    saving: store.saving,
    error: store.error,
    initialized: store.initialized,
    
    // Actions principales
    loadProfile: store.loadProfile,
    updateProfile: store.updateProfile,
    updateLocation: store.updateLocation,
    
    // Actions hobbies
    addUserHobby: store.addUserHobby,
    removeUserHobby: store.removeUserHobby,
    toggleHighlightHobby: store.toggleHighlightHobby,
    
    // Actions sports
    addUserSport: store.addUserSport,
    removeUserSport: store.removeUserSport,
    
    // Actions données de référence
    loadAllGyms: store.loadAllGyms,
    loadGymSubscriptions: store.loadGymSubscriptions,
    loadAllHobbies: store.loadAllHobbies,
    loadAllSports: store.loadAllSports,
    loadAllSportLevels: store.loadAllSportLevels,
    
    // Actions système
    initialize: store.initialize,
    cleanup: store.cleanup,
    clearError: store.clearError,
  };
};

// Hooks spécialisés pour optimiser les re-renders
export const useProfileData = () => useProfileStore(state => state.profile);
export const useProfileLoading = () => useProfileStore(state => state.loading);
export const useProfileSaving = () => useProfileStore(state => state.saving);
export const useProfileError = () => useProfileStore(state => state.error);
export const useProfileInitialized = () => useProfileStore(state => state.initialized);

// Hooks pour les données de référence
export const useGyms = () => useProfileStore(state => state.gyms);
export const useGymSubscriptions = () => useProfileStore(state => state.gymSubscriptions);
export const useHobbies = () => useProfileStore(state => state.hobbies);
export const useSports = () => useProfileStore(state => state.sports);
export const useSportLevels = () => useProfileStore(state => state.sportLevels);

// Hook pour les hobbies utilisateur avec logique métier
export const useUserHobbies = () => {
  return useProfileStore(state => {
    const hobbies = state.profile?.hobbies || [];
    return {
      all: hobbies,
      highlighted: hobbies.filter(h => h.is_highlighted),
      regular: hobbies.filter(h => !h.is_highlighted),
      canHighlight: hobbies.filter(h => h.is_highlighted).length < 3,
    };
  });
};

// Hook pour les sports utilisateur
export const useUserSports = () => {
  return useProfileStore(state => state.profile?.sports || []);
};