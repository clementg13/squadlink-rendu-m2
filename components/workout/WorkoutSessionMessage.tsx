import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { WorkoutSession, WorkoutSessionUser } from '@/types/workout';

interface WorkoutSessionMessageProps {
  session: WorkoutSession;
  currentUserId: string;
  isParticipating: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onDelete?: () => void; // Ajout prop
}

export default function WorkoutSessionMessage({
  session,
  currentUserId,
  isParticipating,
  onJoin,
  onLeave,
  onDelete,
}: WorkoutSessionMessageProps) {
  const [showParticipants, setShowParticipants] = useState(false);

  // Ajout d'une fallback pour created_by si jamais il n'est pas dans session
  // (utile si tu utilises des mocks ou des anciennes données)
  const createdBy = (session as any).created_by ?? session.created_by ?? '';

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Date invalide dans formatDate:', dateString);
        return 'Date invalide';
      }
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      console.error('❌ Erreur formatDate:', error, 'pour:', dateString);
      return 'Date invalide';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Date invalide dans formatTime:', dateString);
        return 'Heure invalide';
      }
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('❌ Erreur formatTime:', error, 'pour:', dateString);
      return 'Heure invalide';
    }
  };

  const renderParticipant = ({ item }: { item: WorkoutSessionUser }) => (
    <View style={styles.participantItem}>
      <FontAwesome name="user" size={16} color="#666" />
      <Text style={styles.participantName}>
        {item.user?.firstname && item.user?.lastname 
          ? `${item.user.firstname} ${item.user.lastname}`
          : `Utilisateur ${item.id_user.substring(0, 8)}...`
        }
      </Text>
      {item.id_user === currentUserId && (
        <Text style={styles.participantBadge}>Vous</Text>
      )}
    </View>
  );

  return (
    <View style={styles.sessionContainer}>
      <View style={styles.sessionHeader}>
        <FontAwesome name="bolt" size={20} color="#007AFF" />
        <Text style={styles.sessionTitle}>Séance d'entraînement</Text>
        {/* Bouton supprimer déplacé dans le header */}
        {onDelete && createdBy && currentUserId && createdBy === currentUserId && (
          <TouchableOpacity
            style={styles.deleteButtonHeader}
            onPress={onDelete}
            testID="delete-session"
          >
            <FontAwesome name="trash" size={16} color="#ff3b30" />
          </TouchableOpacity>
        )}
      </View>

      {session.sport && (
        <Text style={styles.sportName}>🏃‍♂️ {session.sport.name}</Text>
      )}

      <View style={styles.sessionDetails}>
        <View style={styles.detailRow}>
          <FontAwesome name="calendar" size={14} color="#666" />
          <Text style={styles.detailText}>{formatDate(session.start_date)}</Text>
        </View>

        <View style={styles.detailRow}>
          <FontAwesome name="clock-o" size={14} color="#666" />
          <Text style={styles.detailText}>
            De {formatTime(session.start_date)} à {formatTime(session.end_date)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <FontAwesome name="users" size={14} color="#666" />
          <Text style={styles.detailText}>
            {session.participantCount || 0} participant{(session.participantCount || 0) !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <View style={styles.participantsSection}>
        <TouchableOpacity
          style={styles.participantsInfo}
          onPress={() => setShowParticipants(true)}
        >
          <Text style={styles.participantsLabel}>Voir les participants</Text>
          <FontAwesome name="info-circle" size={16} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            isParticipating ? styles.leaveButton : styles.joinButton
          ]}
          onPress={isParticipating ? onLeave : onJoin}
        >
          <Text style={[
            styles.actionButtonText,
            isParticipating ? styles.leaveButtonText : styles.joinButtonText
          ]}>
            {isParticipating ? 'Ne plus participer' : 'Je participe !'}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Modal des participants */}
      <Modal
        visible={showParticipants}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Participants ({session.participantCount || 0})
            </Text>
            <TouchableOpacity onPress={() => setShowParticipants(false)}>
              <FontAwesome name="times" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {session.participants && session.participants.length > 0 ? (
            <FlatList
              data={session.participants}
              renderItem={renderParticipant}
              keyExtractor={(item) => `${item.id_workout_session}-${item.id_user}`}
              style={styles.participantsList}
            />
          ) : (
            <View style={styles.emptyParticipants}>
              <FontAwesome name="users" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Aucun participant pour le moment</Text>
              <Text style={styles.emptySubtext}>Soyez le premier à participer !</Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  sessionContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ajout pour espacer les éléments
    marginBottom: 8,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
    flex: 1, // Prend l'espace disponible
  },
  deleteButtonHeader: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  sportName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sessionDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  participantsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsLabel: {
    fontSize: 14,
    color: '#007AFF',
    marginRight: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButton: {
    backgroundColor: '#007AFF',
  },
  leaveButton: {
    backgroundColor: '#ff3b30',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  joinButtonText: {
    color: '#fff',
  },
  leaveButtonText: {
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  participantsList: {
    flex: 1,
    padding: 16,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  participantName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  participantBadge: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyParticipants: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});