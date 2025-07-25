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
      console.log('🔍 GroupService: Starting getGroupMembers for group:', groupId);
      console.log('🔍 GroupService: Group ID type:', typeof groupId);
      
      // Validation de l'ID du groupe
      if (!groupId || isNaN(groupId) || groupId <= 0) {
        console.error('❌ GroupService: Invalid group ID:', groupId);
        return [];
      }
      
      // Étape 1: Récupérer les utilisateurs du groupe
      console.log('🔍 GroupService: Fetching group users from groupuser table...');
      const { data: groupUsersData, error: groupUsersError } = await supabase
        .from('groupuser')
        .select('id_user')
        .eq('id_group', groupId);

      if (groupUsersError) {
        console.error('❌ GroupService: Error fetching group users:', groupUsersError);
        throw groupUsersError;
      }

      if (!groupUsersData || groupUsersData.length === 0) {
        console.log('📋 GroupService: No users found in group');
        return [];
      }

      console.log('✅ GroupService: Found group users:', groupUsersData.length);

      const validUserIds = groupUsersData
        .filter(gu => gu.id_user && typeof gu.id_user === 'string' && gu.id_user.trim() !== '')
        .map(gu => gu.id_user);

      if (validUserIds.length === 0) {
        console.log('📋 GroupService: No valid user IDs found');
        return [];
      }

      console.log('✅ GroupService: Valid user IDs:', validUserIds);

      // Étape 2: Essayer plusieurs approches pour récupérer les profils
      let profilesData: any[] = [];
      
      // Approche 1: Requête normale (peut être bloquée par RLS)
      console.log('🔍 GroupService: Trying normal query...');
      const { data: normalProfiles, error: normalError } = await supabase
        .from('profile')
        .select('id, id_user, firstname, lastname')
        .in('id_user', validUserIds);

      if (!normalError && normalProfiles) {
        profilesData = normalProfiles;
        console.log('✅ GroupService: Normal query worked, found:', profilesData.length);
      } else {
        console.log('⚠️ GroupService: Normal query failed or limited by RLS');
      }

      // Approche 2: Si la requête normale ne récupère pas tous les profils, essayer une fonction RPC
      if (profilesData.length < validUserIds.length) {
        console.log('🔍 GroupService: Trying RPC function to bypass RLS...');
        
        try {
          const { data: rpcProfiles, error: rpcError } = await supabase
            .rpc('get_group_members_profiles', { 
              group_id: groupId,
              user_ids: validUserIds 
            });

          if (!rpcError && rpcProfiles && rpcProfiles.length > profilesData.length) {
            profilesData = rpcProfiles;
            console.log('✅ GroupService: RPC query worked, found:', profilesData.length);
          }
        } catch (rpcError) {
          console.log('⚠️ GroupService: RPC function not available');
        }
      }

      // Approche 3: Si tout échoue, créer des profils par défaut avec les informations disponibles
      if (profilesData.length < validUserIds.length) {
        console.log('🔍 GroupService: Creating fallback profiles for missing users');
        
        const foundUserIds = profilesData.map(p => p.id_user);
        const missingUserIds = validUserIds.filter(id => !foundUserIds.includes(id));
        
        // Pour les utilisateurs manquants, créer des entrées avec des noms génériques
        for (const userId of missingUserIds) {
          profilesData.push({
            id_user: userId,
            firstname: 'Membre',
            lastname: userId.substring(0, 8),
            id: null
          });
        }
        
        console.log('✅ GroupService: Added fallback profiles, total:', profilesData.length);
      }

      console.log('📋 GroupService: Final profiles found:', profilesData.length);
      if (profilesData && profilesData.length > 0) {
        profilesData.forEach(profile => {
          console.log(`🔍 Profile - ID_USER: ${profile.id_user}, NAME: ${profile.firstname} ${profile.lastname}`);
        });
      }

      // Étape 3: Combiner les données
      const result = groupUsersData
        .filter(groupUser => validUserIds.includes(groupUser.id_user))
        .map((groupUser, index) => {
          const userProfile = profilesData?.find(profile => profile.id_user === groupUser.id_user);
          
          if (userProfile && userProfile.firstname && userProfile.lastname) {
            console.log(`✅ GroupService: Mapping profile for ${groupUser.id_user}: ${userProfile.firstname} ${userProfile.lastname}`);
            return {
              id_user: groupUser.id_user,
              user: {
                firstname: userProfile.firstname,
                lastname: userProfile.lastname,
              },
            };
          } else {
            console.log(`⚠️ GroupService: No profile found for ${groupUser.id_user}, using fallback`);
            const userIdShort = groupUser.id_user.substring(0, 8);
            return {
              id_user: groupUser.id_user,
              user: {
                firstname: `Membre`,
                lastname: `${userIdShort}`,
              },
            };
          }
        });

      console.log('🎉 GroupService: Final result:', result.length, 'members');
      if (result.length > 0) {
        console.log('🔍 GroupService: All members:', result.map(m => `${m.user.firstname} ${m.user.lastname}`));
      }
      
      return result;

    } catch (error) {
      console.error('❌ GroupService: Exception in getGroupMembers:', error);
      
      // Retourner un résultat par défaut en cas d'erreur
      return [{
        id_user: 'error',
        user: {
          firstname: 'Erreur',
          lastname: 'de chargement',
        },
      }];
    }
  },
};