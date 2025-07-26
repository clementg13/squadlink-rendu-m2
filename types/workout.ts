export interface WorkoutSession {
  id: number;
  start_date: string;
  end_date: string;
  created_at?: string;
  created_by?: string; // Ajout du champ créateur
  id_sport: string;
  id_group?: number;
  sport?: {
    id: string;
    name: string;
  };
  participants?: WorkoutSessionUser[];
  participantCount?: number;
}

export interface WorkoutSessionUser {
  id_workout_session: number;
  id_user: string;
  user?: {
    firstname: string;
    lastname: string;
  };
}

export interface CreateWorkoutSessionData {
  start_date: string;
  end_date: string;
  id_sport: string;
  groupId: number;
  created_by?: string; // Optionnel pour la compatibilité
}
