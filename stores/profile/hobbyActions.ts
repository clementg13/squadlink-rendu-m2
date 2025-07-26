import { ProfileHobby } from '@/types/profile';
import { hobbyService } from '@/services/hobbyService';

export interface HobbyActions {
  addUserHobby: (hobbyId: string, isHighlighted?: boolean) => Promise<{ error: Error | null }>;
  removeUserHobby: (hobbyId: string) => Promise<{ error: Error | null }>;
  toggleHighlightHobby: (hobbyId: string) => Promise<{ error: Error | null }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createHobbyActions = (set: any, get: any): HobbyActions => ({
  addUserHobby: async (hobbyId: string, isHighlighted = false) => {
    try {
      set({ saving: true, error: null });
      
      const { profile } = get();
      if (!profile) {
        throw new Error('Profil non chargé');
      }

      if (isHighlighted) {
        const highlightedCount = profile.hobbies?.filter((h: ProfileHobby) => h.is_highlighted).length || 0;
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
          hobbies: profile.hobbies?.filter((h: ProfileHobby) => h.id_hobbie !== hobbyId) || [] 
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

      const userHobby = profile.hobbies?.find((h: ProfileHobby) => h.id_hobbie === hobbyId);
      if (!userHobby) {
        throw new Error('Hobby non trouvé');
      }

      const newHighlightStatus = !userHobby.is_highlighted;

      if (newHighlightStatus) {
        const highlightedCount = profile.hobbies?.filter((h: ProfileHobby) => h.is_highlighted && h.id_hobbie !== hobbyId).length || 0;
        if (highlightedCount >= 3) {
          throw new Error('Vous ne pouvez avoir que 3 hobbies en favoris maximum');
        }
      }

      await hobbyService.toggleHighlightHobby(profile.id_user, hobbyId, newHighlightStatus);
      
      set({ 
        profile: { 
          ...profile, 
          hobbies: profile.hobbies?.map((h: ProfileHobby) => 
            h.id_hobbie === hobbyId ? { ...h, is_highlighted: newHighlightStatus } : h
          ) || [] 
        },
        saving: false 
      });

      return { error: null };

    } catch (error) {
      return get().handleError('toggleHighlightHobby', error, 'Erreur lors de la modification du favori');
    }
  }
});
