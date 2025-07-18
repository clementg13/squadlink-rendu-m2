import { supabase } from '@/lib/supabase';
import { ProfileHobby } from '@/types/profile';

export class HobbyService {

  async getUserHobbies(userId: string): Promise<ProfileHobby[]> {
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
      .from('profilehobbie')
      .select(`
        *,
        hobbie!inner(*)
      `)
      .eq('id_profile', profileData.id);

    if (error) throw error;
    return data || [];
  }

  async addUserHobby(userId: string, hobbyId: string, isHighlighted = false): Promise<ProfileHobby> {
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

    if (error) throw error;
    return data;
  }

  async removeUserHobby(userId: string, hobbyId: string): Promise<void> {
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
      .from('profilehobbie')
      .delete()
      .eq('id_profile', profileData.id)
      .eq('id_hobbie', hobbyId);

    if (error) throw error;
  }

  async toggleHighlightHobby(userId: string, hobbyId: string, newStatus: boolean): Promise<void> {
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
      .from('profilehobbie')
      .update({ is_highlighted: newStatus })
      .eq('id_profile', profileData.id)
      .eq('id_hobbie', hobbyId);

    if (error) throw error;
  }
}

export const hobbyService = new HobbyService();
