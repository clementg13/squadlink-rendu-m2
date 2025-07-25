import { supabase } from '@/lib/supabase';
import { WorkoutSession, WorkoutSessionUser, CreateWorkoutSessionData } from '@/types/workout';

export const workoutService = {
  async createWorkoutSession(data: CreateWorkoutSessionData & { created_by: string }): Promise<WorkoutSession> {
    const now = new Date().toISOString();
    
    const { data: session, error } = await supabase
      .from('workoutsession')
      .insert({
        start_date: data.start_date,
        end_date: data.end_date,
        id_sport: data.id_sport,
        id_group: data.groupId,
        created_at: now,
        created_by: data.created_by, // Ajout du créateur
      })
      .select('*')
      .single();

    if (error) throw error;
    
    // S'assurer que created_at est défini
    if (!session.created_at) {
      session.created_at = now;
    }
    
    return session;
  },

  async joinWorkoutSession(sessionId: number, userId: string): Promise<void> {
    const { error } = await supabase
      .from('workoutsessionuser')
      .insert({
        id_workout_session: sessionId,
        id_user: userId,
      });

    if (error) throw error;
  },

  async leaveWorkoutSession(sessionId: number, userId: string): Promise<void> {
    const { error } = await supabase
      .from('workoutsessionuser')
      .delete()
      .eq('id_workout_session', sessionId)
      .eq('id_user', userId);

    if (error) throw error;
  },

  async getWorkoutSessionParticipants(sessionId: number): Promise<WorkoutSessionUser[]> {
    // Faire une jointure manuelle puisque Supabase ne trouve pas la relation
    const { data: participantsData, error: participantsError } = await supabase
      .from('workoutsessionuser')
      .select('*')
      .eq('id_workout_session', sessionId);

    if (participantsError) throw participantsError;

    if (!participantsData || participantsData.length === 0) {
      return [];
    }

    // Récupérer les profils des participants
    const userIds = participantsData.map(p => p.id_user);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profile')
      .select('id_user, firstname, lastname')
      .in('id_user', userIds);

    if (profilesError) throw profilesError;

    // Combiner les données
    return participantsData.map(participant => {
      const userProfile = profilesData?.find(profile => profile.id_user === participant.id_user);
      return {
        id_workout_session: participant.id_workout_session,
        id_user: participant.id_user,
        user: userProfile ? {
          firstname: userProfile.firstname || 'Prénom',
          lastname: userProfile.lastname || 'Nom',
        } : {
          firstname: 'Utilisateur',
          lastname: 'Inconnu',
        },
      };
    });
  },

  async getWorkoutSessionWithParticipants(sessionId: number): Promise<WorkoutSession> {
    // Récupérer la session
    const { data: session, error: sessionError } = await supabase
      .from('workoutsession')
      .select(`
        *,
        sport(id, name)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError) throw sessionError;

    // Récupérer les participants
    const participants = await this.getWorkoutSessionParticipants(sessionId);

    return {
      ...session,
      participants,
      participantCount: participants.length,
    };
  },

  // Nouvelle méthode pour récupérer les séances d'un groupe
  async getGroupWorkoutSessions(groupId: number): Promise<WorkoutSession[]> {
    try {
      console.log('🔍 Récupération des séances pour le groupe:', groupId);
      
      // Récupérer les séances du groupe avec les sports
      const { data: sessions, error: sessionsError } = await supabase
        .from('workoutsession')
        .select(`
          *,
          sport(id, name)
        `)
        .eq('id_group', groupId)
        .order('created_at', { ascending: true });

      if (sessionsError) throw sessionsError;

      if (!sessions || sessions.length === 0) {
        return [];
      }

      console.log('📋 Sessions récupérées depuis la DB:', sessions);

      // Valider et nettoyer les dates plus strictement
      const validSessions = sessions.filter(session => {
        try {
          const startDate = new Date(session.start_date);
          const endDate = new Date(session.end_date);
          let createdAt = session.created_at ? new Date(session.created_at) : new Date();
          
          // Validation stricte des dates
          const isStartValid = startDate instanceof Date && !isNaN(startDate.getTime()) && startDate.getFullYear() > 1970 && startDate.getFullYear() < 2100;
          const isEndValid = endDate instanceof Date && !isNaN(endDate.getTime()) && endDate.getFullYear() > 1970 && endDate.getFullYear() < 2100;
          const isCreatedValid = createdAt instanceof Date && !isNaN(createdAt.getTime()) && createdAt.getFullYear() > 1970 && createdAt.getFullYear() < 2100;
          
          if (!isStartValid || !isEndValid || !isCreatedValid) {
            console.warn('⚠️ Session avec dates invalides ignorée:', {
              id: session.id,
              start_date: session.start_date,
              end_date: session.end_date,
              created_at: session.created_at,
              isStartValid,
              isEndValid,
              isCreatedValid
            });
            return false;
          }
          
          return true;
        } catch (error) {
          console.warn('⚠️ Erreur validation session:', session.id, error);
          return false;
        }
      });

      console.log('✅ Sessions avec dates valides:', validSessions.length);

      // Pour chaque séance valide, récupérer les participants
      const sessionsWithParticipants = await Promise.all(
        validSessions.map(async (session) => {
          try {
            const participants = await this.getWorkoutSessionParticipants(session.id);
            
            // S'assurer que toutes les dates sont des ISO strings valides
            const cleanSession = {
              ...session,
              start_date: new Date(session.start_date).toISOString(),
              end_date: new Date(session.end_date).toISOString(),
              created_at: session.created_at ? new Date(session.created_at).toISOString() : new Date().toISOString(),
              participants,
              participantCount: participants.length,
            };
            
            return cleanSession;
          } catch (error) {
            console.error('❌ Erreur lors de la récupération des participants pour la session', session.id, ':', error);
            return {
              ...session,
              start_date: new Date(session.start_date).toISOString(),
              end_date: new Date(session.end_date).toISOString(),
              created_at: session.created_at ? new Date(session.created_at).toISOString() : new Date().toISOString(),
              participants: [],
              participantCount: 0,
            };
          }
        })
      );

      return sessionsWithParticipants;
    } catch (error) {
      console.error('❌ Erreur getGroupWorkoutSessions:', error);
      return [];
    }
  },

  async isUserParticipating(sessionId: number, userId: string): Promise<boolean> {
    const participants = await this.getWorkoutSessionParticipants(sessionId);
    return participants.some((member) => member.id_user === userId);
  },

  async deleteWorkoutSession(sessionId: number, userId: string): Promise<void> {
    // Vérifier que l'utilisateur est bien le créateur
    const { data: session, error: fetchError } = await supabase
      .from('workoutsession')
      .select('created_by')
      .eq('id', sessionId)
      .single();

    if (fetchError) throw fetchError;
    if (!session || session.created_by !== userId) {
      throw new Error('Vous n\'êtes pas autorisé à supprimer cette séance');
    }

    const { error } = await supabase
      .from('workoutsession')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
  },
};
