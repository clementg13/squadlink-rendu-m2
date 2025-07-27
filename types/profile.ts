// Note: Les types CompatibleProfile sont maintenant définis dans services/compatibleProfileService.ts

// Types pour les données de base
export interface Location {
  id: string;
  town: string;
  postal_code: string;
  location: string;
}

export interface Gym {
  id: string;
  name: string;
}

export interface GymSubscription {
  id: string;
  name: string;
  id_gym: string;
}

export interface Hobbie {
  id: string;
  name: string;
}

export interface Sport {
  id: string;
  name: string;
}

export interface SportLevel {
  id: string;
  name: string;
}

export interface ProfileHobby {
  id: string;
  id_profile: string;
  id_hobbie: string;
  is_highlighted: boolean;
  hobbie?: Hobbie;
}

export interface ProfileSport {
  id_profile: string;
  id_sport: string;
  id_sport_level: string;
  sport?: Sport;
  sportlevel?: SportLevel;
}

export interface SocialMedia {
  id: string;
  name: string;
}

export interface ProfileSocialMedia {
  id_profile: string;
  id_social_media: string;
  username: string;
  socialmedia?: SocialMedia;
}

export interface UserProfile {
  id_user: string;
  lastname?: string;
  firstname?: string;
  birthdate?: string;
  id_location?: string;
  id_gym?: string;
  score?: number;
  id_gymsubscription?: string;
  fully_completed?: boolean;
  biography?: string;
  created_at?: string;
  updated_at?: string;
  
  // Relations populées
  location?: Location;
  gym?: Gym;
  gymsubscription?: GymSubscription;
  hobbies?: ProfileHobby[];
  sports?: ProfileSport[];
  socialMedias?: ProfileSocialMedia[];
}

export interface ProfileState {
  // État
  profile: UserProfile | null;
  gyms: Gym[];
  gymSubscriptions: GymSubscription[];
  hobbies: Hobbie[];
  sports: Sport[];
  sportLevels: SportLevel[];
  socialMedias: SocialMedia[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  initialized: boolean;
}
