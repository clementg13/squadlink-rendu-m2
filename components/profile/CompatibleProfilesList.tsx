import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useCompatibleProfiles } from '@/hooks/useCompatibleProfiles';
import { CompatibleProfile } from '@/services/compatibleProfileService';
import { ProfileSport, ProfileHobby } from '@/types/profile';
import { useAuthUser } from '@/stores/authStore';
import ProfileCard from './ProfileCard';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { useMatchRefreshStore } from '@/stores/matchRefreshStore';

interface CompatibleProfilesListProps {
  onProfilePress?: (profile: CompatibleProfile) => void;
  showWelcomeHeader?: boolean;
  userName?: string;
}

export default function CompatibleProfilesList({ 
  onProfilePress, 
  showWelcomeHeader = false, 
  userName: _userName = 'Utilisateur' 
}: CompatibleProfilesListProps) {
  const user = useAuthUser();
  const triggerRefresh = useMatchRefreshStore((state) => state.triggerRefresh);
  const {
    profiles,
    loading,
    error,
    hasMore,
    totalCount,
    loadMore,
    refresh,
    isEmpty
  } = useCompatibleProfiles(user?.id || null, 8); // Réduire la taille de page car plus de données

  // Gérer la sélection d'un profil
  const handleProfilePress = useCallback((profile: CompatibleProfile) => {
    console.log('👤 CompatibleProfilesList: Profil sélectionné:', profile.firstname, profile.lastname);
    if (onProfilePress) {
      onProfilePress(profile);
    } else {
      // Action par défaut : afficher une alerte avec plus de détails
      const sportsText = profile.sports?.map((s: ProfileSport) => s.sport?.name).join(', ') || 'Aucun sport';
      const hobbiesText = profile.hobbies?.map((h: ProfileHobby) => h.hobbie?.name).join(', ') || 'Aucun hobby';
      const locationText = profile.location ? `📍 ${profile.location.town}` : 'Localisation non renseignée';
      const ageText = profile.age !== undefined && profile.age !== null ? `${profile.age} ans` : 'Âge non renseigné';
      
      Alert.alert(
        `${profile.firstname} ${profile.lastname}`,
        `${ageText}\n${locationText}\n\n🏃‍♂️ Sports: ${sportsText}\n🎯 Hobbies: ${hobbiesText}\n\nScore de compatibilité: ${Math.round(profile.compatibility_score)}%\n\n${profile.biography || 'Pas de biographie disponible.'}`,
        [{ text: 'OK' }]
      );
    }
  }, [onProfilePress]);

  // Gérer le pull-to-refresh
  const handleRefresh = useCallback(async () => {
    console.log('🔄 CompatibleProfilesList: Pull-to-refresh déclenché');
    await refresh();
    // Déclencher le rafraîchissement global pour mettre à jour les autres composants (ex: PendingMatchesNotification)
    triggerRefresh();
  }, [refresh, triggerRefresh]);

  // Gérer le chargement de plus de profils (scroll infini)
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      console.log('📄 CompatibleProfilesList: Chargement de plus de profils');
      loadMore();
    }
  }, [loading, hasMore, loadMore]);

  // Rendu d'un profil
  const renderProfile = useCallback(({ item }: { item: CompatibleProfile }) => (
    <ProfileCard
      profile={item}
      onPress={handleProfilePress}
    />
  ), [handleProfilePress]);

  // Rendu du footer (indicateur de chargement)
  const renderFooter = useCallback(() => {
    if (!loading || profiles.length === 0) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.footerText}>Chargement des profils...</Text>
      </View>
    );
  }, [loading, profiles.length]);

  // Rendu quand la liste est vide
  const renderEmptyComponent = useCallback(() => {
    if (loading && profiles.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.emptyText}>Recherche de profils compatibles...</Text>
          <Text style={styles.emptySubtext}>Chargement des données en cours</Text>
        </View>
      );
    }

    if (isEmpty) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Aucun profil compatible</Text>
          <Text style={styles.emptyDescription}>
            Nous n'avons trouvé aucun profil compatible pour le moment.
            Tirez vers le bas pour actualiser ou revenez plus tard !
          </Text>
        </View>
      );
    }

    return null;
  }, [loading, profiles.length, isEmpty]);

  // Séparateur entre les éléments
  const ItemSeparator = useCallback(() => <View style={styles.separator} />, []);

  // Rendu du header moderne
  const renderHeader = useCallback(() => {
    return (
      <View style={styles.headerContainer}>
        {/* Header moderne simplifié */}
        {showWelcomeHeader && (
          <View style={styles.modernHeader}>
            <View style={styles.headerContent}>
              <Text style={styles.modernTitle}>Bienvenue ! 👋</Text>
              {!loading && profiles.length > 0 && (
                <Text style={styles.profileCount}>
                  {totalCount || profiles.length} Profil{(totalCount || profiles.length) > 1 ? 's' : ''} compatible{(totalCount || profiles.length) > 1 ? 's' : ''} avec vous
                </Text>
              )}
            </View>
          </View>
        )}
      </View>
    );
  }, [showWelcomeHeader, loading, profiles.length, totalCount]);

  return (
    <View style={styles.container}>
      {/* Message d'erreur */}
      {error && (
        <ErrorMessage 
          message={error}
          onRetry={refresh}
          type="error"
        />
      )}

      {/* Liste des profils */}
      <FlatList
        data={profiles}
        renderItem={renderProfile}
        keyExtractor={(item) => `enriched-profile-${item.profile_id}`}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        ItemSeparatorComponent={ItemSeparator}
        refreshControl={
          <RefreshControl
            refreshing={loading && profiles.length === 0}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
            title="Actualisation..."
            titleColor="#666666"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.15} // Un peu plus élevé car les cartes sont plus complexes
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={4} // Réduire car les cartes sont plus complexes
        updateCellsBatchingPeriod={150}
        windowSize={8}
        getItemLayout={(data, index) => ({
          length: 180, // Estimation pour le design moderne optimisé
          offset: 180 * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 32,
    paddingTop: 8,
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
  },
  modernHeader: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
  },
  headerContent: {
    alignItems: 'center',
  },
  modernTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  profileCount: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  separator: {
    height: 0, // Pas de séparateur car les cartes ont déjà des marges
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 80,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 20,
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '700',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  emptyDescription: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 26,
    marginTop: 16,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#F8F9FA',
    marginTop: 16,
    borderRadius: 16,
    marginHorizontal: 20,
  },
  footerText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
}); 