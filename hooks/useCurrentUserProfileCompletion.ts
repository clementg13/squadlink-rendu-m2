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
    if (!user?.id) {
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
      setStatus(prev => ({ ...prev, isLoading: true }));
      return;
    }

    if (!profile) {
      setStatus({
        isComplete: false,
        isLoading: false,
        completionPercentage: 0,
        missingFields: ['profil non créé'],
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