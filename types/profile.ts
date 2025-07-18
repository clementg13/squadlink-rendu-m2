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

export interface ProfileHobby {
  id: string;
  id_profile: string;
  id_hobbie: string;
  is_highlighted: boolean;
  hobbie?: Hobbie;
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
}

export interface ProfileState {
  // État
  profile: UserProfile | null;
  gyms: Gym[];
  gymSubscriptions: GymSubscription[];
  hobbies: Hobbie[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  initialized: boolean;
}
