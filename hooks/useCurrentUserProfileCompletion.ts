import { useState, useEffect } from 'react';
import { useAuthUser } from '@/stores/authStore';
import { useProfile } from '@/stores/profileStore';

interface ProfileCompletionStatus {
  isComplete: boolean;
  isLoading: boolean;
  completionPercentage: number;
  missingFields: string[];
  error: string | null;
}

export function useCurrentUserProfileCompletion(): ProfileCompletionStatus {
  const user = useAuthUser();
  const { profile, hobbies: userHobbies, sports: userSports, loading } = useProfile();
  
  const [status, setStatus] = useState<ProfileCompletionStatus>({
    isComplete: false,
    isLoading: true,
    completionPercentage: 0,
    missingFields: [],
    error: null,
  });

  useEffect(() => {
    console.log('🔍 useCurrentUserProfileCompletion: Effect triggered', {
      userId: user?.id,
      hasProfile: !!profile,
      loading,
      profileUserId: profile?.id_user,
      sportsCount: userSports?.length || 0,
      hobbiesCount: userHobbies?.length || 0
    });

    if (!user?.id) {
      console.log('❌ useCurrentUserProfileCompletion: No user ID');
      setStatus({
        isComplete: false,
        isLoading: false,
        completionPercentage: 0,
        missingFields: ['utilisateur non connecté'],
        error: 'Utilisateur non connecté',
      });
      return;
    }

    if (loading) {
      console.log('🔄 useCurrentUserProfileCompletion: Still loading...');
      setStatus(prev => ({ ...prev, isLoading: true }));
      return;
    }

    // Donner plus de temps pour le chargement du profil
    if (!profile && loading) {
      console.log('⏳ useCurrentUserProfileCompletion: Waiting for profile...');
      setStatus(prev => ({ ...prev, isLoading: true }));
      return;
    }

    if (!profile) {
      console.log('⚠️ useCurrentUserProfileCompletion: No profile found, marking as incomplete');
      setStatus({
        isComplete: false,
        isLoading: false,
        completionPercentage: 0,
        missingFields: ['profil en cours de chargement'],
        error: null,
      });
      return;
    }

    // Vérifier les champs requis pour un profil complet
    const checks = [
      { 
        field: 'nom/prénom', 
        valid: !!(profile.firstname && profile.lastname) 
      },
      { 
        field: 'âge', 
        valid: !!profile.birthdate 
      },
      { 
        field: 'localisation', 
        valid: !!profile.id_location 
      },
      { 
        field: 'sports', 
        valid: !!(userSports && userSports.length > 0) 
      },
      { 
        field: 'hobbies', 
        valid: !!(userHobbies && userHobbies.length > 0) 
      },
    ];

    const validChecks = checks.filter(check => check.valid).length;
    const completionPercentage = Math.round((validChecks / checks.length) * 100);
    const missingFields = checks.filter(check => !check.valid).map(check => check.field);
    const isComplete = validChecks === checks.length;

    console.log('📊 useCurrentUserProfileCompletion: Profile completion calculated', {
      completionPercentage,
      validChecks,
      totalChecks: checks.length,
      isComplete,
      missingFields,
      checks: checks.map(c => ({ field: c.field, valid: c.valid }))
    });

    setStatus({
      isComplete,
      isLoading: false,
      completionPercentage,
      missingFields,
      error: null,
    });

  }, [user?.id, profile, userHobbies, userSports, loading]);

  return status;
} 