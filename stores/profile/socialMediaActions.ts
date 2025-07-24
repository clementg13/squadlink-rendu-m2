import { socialMediaService } from '@/services/socialMediaService';

export interface SocialMediaActions {
  addUserSocialMedia: (socialMediaId: string, username: string) => Promise<{ error: Error | null }>;
  updateUserSocialMedia: (socialMediaId: string, username: string) => Promise<{ error: Error | null }>;
  removeUserSocialMedia: (socialMediaId: string) => Promise<{ error: Error | null }>;
}

export const createSocialMediaActions = (set: any, get: any): SocialMediaActions => ({
  addUserSocialMedia: async (socialMediaId: string, username: string) => {
    try {
      set({ saving: true, error: null });
      
      const { profile } = get();
      if (!profile) {
        throw new Error('Profil non chargé');
      }

      const newSocialMedia = await socialMediaService.addUserSocialMedia(profile.id_user, socialMediaId, username);
      
      set({ 
        profile: { 
          ...profile, 
          socialMedias: [...(profile.socialMedias || []), newSocialMedia] 
        },
        saving: false 
      });

      return { error: null };

    } catch (error) {
      return get().handleError('addUserSocialMedia', error, 'Erreur lors de l\'ajout du réseau social');
    }
  },

  updateUserSocialMedia: async (socialMediaId: string, username: string) => {
    try {
      set({ saving: true, error: null });
      
      const { profile } = get();
      if (!profile) {
        throw new Error('Profil non chargé');
      }

      await socialMediaService.updateUserSocialMedia(profile.id_user, socialMediaId, username);
      
      set({ 
        profile: { 
          ...profile, 
          socialMedias: profile.socialMedias?.map((s: any) => 
            s.id_social_media === socialMediaId ? { ...s, username } : s
          ) || [] 
        },
        saving: false 
      });

      return { error: null };

    } catch (error) {
      return get().handleError('updateUserSocialMedia', error, 'Erreur lors de la mise à jour du réseau social');
    }
  },

  removeUserSocialMedia: async (socialMediaId: string) => {
    try {
      set({ saving: true, error: null });
      
      const { profile } = get();
      if (!profile) {
        throw new Error('Profil non chargé');
      }

      await socialMediaService.removeUserSocialMedia(profile.id_user, socialMediaId);
      
      set({ 
        profile: { 
          ...profile, 
          socialMedias: profile.socialMedias?.filter((s: any) => s.id_social_media !== socialMediaId) || [] 
        },
        saving: false 
      });

      return { error: null };

    } catch (error) {
      return get().handleError('removeUserSocialMedia', error, 'Erreur lors de la suppression du réseau social');
    }
  }
});
