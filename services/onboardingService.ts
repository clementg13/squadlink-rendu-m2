import { supabase } from '@/lib/supabase';
import { OnboardingData } from '@/types/onboarding';

export class OnboardingService {
  static async createUserAndProfile(data: OnboardingData) {
    try {
      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.credentials.email,
        password: data.credentials.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // 2. Create location if provided
      let locationId = null;
      if (data.profile.location) {
        const { data: locationData, error: locationError } = await supabase
          .from('location')
          .insert({
            town: data.profile.location.town,
            postal_code: data.profile.location.postal_code.toString(),
            location: `POINT(${data.profile.location.longitude} ${data.profile.location.latitude})`
          })
          .select()
          .single();

        if (locationError) throw locationError;
        locationId = locationData.id;
      }

      // 3. Create profile
      const profileData = {
        id_user: authData.user.id,
        lastname: data.profile.lastname,
        firstname: data.profile.firstname,
        birthdate: data.profile.birthdate?.toISOString().split('T')[0],
        id_location: locationId,
        id_gym: data.gym?.gymId ? parseInt(data.gym.gymId) : null,
        id_gymsubscription: data.gym?.subscriptionId ? parseInt(data.gym.subscriptionId) : null,
        score: 0,
        fully_completed: false,
        biography: null,
      };

      const { data: profile, error: profileError } = await supabase
        .from('profile')
        .insert(profileData)
        .select()
        .single();

      if (profileError) throw profileError;

      // 4. Add sports
      if (data.sports.length > 0) {
        const sportsData = data.sports.map(sport => ({
          id_profile: profile.id,
          id_sport: parseInt(sport.sportId),
          id_sport_level: parseInt(sport.levelId),
        }));

        const { error: sportsError } = await supabase
          .from('profilesport')
          .insert(sportsData);

        if (sportsError) throw sportsError;
      }

      // 5. Add hobbies if provided
      if (data.hobbies?.hobbyIds.length) {
        const hobbiesData = data.hobbies.hobbyIds.map(hobbyId => ({
          id_profile: profile.id,
          id_hobbie: parseInt(hobbyId),
          is_highlighted: false
        }));

        const { error: hobbiesError } = await supabase
          .from('profilehobbie')
          .insert(hobbiesData);

        if (hobbiesError) throw hobbiesError;
      }

      return { success: true, user: authData.user, profile };
    } catch (error) {
      console.error('Onboarding error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Une erreur est survenue' 
      };
    }
  }

  static validateCredentials(credentials: OnboardingData['credentials']) {
    const errors: string[] = [];

    if (!credentials.email.trim()) {
      errors.push('L\'email est requis');
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.push('L\'email n\'est pas valide');
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

  static validateProfile(profile: OnboardingData['profile']) {
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
