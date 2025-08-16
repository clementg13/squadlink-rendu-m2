import { supabase } from '@/lib/supabase';
import { Gym, GymSubscription } from '@/types/profile';
import { profileService } from '@/services/profileService';

export class GymService {
  // === Validation Helper ===
  private validateId(id: unknown, _fieldName: string): string | null {
    if (!id || id === 'undefined' || id === 'null' || id === null || id === undefined) {
      return null;
    }
    
    const cleanId = id.toString().trim();
    if (cleanId === '' || cleanId === 'undefined' || cleanId === 'null') {
      return null;
    }
    
    return cleanId;
  }

  // === Gym Management ===
  async getAllGyms(): Promise<Gym[]> {
    try {
      const { error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('❌ GymService: Auth error:', userError);
        return [];
      }

      // Essayer le schéma public d'abord
      const { data: publicData } = await supabase
        .from('gym')
        .select('id, name')
        .order('name');

      if (publicData && publicData.length > 0) {
        return publicData;
      }

      // Essayer le schéma musclemeet
      const { data: musclemeetData } = await supabase
        .schema('musclemeet')
        .from('gym')
        .select('id, name')
        .order('name');

      if (musclemeetData && musclemeetData.length > 0) {
        return musclemeetData;
      }

      // Essayer de reconstruire depuis les abonnements
      const { data: subscriptions } = await supabase
        .from('gymsubscription')
        .select('id_gym')
        .order('id_gym');

      if (subscriptions && subscriptions.length > 0) {
        const uniqueGymIds = [...new Set(subscriptions.map(sub => sub.id_gym))];
        const reconstructedGyms = [];
        
        for (const gymId of uniqueGymIds) {
          const { data: gymData } = await supabase
            .schema('musclemeet')
            .from('gym')
            .select('id, name')
            .eq('id', gymId)
            .single();
          
          if (gymData) {
            reconstructedGyms.push(gymData);
          }
        }
        
        if (reconstructedGyms.length > 0) {
          return reconstructedGyms;
        }
      }

      console.error('❌ GymService: No gyms found - check database and RLS policies');
      return [];
    } catch (error) {
      console.error('❌ GymService: Exception in getAllGyms:', error);
      return [];
    }
  }

  // === Subscription Management ===
  async getAllGymSubscriptions(): Promise<GymSubscription[]> {
    try {
      const { data, error } = await supabase
        .from('gymsubscription')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ GymService: Error loading subscriptions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ GymService: Exception in getAllGymSubscriptions:', error);
      return [];
    }
  }

  async getGymSubscriptions(gymId: string): Promise<GymSubscription[]> {
    const validGymId = this.validateId(gymId, 'gym ID');
    if (!validGymId) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('gymsubscription')
        .select('*')
        .eq('id_gym', validGymId)
        .order('name');

      if (error) {
        console.error('❌ GymService: Error loading subscriptions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ GymService: Exception in getGymSubscriptions:', error);
      return [];
    }
  }

  // === User Gym Management ===
  async updateUserGymSubscription(userId: string, gymId: string, subscriptionId: string): Promise<void> {
    const validUserId = this.validateId(userId, 'user ID');
    const validGymId = this.validateId(gymId, 'gym ID');
    const validSubscriptionId = this.validateId(subscriptionId, 'subscription ID');

    if (!validUserId || !validGymId || !validSubscriptionId) {
      throw new Error('Paramètres invalides pour la mise à jour de l\'abonnement');
    }

    try {
      const gymIdInt = parseInt(validGymId, 10);
      const subscriptionIdInt = parseInt(validSubscriptionId, 10);

      if (isNaN(gymIdInt) || isNaN(subscriptionIdInt)) {
        throw new Error('Les IDs doivent être des nombres valides');
      }

      const { error } = await supabase
        .from('profile')
        .update({ 
          id_gym: gymIdInt,
          id_gymsubscription: subscriptionIdInt 
        })
        .eq('id_user', validUserId);

      if (error) {
        console.error('❌ GymService: Failed to update user subscription:', error);
        throw error;
      }

      profileService.invalidateProfileCache(validUserId);
      await profileService.nukeAndReload(validUserId);
      
    } catch (error) {
      console.error('❌ GymService: Exception updating user subscription:', error);
      throw error;
    }
  }

  async getUserCurrentSubscription(userId: string): Promise<{ gym: Gym | null; subscription: GymSubscription | null }> {
    const validUserId = this.validateId(userId, 'user ID');
    if (!validUserId) {
      return { gym: null, subscription: null };
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profile')
        .select('id_gym, id_gymsubscription')
        .eq('id_user', validUserId)
        .single();

      if (profileError || !profile) {
        return { gym: null, subscription: null };
      }

      let gym = null;
      let subscription = null;

      const validGymId = this.validateId(profile.id_gym, 'profile gym ID');
      if (validGymId) {
        const { data: gymData, error: gymError } = await supabase
          .from('gym')
          .select('*')
          .eq('id', validGymId)
          .single();
        
        if (!gymError && gymData) {
          gym = gymData;
        }
      }

      const validSubscriptionId = this.validateId(profile.id_gymsubscription, 'profile subscription ID');
      if (validSubscriptionId) {
        const { data: subData, error: subError } = await supabase
          .from('gymsubscription')
          .select('*')
          .eq('id', validSubscriptionId)
          .single();
        
        if (!subError && subData) {
          subscription = subData;
        }
      }

      return { gym, subscription };
    } catch (error) {
      console.error('❌ GymService: Exception in getUserCurrentSubscription:', error);
      return { gym: null, subscription: null };
    }
  }
}

export const gymService = new GymService();