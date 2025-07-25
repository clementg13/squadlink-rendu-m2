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
      
      // Optimiser en une seule requête avec jointure
      const { data: groupUsersData, error: groupUsersError } = await supabase
        .from('groupuser')
        .select(`
          id_user,
          profile:id_user (
            firstname,
            lastname
          )
        `)
        .eq('id_group', groupId);

      if (groupUsersError) {
        console.error('❌ GroupService: Error:', groupUsersError);
        // Fallback à l'ancienne méthode en cas d'erreur de jointure
        return this.getGroupMembersFallback(groupId);
      }

      if (!groupUsersData || groupUsersData.length === 0) {
        return [];
      }

      // Mapper directement les résultats
      const result = groupUsersData.map(groupUser => {
        const profile = groupUser.profile as any;
        
        if (profile && profile.firstname && profile.lastname) {
          return {
            id_user: groupUser.id_user,
            user: {
              firstname: profile.firstname,
              lastname: profile.lastname,
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

      console.log('✅ GroupService: Found', result.length, 'members');
      return result;

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
        return [];
      }

      const validUserIds = groupUsersData
        .filter(gu => gu.id_user && typeof gu.id_user === 'string')
        .map(gu => gu.id_user);

      if (validUserIds.length === 0) {
        return [];
      }

      let profilesData: any[] = [];
      
      // Essayer d'abord la requête normale
      const { data: normalProfiles } = await supabase
        .from('profile')
        .select('id_user, firstname, lastname')
        .in('id_user', validUserIds);

      if (normalProfiles) {
        profilesData = normalProfiles;
      }

      // Si pas assez de profils, créer des fallbacks
      if (profilesData.length < validUserIds.length) {
        const foundUserIds = profilesData.map(p => p.id_user);
        const missingUserIds = validUserIds.filter(id => !foundUserIds.includes(id));
        
        for (const userId of missingUserIds) {
          profilesData.push({
            id_user: userId,
            firstname: 'Membre',
            lastname: userId.substring(0, 8),
          });
        }
      }

      return groupUsersData.map(groupUser => {
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

    } catch (error) {
      console.error('❌ GroupService: Fallback failed:', error);
      return [];
    }
  },
};