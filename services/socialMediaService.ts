import { supabase } from '@/lib/supabase';
import { SocialMedia, ProfileSocialMedia } from '@/types/profile';

export class SocialMediaService {

  async getAllSocialMedias(): Promise<SocialMedia[]> {
    const { data, error } = await supabase
      .from('socialmedia')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getUserSocialMedias(userId: string): Promise<ProfileSocialMedia[]> {
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
        .from('profilesocialmedia')
        .select(`
          *,
          socialmedia!inner(*)
        `)
        .eq('id_profile', profileData.id);

      if (error) {
        console.error('❌ SocialMediaService: Error loading social medias:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('❌ SocialMediaService: Exception lors de getUserSocialMedias:', error);
      return [];
    }
  }

  async addUserSocialMedia(userId: string, socialMediaId: string, username: string): Promise<ProfileSocialMedia> {
    // Récupérer l'ID du profil
    const { data: profileData, error: profileError } = await supabase
      .from('profile')
      .select('id')
      .eq('id_user', userId)
      .single();

    if (profileError || !profileData) {
      throw new Error('Impossible de récupérer l\'ID du profil');
    }

    // Vérifier si l'utilisateur a déjà ce réseau social
    const { data: existingData, error: existingError } = await supabase
      .from('profilesocialmedia')
      .select('*')
      .eq('id_profile', profileData.id)
      .eq('id_social_media', socialMediaId);

    if (existingError) throw existingError;

    if (existingData && existingData.length > 0) {
      throw new Error('Vous avez déjà ajouté ce réseau social');
    }

    const { data, error } = await supabase
      .from('profilesocialmedia')
      .insert([{
        id_profile: profileData.id,
        id_social_media: socialMediaId,
        username: username.trim()
      }])
      .select(`
        *,
        socialmedia!inner(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserSocialMedia(userId: string, socialMediaId: string, username: string): Promise<void> {
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
      .from('profilesocialmedia')
      .update({ username: username.trim() })
      .eq('id_profile', profileData.id)
      .eq('id_social_media', socialMediaId);

    if (error) throw error;
  }

  async removeUserSocialMedia(userId: string, socialMediaId: string): Promise<void> {
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
      .from('profilesocialmedia')
      .delete()
      .eq('id_profile', profileData.id)
      .eq('id_social_media', socialMediaId);

    if (error) throw error;
  }
}

export const socialMediaService = new SocialMediaService();
