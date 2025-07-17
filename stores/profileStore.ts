import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';

export interface Location {
  id: string;
  town: string;
  postal_code: string;
  location: string;
}

export interface Gym {
  id: string;
  name: string;
}

export interface GymSubscription {
  id: string;
  name: string;
  id_gym: string;
}

export interface Hobbie {
  id: string;
  name: string;
}

export interface ProfileHobby {
  id: string;
  id_profile: string;
  id_hobbie: string;
  is_highlighted: boolean;
  hobbie?: Hobbie;
}

export interface UserProfile {
  id_user: string;
  lastname?: string;
  firstname?: string;
  birthdate?: string;
  id_location?: string;
  id_gym?: string;
  score?: number;
  id_gymsubscription?: string;
  fully_completed?: boolean;
  biography?: string;
  created_at?: string;
  updated_at?: string;
  
  // Relations populées
  location?: Location;
  gym?: Gym;
  gymsubscription?: GymSubscription;
  hobbies?: ProfileHobby[];
}

interface ProfileState {
  // État
  profile: UserProfile | null;
  gyms: Gym[];
  gymSubscriptions: GymSubscription[];
  hobbies: Hobbie[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  initialized: boolean;
  
  // Actions de base
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  
  // Actions principales
  loadProfile: () => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  loadLocationDetails: (locationId: string) => Promise<Location | null>;
  loadGymDetails: (gymId: string) => Promise<Gym | null>;
  loadGymSubscriptionDetails: (subscriptionId: string) => Promise<GymSubscription | null>;
  loadAllGyms: () => Promise<{ error: Error | null }>;
  loadGymSubscriptions: (gymId?: string) => Promise<{ error: Error | null }>;
  loadAllHobbies: () => Promise<{ error: Error | null }>;
  loadUserHobbies: (userId: string) => Promise<ProfileHobby[]>;
  addUserHobby: (hobbyId: string, isHighlighted?: boolean) => Promise<{ error: Error | null }>;
  removeUserHobby: (hobbyId: string) => Promise<{ error: Error | null }>;
  toggleHighlightHobby: (hobbyId: string) => Promise<{ error: Error | null }>;

  // Actions supplémentaires
  cleanup: () => void;
  
  // Méthodes utilitaires
  clearError: () => void;
  initialize: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>()(
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
      setProfile: (profile) => {
        set({ profile });
      },
      setLoading: (loading) => {
        set({ loading });
      },
      setSaving: (saving) => {
        set({ saving });
      },
      setError: (error) => {
        set({ error });
      },
      setInitialized: (initialized) => {
        set({ initialized });
      },

      // Mise à jour du profil
      updateProfile: async (updates: Partial<UserProfile>) => {
        try {
          set({ saving: true, error: null });

          const { profile } = get();
          if (!profile) {
            throw new Error('Profil non chargé');
          }

          const { data, error } = await supabase
            .from('profile')
            .update(updates)
            .eq('id_user', profile.id_user)
            .select('*')
            .single();

          if (error) {
            console.error('❌ ProfileStore: Erreur lors de la mise à jour du profil:', error);
            throw error;
          }

          // Mettre à jour le profil local
          set({ profile: { ...profile, ...data }, saving: false });
          return { error: null };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil';
          console.error('❌ ProfileStore: Erreur lors de la mise à jour du profil:', errorMessage);
          set({ error: errorMessage, saving: false });
          return { error: error as Error };
        }
      },

      // Chargement du profil
      loadProfile: async () => {
        try {
          set({ loading: true, error: null });
          
          const { user } = useAuthStore.getState();
          if (!user) {
            throw new Error('Utilisateur non connecté');
          }

          const { data, error } = await supabase
            .from('profile')
            .select('*')
            .eq('id_user', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('❌ ProfileStore: Erreur lors du chargement:', error);
            throw error;
          }

          // Si pas de profil, créer un profil de base
          if (!data) {
            const newProfile: Partial<UserProfile> = {
              id_user: user.id,
              score: 0,
              fully_completed: false,
              created_at: new Date().toISOString(),
            };

            const { data: insertedData, error: insertError } = await supabase
              .from('profile')
              .insert([newProfile])
              .select('*')
              .single();

            if (insertError) {
              console.error('❌ ProfileStore: Erreur lors de la création du profil:', insertError);
              throw insertError;
            }
            
            set({ profile: insertedData, loading: false });
            return { error: null };
          }

          // Charger les détails des relations
          const promises = [];
          
          if (data.id_location) {
            promises.push(get().loadLocationDetails(data.id_location));
          }
          
          if (data.id_gym) {
            promises.push(get().loadGymDetails(data.id_gym));
          }
          
          if (data.id_gymsubscription) {
            promises.push(get().loadGymSubscriptionDetails(data.id_gymsubscription));
          }

          // Charger les hobbies de l'utilisateur
          promises.push(get().loadUserHobbies(data.id_user));

          const [location, gym, gymsubscription, userHobbies] = await Promise.all(promises);
          
          if (location) data.location = location;
          if (gym) data.gym = gym;
          if (gymsubscription) data.gymsubscription = gymsubscription;
          if (userHobbies) data.hobbies = userHobbies;

          set({ profile: data, loading: false });
          return { error: null };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur de chargement du profil';
          console.error('❌ ProfileStore: Erreur lors du chargement du profil:', errorMessage);
          set({ error: errorMessage, loading: false });
          return { error: error as Error };
        }
      },

      // Chargement de toutes les salles de sport
      loadAllGyms: async () => {
        try {
          const { data, error } = await supabase
            .from('gym')
            .select('*')
            .order('name');

          if (error) {
            console.error('❌ ProfileStore: Erreur lors du chargement des salles:', error);
            throw error;
          }

          set({ gyms: data || [] });
          return { error: null };
        } catch (error) {
          console.error('❌ ProfileStore: Erreur lors du chargement des salles:', error);
          return { error: error as Error };
        }
      },

      // Chargement des abonnements pour une salle
      loadGymSubscriptions: async (gymId?: string) => {
        try {
          let query = supabase.from('gymsubscription').select('*');
          
          if (gymId) {
            query = query.eq('id_gym', gymId);
          }
          
          const { data, error } = await query.order('name');

          if (error) {
            console.error('❌ ProfileStore: Erreur lors du chargement des abonnements:', error);
            throw error;
          }

          set({ gymSubscriptions: data || [] });
          return { error: null };
        } catch (error) {
          console.error('❌ ProfileStore: Erreur lors du chargement des abonnements:', error);
          return { error: error as Error };
        }
      },

      // Chargement de tous les hobbies
      loadAllHobbies: async () => {
        try {
          const { data, error } = await supabase
            .from('hobbie')
            .select('*')
            .order('name');

          if (error) {
            console.error('❌ ProfileStore: Erreur lors du chargement des hobbies:', error);
            throw error;
          }

          set({ hobbies: data || [] });
          return { error: null };
        } catch (error) {
          console.error('❌ ProfileStore: Erreur lors du chargement des hobbies:', error);
          return { error: error as Error };
        }
      },

      // Chargement des détails de localisation
      loadLocationDetails: async (locationId: string) => {
        try {
          const { data, error } = await supabase
            .from('location')
            .select('*')
            .eq('id', locationId)
            .single();

          if (error) {
            console.error('❌ ProfileStore: Erreur lors du chargement de la localisation:', error);
            return null;
          }

          return data;
        } catch (error) {
          console.error('❌ ProfileStore: Erreur lors du chargement de la localisation:', error);
          return null;
        }
      },

      // Chargement des détails de la salle de sport
      loadGymDetails: async (gymId: string) => {
        try {
          const { data, error } = await supabase
            .from('gym')
            .select('*')
            .eq('id', gymId)
            .single();

          if (error) {
            console.error('❌ ProfileStore: Erreur lors du chargement de la salle:', error);
            return null;
          }

          return data;
        } catch (error) {
          console.error('❌ ProfileStore: Erreur lors du chargement de la salle:', error);
          return null;
        }
      },

      // Chargement des détails de l'abonnement
      loadGymSubscriptionDetails: async (subscriptionId: string) => {
        try {
          const { data, error } = await supabase
            .from('gymsubscription')
            .select('*')
            .eq('id', subscriptionId)
            .single();

          if (error) {
            console.error('❌ ProfileStore: Erreur lors du chargement de l\'abonnement:', error);
            return null;
          }

          return data;
        } catch (error) {
          console.error('❌ ProfileStore: Erreur lors du chargement de l\'abonnement:', error);
          return null;
        }
      },

      // Ajouter un hobby à l'utilisateur
      addUserHobby: async (hobbyId: string, isHighlighted = false) => {
        try {
          console.log('➕ ProfileStore: Ajout d\'un hobby:', hobbyId);
          set({ saving: true, error: null });
          
          const { profile } = get();
          if (!profile) {
            throw new Error('Profil non chargé');
          }

          // Récupérer l'ID du profil depuis la table profile
          const { data: profileData, error: profileError } = await supabase
            .from('profile')
            .select('id')
            .eq('id_user', profile.id_user)
            .single();

          if (profileError || !profileData) {
            console.error('❌ ProfileStore: Erreur lors de la récupération de l\'ID du profil:', profileError);
            throw new Error('Impossible de récupérer l\'ID du profil');
          }

          console.log('➕ ProfileStore: ID du profil trouvé:', profileData.id);

          // Vérifier qu'on n'a pas déjà 3 hobbies en highlight si on veut ajouter un highlighted
          if (isHighlighted) {
            const highlightedCount = profile.hobbies?.filter(h => h.is_highlighted).length || 0;
            if (highlightedCount >= 3) {
              throw new Error('Vous ne pouvez avoir que 3 hobbies en favoris maximum');
            }
          }

          console.log('➕ ProfileStore: Insertion dans profilehobbie avec:', {
            id_profile: profileData.id,
            id_hobbie: hobbyId,
            is_highlighted: isHighlighted
          });

          const { data, error } = await supabase
            .from('profilehobbie')
            .insert([{
              id_profile: profileData.id,
              id_hobbie: hobbyId,
              is_highlighted: isHighlighted
            }])
            .select(`
              *,
              hobbie!inner(*)
            `)
            .single();

          if (error) {
            console.error('❌ ProfileStore: Erreur Supabase:', error);
            throw error;
          }

          console.log('✅ ProfileStore: Hobby ajouté avec succès:', data);

          // Mettre à jour le profil local
          const updatedHobbies = [...(profile.hobbies || []), data];
          set({ 
            profile: { ...profile, hobbies: updatedHobbies },
            saving: false 
          });

          return { error: null };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'ajout du hobby';
          console.error('❌ ProfileStore: Erreur lors de l\'ajout du hobby:', error);
          set({ error: errorMessage, saving: false });
          return { error: error as Error };
        }
      },

      // Supprimer un hobby de l'utilisateur
      removeUserHobby: async (hobbyId: string) => {
        try {
          console.log('➖ ProfileStore: Suppression d\'un hobby:', hobbyId);
          set({ saving: true, error: null });
          
          const { profile } = get();
          if (!profile) {
            throw new Error('Profil non chargé');
          }

          // Récupérer l'ID du profil depuis la table profile
          const { data: profileData, error: profileError } = await supabase
            .from('profile')
            .select('id')
            .eq('id_user', profile.id_user)
            .single();

          if (profileError || !profileData) {
            console.error('❌ ProfileStore: Erreur lors de la récupération de l\'ID du profil:', profileError);
            throw new Error('Impossible de récupérer l\'ID du profil');
          }

          const { error } = await supabase
            .from('profilehobbie')
            .delete()
            .eq('id_profile', profileData.id)
            .eq('id_hobbie', hobbyId);

          if (error) throw error;

          // Mettre à jour le profil local
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

      // Basculer le statut highlight d'un hobby
      toggleHighlightHobby: async (hobbyId: string) => {
        try {
          console.log('⭐ ProfileStore: Basculement du highlight pour le hobby:', hobbyId);
          set({ saving: true, error: null });
          
          const { profile } = get();
          if (!profile) {
            throw new Error('Profil non chargé');
          }

          // Récupérer l'ID du profil depuis la table profile
          const { data: profileData, error: profileError } = await supabase
            .from('profile')
            .select('id')
            .eq('id_user', profile.id_user)
            .single();

          if (profileError || !profileData) {
            console.error('❌ ProfileStore: Erreur lors de la récupération de l\'ID du profil:', profileError);
            throw new Error('Impossible de récupérer l\'ID du profil');
          }

          const userHobby = profile.hobbies?.find(h => h.id_hobbie === hobbyId);
          if (!userHobby) {
            throw new Error('Hobby non trouvé');
          }

          const newHighlightStatus = !userHobby.is_highlighted;

          // Si on veut mettre en highlight, vérifier la limite
          if (newHighlightStatus) {
            const highlightedCount = profile.hobbies?.filter(h => h.is_highlighted && h.id_hobbie !== hobbyId).length || 0;
            if (highlightedCount >= 3) {
              throw new Error('Vous ne pouvez avoir que 3 hobbies en favoris maximum');
            }
          }

          const { error } = await supabase
            .from('profilehobbie')
            .update({ is_highlighted: newHighlightStatus })
            .eq('id_profile', profileData.id)
            .eq('id_hobbie', hobbyId);

          if (error) throw error;

          // Mettre à jour le profil local
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

      // Chargement des hobbies de l'utilisateur
      loadUserHobbies: async (userId: string) => {
        try {
          console.log('🎯 ProfileStore: Chargement des hobbies de l\'utilisateur:', userId);
          
          // D'abord récupérer l'ID du profil
          const { data: profileData, error: profileError } = await supabase
            .from('profile')
            .select('id')
            .eq('id_user', userId)
            .single();

          if (profileError || !profileData) {
            console.log('❌ ProfileStore: Aucun profil trouvé pour cet utilisateur');
            return [];
          }

          const { data, error } = await supabase
            .from('profilehobbie')
            .select(`
              *,
              hobbie!inner(*)
            `)
            .eq('id_profile', profileData.id);

          if (error) {
            console.error('❌ ProfileStore: Erreur lors du chargement des hobbies utilisateur:', error);
            return [];
          }

          return data || [];
        } catch (error) {
          console.error('❌ ProfileStore: Erreur lors du chargement des hobbies utilisateur:', error);
          return [];
        }
      },

      // Initialisation du store
      initialize: async () => {
        try {
          set({ loading: true, error: null });
          
          // Charger les données de base
          await Promise.all([
            get().loadAllGyms(),
            get().loadAllHobbies(),
          ]);
          
          // Charger le profil si un utilisateur est connecté
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

      // Méthodes utilitaires
      clearError: () => {
        set({ error: null });
      },

      cleanup: () => {
        set({ 
          profile: null, 
          gyms: [],
          gymSubscriptions: [],
          hobbies: [],
          loading: false, 
          saving: false, 
          error: null, 
          initialized: false 
        });
      },
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
    loadLocationDetails: store.loadLocationDetails,
    loadGymDetails: store.loadGymDetails,
    loadGymSubscriptionDetails: store.loadGymSubscriptionDetails,
    loadAllGyms: store.loadAllGyms,
    loadGymSubscriptions: store.loadGymSubscriptions,
    loadAllHobbies: store.loadAllHobbies,
    loadUserHobbies: store.loadUserHobbies,
    addUserHobby: store.addUserHobby,
    removeUserHobby: store.removeUserHobby,
    toggleHighlightHobby: store.toggleHighlightHobby,
    clearError: store.clearError,
    initialize: store.initialize,
    cleanup: store.cleanup
  };
};

export const useProfileData = () => useProfileStore((state) => state.profile);
export const useProfileLoading = () => useProfileStore((state) => state.loading);
export const useProfileSaving = () => useProfileStore((state) => state.saving);
export const useProfileError = () => useProfileStore((state) => state.error);
export const useProfileInitialized = () => useProfileStore((state) => state.initialized);
