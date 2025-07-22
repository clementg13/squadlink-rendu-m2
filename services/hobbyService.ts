import { supabase } from '@/lib/supabase';
import { ProfileHobby } from '@/types/profile';

export class HobbyService {

  // === User Hobbies Management ===
  async getUserHobbies(userId: string): Promise<ProfileHobby[]> {
    try {
      const profileId = await this.getProfileId(userId);
      if (!profileId) return [];

      const { data, error } = await supabase
        .from('profilehobbie')
        .select(`*, hobbie!inner(*)`)
        .eq('id_profile', profileId);

      if (error) {
        console.error('❌ HobbyService: Error loading hobbies:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('❌ HobbyService: Exception in getUserHobbies:', error);
      return [];
    }
  }

  async addUserHobby(userId: string, hobbyId: string, isHighlighted = false): Promise<ProfileHobby> {
    const profileId = await this.getProfileId(userId);
    if (!profileId) throw new Error('Impossible de récupérer l\'ID du profil');

    const { data, error } = await supabase
      .from('profilehobbie')
      .insert([{
        id_profile: profileId,
        id_hobbie: hobbyId,
        is_highlighted: isHighlighted
      }])
      .select(`*, hobbie!inner(*)`)
      .single();

    if (error) throw error;
    return data;
  }

  async removeUserHobby(userId: string, hobbyId: string): Promise<void> {
    const profileId = await this.getProfileId(userId);
    if (!profileId) throw new Error('Impossible de récupérer l\'ID du profil');

    const { error } = await supabase
      .from('profilehobbie')
      .delete()
      .eq('id_profile', profileId)
      .eq('id_hobbie', hobbyId);

    if (error) throw error;
  }

  async toggleHighlightHobby(userId: string, hobbyId: string, newStatus: boolean): Promise<void> {
    const profileId = await this.getProfileId(userId);
    if (!profileId) throw new Error('Impossible de récupérer l\'ID du profil');

    const { error } = await supabase
      .from('profilehobbie')
      .update({ is_highlighted: newStatus })
      .eq('id_profile', profileId)
      .eq('id_hobbie', hobbyId);

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

export const hobbyService = new HobbyService();
