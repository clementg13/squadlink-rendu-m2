import { ProfileSport } from '@/types/profile';
import { sportService } from '@/services/sportService';

export interface SportActions {
  addUserSport: (sportId: string, levelId: string) => Promise<{ error: Error | null }>;
  removeUserSport: (sportId: string) => Promise<{ error: Error | null }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createSportActions = (set: any, get: any): SportActions => ({
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
          sports: profile.sports?.filter((s: ProfileSport) => s.id_sport !== sportId) || [] 
        },
        saving: false 
      });

      return { error: null };

    } catch (error) {
      return get().handleError('removeUserSport', error, 'Erreur lors de la suppression du sport');
    }
  }
});
