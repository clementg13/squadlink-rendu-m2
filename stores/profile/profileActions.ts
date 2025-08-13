import { UserProfile } from '@/types/profile';
import { profileService } from '@/services/profileService';
import { supabase } from '@/lib/supabase'; // ✅ Ajouter cet import
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createProfileActions = (set: any, get: any): ProfileActions => ({
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setSaving: (saving) => set({ saving }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  loadProfile: async () => {
    try {
      const currentState = get();
      
      if (currentState.loading) {
        console.log('⏳ ProfileStore: Already loading profile, skipping...');
        return { error: null };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ profile: null, loading: false });
        return { error: new Error('Utilisateur non connecté') };
      }

      console.log('🔄 ProfileStore: Loading profile for user:', user.id);
      set({ loading: true, error: null });

      // Forcer le rechargement depuis la base de données
      const profile = await profileService.getProfile(user.id, true);
      
      if (profile) {
        console.log('✅ ProfileStore: Profile loaded successfully');
        console.log('🔍 ProfileStore: Profile data:', {
          id_user: profile.id_user,
          firstname: profile.firstname,
          lastname: profile.lastname,
          hasLocation: !!profile.location,
          hasGym: !!profile.gym,
          hasGymSubscription: !!profile.gymsubscription,
          sportsCount: profile.sports?.length || 0,
          hobbiesCount: profile.hobbies?.length || 0,
          socialMediasCount: profile.socialMedias?.length || 0
        });
        
        set({ profile, loading: false });
      } else {
        console.log('📝 ProfileStore: No profile found, will create one');
        set({ profile: null, loading: false });
      }

      return { error: null };
    } catch (error) {
      console.error('❌ ProfileStore: Failed to load profile:', error);
      set({ loading: false, error: 'Erreur lors du chargement du profil' });
      return { error: error as Error };
    }
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    try {
      const currentState = get();
      
      if (currentState.saving) {
        console.log('⏳ ProfileStore: Already saving, skipping...');
        return { error: new Error('Sauvegarde en cours...') };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: new Error('Utilisateur non connecté') };
      }

      console.log('💾 ProfileStore: Updating profile with:', updates);
      set({ saving: true, error: null });

      // Effectuer la mise à jour
      const updatedProfile = await profileService.updateProfile(user.id, updates);
      
      console.log('✅ ProfileStore: Profile updated in database');
      
      // Forcer un rechargement complet pour récupérer toutes les relations
      console.log('🔄 ProfileStore: Force reloading complete profile...');
      const completeProfile = await profileService.getProfile(user.id, true);
      
      if (completeProfile) {
        console.log('✅ ProfileStore: Complete profile reloaded with all relations');
        console.log('🔍 ProfileStore: Updated profile data:', {
          id_user: completeProfile.id_user,
          firstname: completeProfile.firstname,
          lastname: completeProfile.lastname,
          hasLocation: !!completeProfile.location,
          hasGym: !!completeProfile.gym,
          hasGymSubscription: !!completeProfile.gymsubscription,
          sportsCount: completeProfile.sports?.length || 0,
          hobbiesCount: completeProfile.hobbies?.length || 0,
          socialMediasCount: completeProfile.socialMedias?.length || 0
        });
        
        set({ profile: completeProfile, saving: false });
      } else {
        set({ profile: updatedProfile, saving: false });
      }

      return { error: null };
    } catch (error) {
      console.error('❌ ProfileStore: Failed to update profile:', error);
      set({ saving: false, error: (error as Error).message });
      return { error: error as Error };
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
