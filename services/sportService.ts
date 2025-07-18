import { supabase } from '@/lib/supabase';
import { Sport, SportLevel, ProfileSport } from '@/types/profile';

export class SportService {

  async getAllSports(): Promise<Sport[]> {
    const { data, error } = await supabase
      .from('sport')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getAllSportLevels(): Promise<SportLevel[]> {
    const { data, error } = await supabase
      .from('sportlevel')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getUserSports(userId: string): Promise<ProfileSport[]> {
    try {
      // D'abord récupérer l'ID du profil
      const { data: profileData, error: profileError } = await supabase
        .from('profile')
        .select('id')
        .eq('id_user', userId)
        .single();

      if (profileError || !profileData) {
        return [];
      }

      const { data, error } = await supabase
        .from('profilesport')
        .select(`
          *,
          sport!inner(*),
          sportlevel!inner(*)
        `)
        .eq('id_profile', profileData.id);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ SportService: Exception lors de getUserSports:', error);
      return [];
    }
  }

  async addUserSport(userId: string, sportId: string, sportLevelId: string): Promise<ProfileSport> {
    // Récupérer l'ID du profil
    const { data: profileData, error: profileError } = await supabase
      .from('profile')
      .select('id')
      .eq('id_user', userId)
      .single();

    if (profileError || !profileData) {
      throw new Error('Impossible de récupérer l\'ID du profil');
    }

    const { data, error } = await supabase
      .from('profilesport')
      .insert([{
        id_profile: profileData.id,
        id_sport: sportId,
        id_sport_level: sportLevelId
      }])
      .select(`
        *,
        sport!inner(*),
        sportlevel!inner(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async removeUserSport(userId: string, sportId: string): Promise<void> {
    // Récupérer l'ID du profil
    const { data: profileData, error: profileError } = await supabase
      .from('profile')
      .select('id')
      .eq('id_user', userId)
      .single();

    if (profileError || !profileData) {
      throw new Error('Impossible de récupérer l\'ID du profil');
    }

    const { error } = await supabase
      .from('profilesport')
      .delete()
      .eq('id_profile', profileData.id)
      .eq('id_sport', sportId);

    if (error) throw error;
  }

  async updateUserSportLevel(userId: string, sportId: string, newLevelId: string): Promise<void> {
    // Récupérer l'ID du profil
    const { data: profileData, error: profileError } = await supabase
      .from('profile')
      .select('id')
      .eq('id_user', userId)
      .single();

    if (profileError || !profileData) {
      throw new Error('Impossible de récupérer l\'ID du profil');
    }

    const { error } = await supabase
      .from('profilesport')
      .update({ id_sport_level: newLevelId })
      .eq('id_profile', profileData.id)
      .eq('id_sport', sportId);

    if (error) throw error;
  }
}

export const sportService = new SportService();
