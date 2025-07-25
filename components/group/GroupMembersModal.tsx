import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { GroupMember } from '@/services/groupService';

interface GroupMembersModalProps {
  visible: boolean;
  members: GroupMember[];
  onClose: () => void;
  groupName?: string;
}

export default function GroupMembersModal({
  visible,
  members,
  onClose,
  groupName,
}: GroupMembersModalProps) {
  
  console.log('👥 GroupMembersModal: Rendering with', members.length, 'members');
  console.log('👥 GroupMembersModal: Members data:', members);

  const renderMember = ({ item }: { item: GroupMember }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberAvatar}>
        <FontAwesome name="user" size={20} color="#666" />
      </View>
      <Text style={styles.memberName}>
        {item.user.firstname} {item.user.lastname}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Membres du groupe{groupName ? ` - ${groupName}` : ''}
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <FontAwesome name="times" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.memberCount}>
          <FontAwesome name="users" size={16} color="#666" />
          <Text style={styles.memberCountText}>
            {members.length} membre{members.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Debug info */}
        {__DEV__ && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>
              Debug: {members.length} membres chargés
            </Text>
            {members.length > 0 && (
              <Text style={styles.debugText}>
                Premier membre: {members[0].user.firstname} {members[0].user.lastname}
              </Text>
            )}
          </View>
        )}

        {/* Toujours afficher la liste, même vide */}
        <FlatList
          data={members}
          renderItem={renderMember}
          keyExtractor={(item) => item.id_user}
          style={styles.membersList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <FontAwesome name="users" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Aucun membre trouvé</Text>
              <Text style={styles.emptySubtext}>
                Il semble y avoir un problème avec le chargement des membres
              </Text>
            </View>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    padding: 4,
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  memberCountText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  membersList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  debugInfo: {
    backgroundColor: '#ffe6e6',
    padding: 8,
    margin: 16,
    borderRadius: 4,
  },
  debugText: {
    fontSize: 12,
    color: '#d63384',
  },
});
