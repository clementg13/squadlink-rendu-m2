import { supabase } from '@/lib/supabase';
import { Sport, SportLevel, ProfileSport } from '@/types/profile';

export class SportService {

  // === Reference Data ===
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

  // === User Sports Management ===
  async getUserSports(userId: string): Promise<ProfileSport[]> {
    try {
      const profileId = await this.getProfileId(userId);
      if (!profileId) return [];

      const { data, error } = await supabase
        .from('profilesport')
        .select(`*, sport!inner(*), sportlevel!inner(*)`)
        .eq('id_profile', profileId);

      if (error) {
        console.error('❌ SportService: Error loading sports:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('❌ SportService: Exception in getUserSports:', error);
      return [];
    }
  }

  async addUserSport(userId: string, sportId: string, sportLevelId: string): Promise<ProfileSport> {
    const profileId = await this.getProfileId(userId);
    if (!profileId) throw new Error('Impossible de récupérer l\'ID du profil');

    const { data, error } = await supabase
      .from('profilesport')
      .insert([{
        id_profile: profileId,
        id_sport: sportId,
        id_sport_level: sportLevelId
      }])
      .select(`*, sport!inner(*), sportlevel!inner(*)`)
      .single();

    if (error) throw error;
    return data;
  }

  async removeUserSport(userId: string, sportId: string): Promise<void> {
    const profileId = await this.getProfileId(userId);
    if (!profileId) throw new Error('Impossible de récupérer l\'ID du profil');

    const { error } = await supabase
      .from('profilesport')
      .delete()
      .eq('id_profile', profileId)
      .eq('id_sport', sportId);

    if (error) throw error;
  }

  async updateUserSportLevel(userId: string, sportId: string, newLevelId: string): Promise<void> {
    const profileId = await this.getProfileId(userId);
    if (!profileId) throw new Error('Impossible de récupérer l\'ID du profil');

    const { error } = await supabase
      .from('profilesport')
      .update({ id_sport_level: newLevelId })
      .eq('id_profile', profileId)
      .eq('id_sport', sportId);

    if (error) throw error;
  }

  // === Helper Methods ===
  private async getProfileId(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('profile')
      .select('id')
      .eq('id_user', userId)
      .single();

    return (error || !data) ? null : data.id;
  }
}

export const sportService = new SportService();
