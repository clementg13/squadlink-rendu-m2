import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProfileState } from '@/types/profile';
import { createProfileActions, ProfileActions } from './profile/profileActions';
import { createHobbyActions, HobbyActions } from './profile/hobbyActions';
import { createSportActions, SportActions } from './profile/sportActions';
import { createSocialMediaActions, SocialMediaActions } from './profile/socialMediaActions';
import { createDataActions, DataActions } from './profile/dataActions';

type AllActions = ProfileActions & HobbyActions & SportActions & SocialMediaActions & DataActions;
type ProfileStoreState = ProfileState & AllActions;

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
      socialMedias: [],
      loading: false,
      saving: false,
      error: null,
      initialized: false,

      // Actions combinées
      ...createProfileActions(set, get),
      ...createHobbyActions(set, get),
      ...createSportActions(set, get),
      ...createSocialMediaActions(set, get),
      ...createDataActions(set, get),
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        gyms: state.gyms,
        gymSubscriptions: state.gymSubscriptions,
        hobbies: state.hobbies,
        sports: state.sports,
        sportLevels: state.sportLevels,
        socialMedias: state.socialMedias,
        initialized: state.initialized,
      }),
      skipHydration: false,
    }
  )
);

// Hook principal optimisé
export const useProfile = () => {
  const store = useProfileStore();
  
  return {
    // État du profil
    profile: store.profile,
    loading: store.loading,
    saving: store.saving,
    error: store.error,
    initialized: store.initialized,
    
    // Données de référence
    hobbies: store.hobbies,
    gyms: store.gyms,
    gymSubscriptions: store.gymSubscriptions,
    sports: store.sports,
    sportLevels: store.sportLevels,
    socialMedias: store.socialMedias,
    
    // Actions du profil
    loadProfile: store.loadProfile,
    updateProfile: store.updateProfile,
    removeGymSubscription: store.removeGymSubscription,
    setProfile: store.setProfile,
    clearError: store.clearError,
    
    // Actions de localisation
    updateLocation: store.updateLocation,
    
    // Actions sur les données
    initialize: store.initialize,
    loadAllGyms: store.loadAllGyms,
    loadGymSubscriptions: store.loadGymSubscriptions,
    loadAllHobbies: store.loadAllHobbies,
    loadAllSports: store.loadAllSports,
    loadAllSportLevels: store.loadAllSportLevels,
    loadAllSocialMedias: store.loadAllSocialMedias,
    
    // Actions sur les hobbies
    addUserHobby: store.addUserHobby,
    removeUserHobby: store.removeUserHobby,
    toggleHighlightHobby: store.toggleHighlightHobby,
    
    // Actions sur les sports  
    addUserSport: store.addUserSport,
    removeUserSport: store.removeUserSport,
    
    // Actions sur les réseaux sociaux
    addUserSocialMedia: store.addUserSocialMedia,
    updateUserSocialMedia: store.updateUserSocialMedia,
    removeUserSocialMedia: store.removeUserSocialMedia,
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
export const useSocialMedias = () => useProfileStore(state => state.socialMedias);

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

// Hook pour les réseaux sociaux utilisateur
export const useUserSocialMedias = () => {
  return useProfileStore(state => state.profile?.socialMedias || []);
};