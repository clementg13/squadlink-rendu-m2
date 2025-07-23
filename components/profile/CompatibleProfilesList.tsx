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
import { CompatibleProfile } from '@/types/profile';
import { useAuthUser } from '@/stores/authStore';
import ProfileCard from './ProfileCard';
import ErrorMessage from '@/components/ui/ErrorMessage';

interface CompatibleProfilesListProps {
  onProfilePress?: (profile: CompatibleProfile) => void;
  showWelcomeHeader?: boolean;
  userName?: string;
}

export default function CompatibleProfilesList({ 
  onProfilePress, 
  showWelcomeHeader = false, 
  userName = 'Utilisateur' 
}: CompatibleProfilesListProps) {
  const user = useAuthUser();
  const {
    profiles,
    loading,
    error,
    hasMore,
    totalCount,
    loadMore,
    refresh,
    isEmpty
  } = useCompatibleProfiles(user?.id || null, 10);

  // Gérer la sélection d'un profil
  const handleProfilePress = useCallback((profile: CompatibleProfile) => {
    console.log('👤 CompatibleProfilesList: Profil sélectionné:', profile.firstname, profile.lastname);
    if (onProfilePress) {
      onProfilePress(profile);
    } else {
      // Action par défaut : afficher une alerte avec les détails
      Alert.alert(
        `${profile.firstname} ${profile.lastname}`,
        `Score de compatibilité: ${Math.round(profile.compatibility_score)}%\n\n${profile.biography || 'Pas de biographie disponible.'}`,
        [{ text: 'OK' }]
      );
    }
  }, [onProfilePress]);

  // Gérer le pull-to-refresh
  const handleRefresh = useCallback(() => {
    console.log('🔄 CompatibleProfilesList: Pull-to-refresh déclenché');
    refresh();
  }, [refresh]);

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
        <Text style={styles.footerText}>Chargement...</Text>
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

  // Rendu du header unifié
  const renderHeader = useCallback(() => {
    return (
      <View style={styles.headerContainer}>
        {/* Header de bienvenue (optionnel) */}
        {showWelcomeHeader && (
          <View style={styles.welcomeHeader}>
            <Text style={styles.welcomeTitle}>Bienvenue, {userName} !</Text>
            <Text style={styles.welcomeSubtitle}>Découvrez vos profils compatibles</Text>
          </View>
        )}
        
        {/* Compteur de profils (seulement si on a des profils) */}
        {!loading && profiles.length > 0 && (
          <View style={styles.countHeader}>
            <Text style={styles.countText}>
              {profiles.length} profil{profiles.length > 1 ? 's' : ''} trouvé{profiles.length > 1 ? 's' : ''}
              {totalCount > profiles.length && ` sur ${totalCount}`}
            </Text>
          </View>
        )}
      </View>
    );
  }, [showWelcomeHeader, userName, loading, profiles.length, totalCount]);

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
        keyExtractor={(item) => `profile-${item.profile_id}`}
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
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={100}
        windowSize={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContent: {
    flexGrow: 1,
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
  },
  welcomeHeader: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  countHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  countText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
    minHeight: 300,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666666',
  },
}); 