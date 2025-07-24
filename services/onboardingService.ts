import { OnboardingCredentials, OnboardingProfile, OnboardingSport, OnboardingHobbies } from '@/types/onboarding';
import { supabase } from '@/lib/supabase';

export class OnboardingService {
  // === Profile Management ===
  static async updateUserProfile(userId: string, profileData: OnboardingProfile) {
    try {
      console.log('📝 OnboardingService: Updating profile for user:', userId);

      // 1. Créer la localisation si fournie
      let locationId = null;
      if (profileData.location) {
        try {
          console.log('📍 OnboardingService: Creating location:', profileData.location);
          
          const locationPayload = {
            town: profileData.location.town,
            postal_code: profileData.location.postal_code,
            location: `POINT(${profileData.location.longitude} ${profileData.location.latitude})`
          };

          const { data: locationData, error: locationError } = await supabase
            .from('location')
            .insert(locationPayload)
            .select('*')
            .single();

          if (locationError) {
            console.error('❌ OnboardingService: Location creation failed:', locationError);
            throw locationError;
          }

          if (locationData) {
            locationId = locationData.id;
            console.log('✅ OnboardingService: Location created successfully with ID:', locationId);
          }
        } catch (locationErr) {
          console.warn('⚠️ OnboardingService: Could not create location:', locationErr);
          // Continuer sans localisation
        }
      }

      // 2. Mettre à jour le profil existant (créé par le trigger)
      const updatePayload = {
        lastname: profileData.lastname,
        firstname: profileData.firstname,
        birthdate: profileData.birthdate?.toISOString().split('T')[0],
        ...(locationId && { id_location: locationId })
      };

      console.log('📝 OnboardingService: Updating profile with payload:', updatePayload);

      const { error: updateError } = await supabase
        .from('profile')
        .update(updatePayload)
        .eq('id_user', userId);

      if (updateError) {
        console.error('❌ OnboardingService: Profile update failed:', updateError);
        throw updateError;
      }
      
      console.log('✅ OnboardingService: Profile updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ OnboardingService: Profile update error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Une erreur est survenue' 
      };
    }
  }

  // === Sports Management ===
  static async updateUserSports(userId: string, sports: OnboardingSport[]) {
    try {
      console.log('🏃 OnboardingService: Updating sports for user:', userId);

      const profileId = await this.getProfileId(userId);
      if (!profileId) {
        throw new Error('Impossible de récupérer le profil');
      }

      // Insérer les sports
      const sportsData = sports.map(sport => ({
        id_profile: profileId,
        id_sport: parseInt(sport.sportId),
        id_sport_level: parseInt(sport.levelId),
      }));

      const { error: sportsError } = await supabase
        .from('profilesport')
        .insert(sportsData);

      if (sportsError) throw sportsError;

      console.log('✅ OnboardingService: Sports updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ OnboardingService: Sports update error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Une erreur est survenue' 
      };
    }
  }

  // === Hobbies Management ===
  static async updateUserHobbies(userId: string, hobbies: OnboardingHobbies) {
    try {
      console.log('🎯 OnboardingService: Updating hobbies for user:', userId);

      const profileId = await this.getProfileId(userId);
      if (!profileId) {
        throw new Error('Impossible de récupérer le profil');
      }

      // Insérer les hobbies
      const hobbiesData = hobbies.hobbyIds.map(hobbyId => ({
        id_profile: profileId,
        id_hobbie: parseInt(hobbyId),
        is_highlighted: false,
      }));

      const { error: hobbiesError } = await supabase
        .from('profilehobbie')
        .insert(hobbiesData);

      if (hobbiesError) throw hobbiesError;

      // Marquer le profil comme terminé
      const { error: completionError } = await supabase
        .from('profile')
        .update({ 
          fully_completed: true,
        })
        .eq('id_user', userId);

      if (completionError) throw completionError;

      console.log('✅ OnboardingService: Hobbies updated and profile completed');
      return { success: true };
    } catch (error) {
      console.error('❌ OnboardingService: Hobbies update error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Une erreur est survenue' 
      };
    }
  }

  // === Helper Methods ===
  private static async getProfileId(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('profile')
      .select('id')
      .eq('id_user', userId)
      .single();

    return (error || !data) ? null : data.id;
  }

  // === Validation Methods ===
  static validateCredentials(credentials: OnboardingCredentials) {
    const errors: string[] = [];

    if (!credentials.email.trim()) {
      errors.push('L\'email est requis');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email.trim())) {
        errors.push('L\'email n\'est pas valide');
      }
    }

    if (!credentials.password) {
      errors.push('Le mot de passe est requis');
    } else if (credentials.password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }

    if (credentials.password !== credentials.confirmPassword) {
      errors.push('Les mots de passe ne correspondent pas');
    }

    return errors;
  }

  static validateProfile(profile: OnboardingProfile) {
    const errors: string[] = [];

    if (!profile.firstname.trim()) {
      errors.push('Le prénom est requis');
    }

    if (!profile.lastname.trim()) {
      errors.push('Le nom est requis');
    }

    if (!profile.birthdate) {
      errors.push('La date de naissance est requise');
    }

    return errors;
  }
}