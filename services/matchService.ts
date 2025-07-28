import { supabase } from '@/lib/supabase';

export interface MatchResult {
  success: boolean;
  message: string;
  match_id?: number;
}

export interface Match {
  id: number;
  id_user_initiator: string;
  id_user_receiver: string;
  date_initiation: string;
  is_accepted: boolean | null;
  is_closed: boolean;
  created_at: string;
}

export class MatchService {
  /**
   * Initie un match avec un autre utilisateur
   * @param targetUserId - ID de l'utilisateur cible
   * @returns Promise<MatchResult>
   */
  static async initiateMatch(targetUserId: string): Promise<MatchResult> {
    try {
      console.log('💕 MatchService: Initiating match with user:', targetUserId);
      
      // Récupérer l'utilisateur actuel
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('❌ MatchService: User not authenticated');
        return {
          success: false,
          message: 'Vous devez être connecté pour initier un match'
        };
      }

      // Appeler la fonction Supabase
      const { data, error } = await supabase
        .rpc('initiate_match', {
          initiator_user_id: user.id,
          target_user_id: targetUserId
        });

      if (error) {
        console.error('❌ MatchService: Match initiation failed:', error);
        return {
          success: false,
          message: error.message || 'Erreur lors de l\'initiation du match'
        };
      }

      if (data && data.length > 0) {
        const result = data[0];
        console.log('✅ MatchService: Match result:', result);
        
        return {
          success: result.success,
          message: result.message,
          match_id: result.match_id
        };
      }

      return {
        success: false,
        message: 'Réponse inattendue du serveur'
      };

    } catch (error) {
      console.error('❌ MatchService: Unexpected error:', error);
      return {
        success: false,
        message: 'Erreur inattendue lors de l\'initiation du match'
      };
    }
  }

  /**
   * Récupère les matches de l'utilisateur actuel
   * @returns Promise<Match[]>
   */
  static async getUserMatches(): Promise<Match[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('❌ MatchService: User not authenticated');
        return [];
      }

      const { data, error } = await supabase
        .from('match')
        .select('*')
        .or(`id_user_initiator.eq.${user.id},id_user_receiver.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ MatchService: Failed to fetch matches:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ MatchService: Unexpected error fetching matches:', error);
      return [];
    }
  }

  /**
   * Vérifie si un match existe déjà avec un utilisateur
   * @param targetUserId - ID de l'utilisateur cible
   * @returns Promise<boolean>
   */
  static async hasExistingMatch(targetUserId: string): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return false;
      }

      const { data, error } = await supabase
        .from('match')
        .select('id')
        .or(`id_user_initiator.eq.${user.id},id_user_receiver.eq.${user.id}`)
        .or(`id_user_initiator.eq.${targetUserId},id_user_receiver.eq.${targetUserId}`)
        .limit(1);

      if (error) {
        console.error('❌ MatchService: Failed to check existing match:', error);
        return false;
      }

      return (data && data.length > 0);
    } catch (error) {
      console.error('❌ MatchService: Unexpected error checking match:', error);
      return false;
    }
  }

  /**
   * Récupère le statut détaillé d'un match avec un utilisateur
   * @param targetUserId - ID de l'utilisateur cible
   * @returns Promise<{ exists: boolean; isAccepted: boolean; isInitiator: boolean }>
   */
  static async getMatchStatus(targetUserId: string): Promise<{ exists: boolean; isAccepted: boolean; isInitiator: boolean }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { exists: false, isAccepted: false, isInitiator: false };
      }

      const { data, error } = await supabase
        .from('match')
        .select('id, is_accepted, id_user_initiator, id_user_receiver')
        .or(`id_user_initiator.eq.${user.id},id_user_receiver.eq.${user.id}`)
        .or(`id_user_initiator.eq.${targetUserId},id_user_receiver.eq.${targetUserId}`)
        .limit(1);

      if (error) {
        console.error('❌ MatchService: Failed to get match status:', error);
        return { exists: false, isAccepted: false, isInitiator: false };
      }

      if (!data || data.length === 0) {
        return { exists: false, isAccepted: false, isInitiator: false };
      }

      const match = data[0];
      const isInitiator = match.id_user_initiator === user.id;
      const isAccepted = match.is_accepted === true;

      return {
        exists: true,
        isAccepted,
        isInitiator
      };
    } catch (error) {
      console.error('❌ MatchService: Unexpected error getting match status:', error);
      return { exists: false, isAccepted: false, isInitiator: false };
    }
  }
} 