import { profileService } from '@/services/profileService';
import { gymService } from '@/services/gymService';
import { sportService } from '@/services/sportService';
import { socialMediaService } from '@/services/socialMediaService';
import { supabase } from '@/lib/supabase';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createDataActions = (set: any, get: any): DataActions => ({
  loadAllGyms: async () => {
    try {
      const gyms = await gymService.getAllGyms();
      set({ gyms });
      return { error: null };
    } catch (error) {
      console.error('❌ DataActions - loadAllGyms:', error);
      set({ gyms: [] });
      return { error: error as Error };
    }
  },

  loadGymSubscriptions: async (gymId?: string) => {
    try {
      const gymSubscriptions = gymId ? 
        await profileService.getGymSubscriptions(gymId) : 
        await profileService.getAllGymSubscriptions();
      
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
      
      if (currentState.loading) {
        return;
      }
      
      const needsReinit = currentState.sports.length === 0 || 
                         currentState.sportLevels.length === 0 || 
                         currentState.socialMedias.length === 0 ||
                         currentState.gymSubscriptions.length === 0;
      
      if (currentState.initialized && !needsReinit) {
        return;
      }

      console.log('🔄 ProfileStore: Starting initialization...');
      set({ loading: true, error: null, initialized: false });
      
      // Charger le profil en priorité pendant l'initialisation
      const profilePromise = (async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            console.log('👤 ProfileStore: Loading profile during initialization...');
            const profile = await profileService.getProfile(user.id, true);
            if (profile) {
              console.log('✅ ProfileStore: Profile loaded during initialization');
              set({ profile });
            }
          }
        } catch (error) {
          console.error('⚠️ ProfileStore: Profile loading during init failed:', error);
        }
      })();
      
      const [sportsResult, sportLevelsResult, socialMediasResult, gymsResult, gymSubscriptionsResult, hobbiesResult] = await Promise.allSettled([
        sportService.getAllSports(),
        sportService.getAllSportLevels(),
        socialMediaService.getAllSocialMedias(),
        gymService.getAllGyms(),
        gymService.getAllGymSubscriptions(),
        profileService.getAllHobbies()
      ]);

      // Attendre que le profil soit chargé aussi
      await profilePromise;

      if (gymsResult.status === 'rejected') {
        console.error('❌ ProfileStore: Gyms loading failed:', gymsResult.reason);
      }

      const criticalResults = [sportsResult, sportLevelsResult, socialMediasResult, gymSubscriptionsResult];
      const hasCriticalErrors = criticalResults.some(result => result.status === 'rejected');

      if (hasCriticalErrors) {
        throw new Error('Erreur lors du chargement des données critiques');
      }

      set({ 
        sports: sportsResult.status === 'fulfilled' ? sportsResult.value : [],
        sportLevels: sportLevelsResult.status === 'fulfilled' ? sportLevelsResult.value : [],
        socialMedias: socialMediasResult.status === 'fulfilled' ? socialMediasResult.value : [],
        gyms: gymsResult.status === 'fulfilled' ? gymsResult.value : [],
        gymSubscriptions: gymSubscriptionsResult.status === 'fulfilled' ? gymSubscriptionsResult.value : [],
        hobbies: hobbiesResult.status === 'fulfilled' ? hobbiesResult.value : []
      });
      
      set({ initialized: true, loading: false });
      console.log('✅ ProfileStore: Initialization completed with profile');

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