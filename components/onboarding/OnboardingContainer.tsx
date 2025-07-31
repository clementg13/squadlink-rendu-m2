import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, Alert, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { locationService } from '@/services/locationService';

// Composants des étapes d'onboarding
import OnboardingWelcome from './steps/OnboardingWelcome';
import OnboardingCredentialsStep from './steps/OnboardingCredentials';
import OnboardingProfileStep from './steps/OnboardingProfile';
import OnboardingSports from './steps/OnboardingSports';
import OnboardingHobbiesStep from './steps/OnboardingHobbies';
import OnboardingCompletion from './steps/OnboardingCompletion';
import OnboardingProgress from './OnboardingProgress';
import OnboardingTerms from './steps/OnboardingTerms';
import OnboardingPrivacy from './steps/OnboardingPrivacy';

type OnboardingStep = 'welcome' | 'terms' | 'privacy' | 'credentials' | 'profile' | 'sports' | 'hobbies' | 'completion';

interface ProfileData {
  firstname: string;
  lastname: string;
  birthdate: Date;
  location?: {
    town: string;
    postal_code: number;
    latitude: number;
    longitude: number;
  };
}

interface SportSelection {
  sportId: string;
  levelId: string;
  sportName: string;
  levelName: string;
}

export default function OnboardingContainer() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [userId, setUserId] = useState<string>('');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [sportsData, setSportsData] = useState<SportSelection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { setIsOnboarding } = useAuth();

  // Pas besoin d'initialisation complexe - juste forcer le mode onboarding une fois
  useEffect(() => {
    console.log('📋 OnboardingContainer: Setting onboarding mode');
    setIsOnboarding(true);
  }, [setIsOnboarding]); // Ajouter la dépendance

  const steps = useMemo(
    () => ['welcome', 'terms', 'privacy', 'credentials', 'profile', 'sports', 'hobbies', 'completion'] as OnboardingStep[],
    []
  );
  const currentStepIndex = steps.indexOf(currentStep);

  // Calcule les étapes à afficher dans la barre de progression (exclut welcome, terms, privacy, completion)
  const progressSteps = useMemo(
    () => steps.filter(s => !['welcome', 'terms', 'privacy', 'completion'].includes(s)),
    [steps]
  );
  // Trouve l'index de l'étape courante dans la progression (0 si pas dans la progression)
  const progressStepIndex = progressSteps.indexOf(currentStep);

  // Removed unused updateOnboardingData function as setOnboardingData is not defined.

  const handleCredentialsNext = (createdUserId: string) => {
    console.log('📝 OnboardingContainer: Credentials completed, user ID:', createdUserId);
    setUserId(createdUserId);
    setCurrentStep('profile');
  };

  const handleProfileNext = (data: ProfileData) => {
    console.log('📝 OnboardingContainer: Profile completed');
    setProfileData(data);
    setCurrentStep('sports');
  };

  const handleSportsNext = (sports: SportSelection[]) => {
    console.log('🏃 OnboardingContainer: Sports completed');
    setSportsData(sports);
    setCurrentStep('hobbies');
  };

  const handleHobbiesNext = (hobbies: string[]) => {
    console.log('🎯 OnboardingContainer: Hobbies completed');
    saveProfileToDatabase(hobbies);
  };

  const saveProfileToDatabase = async (hobbies: string[]) => {
    if (!profileData || !userId) return;

    setIsLoading(true);
    
    try {
      console.log('💾 OnboardingContainer: Saving profile to database...');

      // S'assurer que l'utilisateur est bien authentifié
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('❌ User not authenticated:', userError);
        throw new Error('Utilisateur non authentifié');
      }

      if (user.id !== userId) {
        console.error('❌ User ID mismatch:', user.id, 'vs', userId);
        throw new Error('Incohérence d\'identifiant utilisateur');
      }

      console.log('🔑 Current authenticated user:', user.id);

      // 1. Chercher le profil existant créé automatiquement par la fonction trigger
      const { data: existingProfile, error: profileFetchError } = await supabase
        .from('profile')
        .select('*')
        .eq('id_user', user.id)
        .single();

      let profile;

      if (profileFetchError && profileFetchError.code !== 'PGRST116') {
        // Erreur autre que "pas de résultat trouvé"
        console.error('❌ Error fetching existing profile:', profileFetchError);
        throw new Error('Erreur lors de la récupération du profil');
      }

      if (existingProfile) {
        // Profil existant, le mettre à jour avec les nouvelles données
        console.log('📝 Profile exists, updating with onboarding data:', existingProfile.id);
        
        const updatePayload = {
          firstname: profileData.firstname,
          lastname: profileData.lastname,
          birthdate: profileData.birthdate.toISOString().split('T')[0],
          fully_completed: true, // Marquer comme complété
        };

        const { data: updatedProfile, error: updateError } = await supabase
          .from('profile')
          .update(updatePayload)
          .eq('id', existingProfile.id)
          .select('*')
          .single();

        if (updateError) {
          console.error('❌ Profile update error:', updateError);
          throw new Error(`Erreur lors de la mise à jour du profil: ${updateError.message}`);
        }

        profile = updatedProfile;
        console.log('✅ Profile updated successfully:', profile.id);
      } else {
        // Aucun profil existant, créer un nouveau (cas de fallback)
        console.log('📝 No existing profile found, creating new one');
        
        const profilePayload = {
          id_user: user.id,
          firstname: profileData.firstname,
          lastname: profileData.lastname,
          birthdate: profileData.birthdate.toISOString().split('T')[0],
          score: 0,
          fully_completed: true,
        };

        const { data: newProfile, error: createError } = await supabase
          .from('profile')
          .insert([profilePayload])
          .select('*')
          .single();

        if (createError) {
          console.error('❌ Profile creation error:', createError);
          
          if (createError.code === '42501') {
            throw new Error('Session expirée. Veuillez vous reconnecter.');
          } else if (createError.code === '23505') {
            throw new Error('Un profil existe déjà pour cet utilisateur.');
          } else {
            throw new Error(`Erreur lors de la création du profil: ${createError.message}`);
          }
        }

        profile = newProfile;
        console.log('✅ Profile created successfully:', profile.id);
      }

      // 2. Gérer la localisation si fournie
      if (profileData.location) {
        try {
          const locationId = await locationService.updateLocationInDatabase(
            userId, 
            profileData.location
          );

          // Mettre à jour le profil avec la localisation
          const { error: locationUpdateError } = await supabase
            .from('profile')
            .update({ id_location: locationId })
            .eq('id', profile.id);

          if (locationUpdateError) {
            console.warn('⚠️ Location update failed:', locationUpdateError);
          } else {
            console.log('✅ Location saved and linked to profile');
          }
        } catch (locationError) {
          console.warn('⚠️ Location save failed, continuing without location:', locationError);
        }
      }

      // 3. Sauvegarder les sports
      if (sportsData.length > 0) {
        // D'abord nettoyer les sports existants pour éviter les doublons
        await supabase
          .from('profilesport')
          .delete()
          .eq('id_profile', profile.id);

        const sportsPayload = sportsData.map(sport => ({
          id_profile: profile.id,
          id_sport: sport.sportId,
          id_sport_level: sport.levelId,
        }));

        const { error: sportsError } = await supabase
          .from('profilesport')
          .insert(sportsPayload);

        if (sportsError) {
          console.warn('⚠️ Sports save failed:', sportsError);
        } else {
          console.log('✅ Sports saved:', sportsData.length);
        }
      }

      // 4. Sauvegarder les hobbies
      if (hobbies.length > 0) {
        // D'abord nettoyer les hobbies existants pour éviter les doublons
        await supabase
          .from('profilehobbie')
          .delete()
          .eq('id_profile', profile.id);

        const hobbiesPayload = hobbies.map(hobbyId => ({
          id_profile: profile.id,
          id_hobbie: hobbyId,
          is_highlighted: false,
        }));

        const { error: hobbiesError } = await supabase
          .from('profilehobbie')
          .insert(hobbiesPayload);

        if (hobbiesError) {
          console.warn('⚠️ Hobbies save failed:', hobbiesError);
        } else {
          console.log('✅ Hobbies saved:', hobbies.length);
        }
      }

      console.log('✅ OnboardingContainer: All data saved successfully');
      setCurrentStep('completion');

    } catch (error) {
      console.error('❌ OnboardingContainer: Save error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la sauvegarde de vos données.';
      
      Alert.alert(
        'Erreur de sauvegarde',
        errorMessage,
        [
          { 
            text: 'Réessayer', 
            onPress: () => saveProfileToDatabase(hobbies) 
          },
          { 
            text: 'Ignorer et continuer',
            onPress: () => setCurrentStep('completion')
          },
          { 
            text: 'Annuler', 
            style: 'cancel' 
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentStep = () => {
    console.log('🔄 OnboardingContainer: Rendering step:', currentStep);
    
    switch (currentStep) {
      case 'welcome':
        return (
          <OnboardingWelcome
            onNext={() => setCurrentStep('terms')}
          />
        );
      case 'terms':
        return (
          <OnboardingTerms
            onAccept={() => setCurrentStep('privacy')}
            onBack={() => setCurrentStep('welcome')}
          />
        );
      case 'privacy':
        return (
          <OnboardingPrivacy
            onAccept={() => setCurrentStep('credentials')}
            onBack={() => setCurrentStep('terms')}
          />
        );
      case 'credentials':
        return (
          <OnboardingCredentialsStep
            onNext={handleCredentialsNext}
          />
        );
      
      case 'profile':
        if (!userId) {
          console.error('❌ OnboardingContainer: No userId, returning to credentials');
          setCurrentStep('credentials');
          return null;
        }
        return (
          <OnboardingProfileStep 
            onNext={handleProfileNext}
            onBack={() => setCurrentStep('credentials')}
          />
        );
      
      case 'sports':
        return (
          <OnboardingSports
            onNext={handleSportsNext}
            onBack={() => setCurrentStep('profile')}
          />
        );
      
      case 'hobbies':
        return (
          <OnboardingHobbiesStep
            onNext={handleHobbiesNext}
            onBack={() => setCurrentStep('sports')}
          />
        );
      
      case 'completion':
        return <OnboardingCompletion />;
      
      default:
        return (
          <OnboardingWelcome
            onNext={() => setCurrentStep('credentials')}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Finalisation de votre profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Affiche la barre de progression uniquement pour les étapes concernées */}
      {progressStepIndex >= 0 && (
        <OnboardingProgress 
          currentStep={progressStepIndex}
          totalSteps={progressSteps.length}
        />
      )}
      <View style={styles.content}>
        {renderCurrentStep()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});