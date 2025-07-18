import { supabase } from '@/lib/supabase';
import { UserProfile, Location, Gym, GymSubscription, Hobbie, ProfileHobby } from '@/types/profile';

export class ProfileService {
  
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('id_user', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  }

  async createProfile(userId: string): Promise<UserProfile> {
    const newProfile = {
      id_user: userId,
      score: 0,
      fully_completed: false,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profile')
      .insert([newProfile])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profile')
      .update(updates)
      .eq('id_user', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async getLocationDetails(locationId: string): Promise<Location | null> {
    const { data, error } = await supabase
      .from('location')
      .select('*')
      .eq('id', locationId)
      .single();

    if (error) return null;
    return data;
  }

  async getGymDetails(gymId: string): Promise<Gym | null> {
    const { data, error } = await supabase
      .from('gym')
      .select('*')
      .eq('id', gymId)
      .single();

    if (error) return null;
    return data;
  }

  async getGymSubscriptionDetails(subscriptionId: string): Promise<GymSubscription | null> {
    const { data, error } = await supabase
      .from('gymsubscription')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (error) return null;
    return data;
  }

  async getAllGyms(): Promise<Gym[]> {
    const { data, error } = await supabase
      .from('gym')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getGymSubscriptions(gymId?: string): Promise<GymSubscription[]> {
    let query = supabase.from('gymsubscription').select('*');
    
    if (gymId) {
      query = query.eq('id_gym', gymId);
    }
    
    const { data, error } = await query.order('name');

    if (error) throw error;
    return data || [];
  }

  async getAllHobbies(): Promise<Hobbie[]> {
    const { data, error } = await supabase
      .from('hobbie')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }
}

export const profileService = new ProfileService();