import { supabase } from '@/lib/supabase';
import { SocialMedia, ProfileSocialMedia } from '@/types/profile';

export class SocialMediaService {

  // === Reference Data ===
  async getAllSocialMedias(): Promise<SocialMedia[]> {
    const { data, error } = await supabase
      .from('socialmedia')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  // === User Social Media Management ===
  async getUserSocialMedias(userId: string): Promise<ProfileSocialMedia[]> {
    try {
      const profileId = await this.getProfileId(userId);
      if (!profileId) return [];

      const { data, error } = await supabase
        .from('profilesocialmedia')
        .select(`*, socialmedia!inner(*)`)
        .eq('id_profile', profileId);

      if (error) {
        console.error('❌ SocialMediaService: Error loading social medias:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('❌ SocialMediaService: Exception in getUserSocialMedias:', error);
      return [];
    }
  }

  async addUserSocialMedia(userId: string, socialMediaId: string, username: string): Promise<ProfileSocialMedia> {
    const profileId = await this.getProfileId(userId);
    if (!profileId) throw new Error('Impossible de récupérer l\'ID du profil');

    // Check if already exists
    await this.checkSocialMediaExists(profileId, socialMediaId);

    const { data, error } = await supabase
      .from('profilesocialmedia')
      .insert([{
        id_profile: profileId,
        id_social_media: socialMediaId,
        username: username.trim()
      }])
      .select(`*, socialmedia!inner(*)`)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserSocialMedia(userId: string, socialMediaId: string, username: string): Promise<void> {
    const profileId = await this.getProfileId(userId);
    if (!profileId) throw new Error('Impossible de récupérer l\'ID du profil');

    const { error } = await supabase
      .from('profilesocialmedia')
      .update({ username: username.trim() })
      .eq('id_profile', profileId)
      .eq('id_social_media', socialMediaId);

    if (error) throw error;
  }

  async removeUserSocialMedia(userId: string, socialMediaId: string): Promise<void> {
    const profileId = await this.getProfileId(userId);
    if (!profileId) throw new Error('Impossible de récupérer l\'ID du profil');

    const { error } = await supabase
      .from('profilesocialmedia')
      .delete()
      .eq('id_profile', profileId)
      .eq('id_social_media', socialMediaId);

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

  private async checkSocialMediaExists(profileId: string, socialMediaId: string): Promise<void> {
    const { data, error } = await supabase
      .from('profilesocialmedia')
      .select('*')
      .eq('id_profile', profileId)
      .eq('id_social_media', socialMediaId);

    if (error) throw error;
    if (data && data.length > 0) {
      throw new Error('Vous avez déjà ajouté ce réseau social');
    }
  }
}

export const socialMediaService = new SocialMediaService();
