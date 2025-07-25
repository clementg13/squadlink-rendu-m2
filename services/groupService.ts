import { supabase } from '@/lib/supabase';

export interface GroupMember {
  id_user: string;
  user: {
    firstname: string;
    lastname: string;
  };
}

export const groupService = {
  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    try {
      // Réduire les logs pour accélérer
      console.log('🔍 GroupService: Getting members for group:', groupId);
      
      if (!groupId || isNaN(groupId) || groupId <= 0) {
        return [];
      }
      
      // La jointure directe ne fonctionne pas, utiliser l'approche fallback directement
      console.log('🔍 GroupService: Using fallback method due to join limitations');
      return this.getGroupMembersFallback(groupId);

    } catch (error) {
      console.error('❌ GroupService: Exception:', error);
      // Fallback à l'ancienne méthode
      return this.getGroupMembersFallback(groupId);
    }
  },

  // Méthode fallback (ancienne méthode) en cas d'échec de la jointure
  async getGroupMembersFallback(groupId: number): Promise<GroupMember[]> {
    try {
      const { data: groupUsersData, error: groupUsersError } = await supabase
        .from('groupuser')
        .select('id_user')
        .eq('id_group', groupId);

      if (groupUsersError || !groupUsersData || groupUsersData.length === 0) {
        console.log('📋 GroupService: No users found in group or error:', groupUsersError?.message);
        return [];
      }

      const validUserIds = groupUsersData
        .filter(gu => gu.id_user && typeof gu.id_user === 'string')
        .map(gu => gu.id_user);

      if (validUserIds.length === 0) {
        return [];
      }

      console.log('✅ GroupService: Found valid user IDs:', validUserIds.length);

      let profilesData: any[] = [];
      
      // Essayer d'abord la requête normale
      const { data: normalProfiles, error: profilesError } = await supabase
        .from('profile')
        .select('id_user, firstname, lastname')
        .in('id_user', validUserIds);

      if (profilesError) {
        console.warn('⚠️ GroupService: Profile query error:', profilesError.message);
        // Continue with empty profiles array
        profilesData = [];
      } else if (normalProfiles) {
        profilesData = normalProfiles;
        console.log('✅ GroupService: Found profiles:', profilesData.length);
      }

      // Si pas assez de profils, créer des fallbacks pour tous les utilisateurs manquants
      if (profilesData.length < validUserIds.length) {
        const foundUserIds = profilesData.map(p => p.id_user);
        const missingUserIds = validUserIds.filter(id => !foundUserIds.includes(id));
        
        console.log('⚠️ GroupService: Creating fallbacks for missing users:', missingUserIds.length);
        
        for (const userId of missingUserIds) {
          profilesData.push({
            id_user: userId,
            firstname: 'Membre',
            lastname: userId.substring(0, 8),
          });
        }
      }

      // Mapper les résultats finaux
      const result = groupUsersData.map(groupUser => {
        const userProfile = profilesData.find(profile => profile.id_user === groupUser.id_user);
        
        if (userProfile && userProfile.firstname && userProfile.lastname) {
          return {
            id_user: groupUser.id_user,
            user: {
              firstname: userProfile.firstname,
              lastname: userProfile.lastname,
            },
          };
        } else {
          const userIdShort = groupUser.id_user.substring(0, 8);
          return {
            id_user: groupUser.id_user,
            user: {
              firstname: 'Membre',
              lastname: userIdShort,
            },
          };
        }
      });

      console.log('✅ GroupService: Final result:', result.length, 'members');
      return result;

    } catch (error) {
      console.error('❌ GroupService: Fallback failed:', error);
      return [];
    }
  },
};