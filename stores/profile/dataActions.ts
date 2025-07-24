import { profileService } from '@/services/profileService';
import { sportService } from '@/services/sportService';
import { socialMediaService } from '@/services/socialMediaService';
import { useAuthStore } from '../authStore';
import { Sport, SportLevel, SocialMedia } from '@/types/profile';

export interface DataActions {
  loadAllGyms: () => Promise<{ error: Error | null }>;
  loadGymSubscriptions: (gymId?: string) => Promise<{ error: Error | null }>;
  loadAllHobbies: () => Promise<{ error: Error | null }>;
  loadAllSports: () => Promise<{ error: Error | null }>;
  loadAllSportLevels: () => Promise<{ error: Error | null }>;
  loadAllSocialMedias: () => Promise<{ error: Error | null }>;
  initialize: () => Promise<void>;
  cleanup: () => void;
}

export const createDataActions = (set: any, get: any): DataActions => ({
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

  loadAllSocialMedias: async () => {
    try {
      const socialMedias = await socialMediaService.getAllSocialMedias();
      set({ socialMedias });
      return { error: null };
    } catch (error) {
      console.error('❌ ProfileStore - loadAllSocialMedias:', error);
      return { error: error as Error };
    }
  },

  initialize: async () => {
    try {
      const currentState = get();
      const needsReinit = currentState.sports.length === 0 || 
                         currentState.sportLevels.length === 0 || 
                         currentState.socialMedias.length === 0;
      
      if (currentState.initialized && !needsReinit) {
        return;
      }

      set({ loading: true, error: null, initialized: false });
      
      set({ 
        sports: [],
        sportLevels: [],
        hobbies: [],
        gyms: [],
        gymSubscriptions: [],
        socialMedias: []
      });
      
      // Charger toutes les données en parallèle
      const [sportsResult, sportLevelsResult, socialMediasResult] = await Promise.allSettled([
        sportService.getAllSports(),
        sportService.getAllSportLevels(),
        socialMediaService.getAllSocialMedias()
      ]);

      set((state: any) => ({ 
        ...state, 
        sports: sportsResult.status === 'fulfilled' ? sportsResult.value : [],
        sportLevels: sportLevelsResult.status === 'fulfilled' ? sportLevelsResult.value : [],
        socialMedias: socialMediasResult.status === 'fulfilled' ? socialMediasResult.value : []
      }));

      await Promise.allSettled([
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
      console.error('❌ ProfileStore - initialize:', error);
      set({ 
        loading: false, 
        initialized: true,
        error: 'Erreur lors de l\'initialisation' 
      });
    }
  },

  cleanup: () => {
    set({ 
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
      initialized: false 
    });
  }
});
