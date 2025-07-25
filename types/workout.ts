export interface WorkoutSession {
  id: number;
  start_date: string;
  end_date: string;
  created_at: string; // Ajouter created_at
  id_sport?: string;
  id_group?: number; // Ajouter le champ id_group
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
}
