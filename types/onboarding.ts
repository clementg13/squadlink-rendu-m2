export interface OnboardingCredentials {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface OnboardingProfile {
  lastname: string;
  firstname: string;
  birthdate: Date | null;
  location?: {
    town: string;
    postal_code: number;
    latitude: number;
    longitude: number;
  };
}

export interface OnboardingSport {
  sportId: string;
  levelId: string;
}

export interface OnboardingHobbies {
  hobbyIds: string[];
}

export interface OnboardingData {
  credentials: OnboardingCredentials;
  profile: OnboardingProfile;
  sports: OnboardingSport[];
  hobbies: OnboardingHobbies;
}

export type OnboardingStep = 
  | 'welcome'
  | 'credentials' 
  | 'profile'
  | 'sports'
  | 'hobbies'
  | 'completion';
