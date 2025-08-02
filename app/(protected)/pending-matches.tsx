import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { MatchService, Match } from '@/services/matchService';
import { profileService } from '@/services/profileService';
import { useMatchRefreshStore } from '@/stores/matchRefreshStore';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';

interface PendingMatchWithUser extends Match {
  id_user_initiator_details?: {
    id_user: string;
    firstname: string;
    lastname: string;
    birthdate?: string;
    biography?: string;
  } | null;
}

export default function PendingMatchesScreen() {
  const [pendingMatches, setPendingMatches] = useState<PendingMatchWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const triggerRefresh = useMatchRefreshStore((state) => state.triggerRefresh);

  useEffect(() => {
    loadPendingMatches();
  }, []);

  const loadPendingMatches = async () => {
    try {
      setIsLoading(true);
      const matches = await MatchService.getPendingReceivedMatches();
      setPendingMatches(matches as PendingMatchWithUser[]);
    } catch (error) {
      console.error('❌ PendingMatchesScreen: Error loading matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPendingMatches();
    setRefreshing(false);
  };

  const handleAcceptMatch = async (matchId: number) => {
    try {
      const result = await MatchService.acceptMatch(matchId);
      if (result.success) {
        Alert.alert('Succès', result.message);
        loadPendingMatches();
        triggerRefresh(); // Déclencher le rafraîchissement
      } else {
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      console.error('❌ PendingMatchesScreen: Error accepting match:', error);
      Alert.alert('Erreur', 'Impossible d\'accepter la demande');
    }
  };

  const handleRejectMatch = async (matchId: number) => {
    Alert.alert(
      'Refuser la demande',
      'Êtes-vous sûr de vouloir refuser cette demande d\'ami ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await MatchService.rejectMatch(matchId);
              if (result.success) {
                Alert.alert('Succès', result.message);
                loadPendingMatches();
                triggerRefresh(); // Déclencher le rafraîchissement
              } else {
                Alert.alert('Erreur', result.message);
              }
            } catch (error) {
              console.error('❌ PendingMatchesScreen: Error rejecting match:', error);
              Alert.alert('Erreur', 'Impossible de refuser la demande');
            }
          },
        },
      ]
    );
  };

  const handleProfilePress = async (match: PendingMatchWithUser) => {
    const user = match.id_user_initiator_details;
    if (!user) return;

    try {
      // Récupérer les détails complets du profil
      const profile = await profileService.getProfileDetails(user.id_user);
      
      if (!profile) {
        Alert.alert('Erreur', 'Impossible de charger les détails du profil');
        return;
      }

      console.log('👤 PendingMatchesScreen: Navigating to profile:', profile.firstname, profile.lastname);
      
      // Naviguer vers la page de détail du profil
      router.push({
        pathname: '/(protected)/profile-detail',
        params: {
          profile: JSON.stringify(profile)
        }
      });
    } catch (error) {
      console.error('❌ PendingMatchesScreen: Error loading profile details:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails du profil');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaWrapper backgroundColor="#F8F9FA" statusBarStyle="dark">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement des demandes...</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper backgroundColor="#F8F9FA" statusBarStyle="dark">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Demandes d'amis</Text>
            <Text style={styles.headerSubtitle}>
              {pendingMatches.length} demande{pendingMatches.length !== 1 ? 's' : ''} en attente
            </Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {pendingMatches.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#CCCCCC" />
              <Text style={styles.emptyTitle}>Aucune demande d'ami</Text>
              <Text style={styles.emptySubtitle}>
                Vous n'avez pas de demandes d'amis en attente pour le moment.
              </Text>
            </View>
          ) : (
            pendingMatches.map((match) => {
              const user = match.id_user_initiator_details;
              if (!user) return null;

              return (
                <View key={match.id} style={styles.matchCard}>
                  <TouchableOpacity 
                    style={styles.userInfoContainer}
                    onPress={() => handleProfilePress(match)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.userInfo}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {user.firstname?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                      </View>
                      
                      <View style={styles.userDetails}>
                        <Text style={styles.userName}>
                          {user.firstname} {user.lastname}
                        </Text>
                        {user.birthdate && (
                          <Text style={styles.userAge}>
                            {new Date().getFullYear() - new Date(user.birthdate).getFullYear()} ans
                          </Text>
                        )}
                        {user.biography && (
                          <Text style={styles.biography} numberOfLines={2}>
                            "{user.biography}"
                          </Text>
                        )}
                      </View>
                      
                      <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
                    </View>
                  </TouchableOpacity>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => handleAcceptMatch(match.id)}
                    >
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      <Text style={styles.acceptButtonText}>Accepter</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleRejectMatch(match.id)}
                    >
                      <Ionicons name="close" size={16} color="#FFFFFF" />
                      <Text style={styles.rejectButtonText}>Refuser</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userInfoContainer: {
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  userAge: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  biography: {
    fontSize: 14,
    color: '#555555',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 