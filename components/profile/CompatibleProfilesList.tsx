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
import { useEnrichedCompatibleProfiles } from '@/hooks/useEnrichedCompatibleProfiles';
import { EnrichedCompatibleProfile } from '@/services/compatibleProfileService';
import { useAuthUser } from '@/stores/authStore';
import ProfileCard from './ProfileCard';
import ErrorMessage from '@/components/ui/ErrorMessage';

interface CompatibleProfilesListProps {
  onProfilePress?: (profile: EnrichedCompatibleProfile) => void;
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
  } = useEnrichedCompatibleProfiles(user?.id || null, 8); // Réduire la taille de page car plus de données

  // Gérer la sélection d'un profil
  const handleProfilePress = useCallback((profile: EnrichedCompatibleProfile) => {
    console.log('👤 EnrichedCompatibleProfilesList: Profil sélectionné:', profile.firstname, profile.lastname);
    if (onProfilePress) {
      onProfilePress(profile);
    } else {
      // Action par défaut : afficher une alerte avec plus de détails
      const sportsText = profile.sports?.map((s: any) => s.sport?.name).join(', ') || 'Aucun sport';
      const hobbiesText = profile.hobbies?.map((h: any) => h.hobbie?.name).join(', ') || 'Aucun hobby';
      const locationText = profile.location ? `📍 ${profile.location.town}` : 'Localisation non renseignée';
      const ageText = profile.age ? `${profile.age} ans` : 'Âge non renseigné';
      
      Alert.alert(
        `${profile.firstname} ${profile.lastname}`,
        `${ageText}\n${locationText}\n\n🏃‍♂️ Sports: ${sportsText}\n🎯 Hobbies: ${hobbiesText}\n\nScore de compatibilité: ${Math.round(profile.compatibility_score)}%\n\n${profile.biography || 'Pas de biographie disponible.'}`,
        [{ text: 'OK' }]
      );
    }
  }, [onProfilePress]);

  // Gérer le pull-to-refresh
  const handleRefresh = useCallback(() => {
    console.log('🔄 EnrichedCompatibleProfilesList: Pull-to-refresh déclenché');
    refresh();
  }, [refresh]);

  // Gérer le chargement de plus de profils (scroll infini)
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      console.log('📄 EnrichedCompatibleProfilesList: Chargement de plus de profils');
      loadMore();
    }
  }, [loading, hasMore, loadMore]);

  // Rendu d'un profil
  const renderProfile = useCallback(({ item }: { item: EnrichedCompatibleProfile }) => (
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
        <Text style={styles.footerText}>Chargement des profils enrichis...</Text>
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
          <Text style={styles.emptySubtext}>Enrichissement des données en cours</Text>
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
            <Text style={styles.welcomeTitle}>Bienvenue, {userName} ! 🎯</Text>
            <Text style={styles.welcomeSubtitle}>Découvrez vos profils compatibles avec tous leurs détails</Text>
          </View>
        )}
        
        {/* Compteur de profils (seulement si on a des profils) */}
        {!loading && profiles.length > 0 && (
          <View style={styles.countHeader}>
            <Text style={styles.countText}>
              {profiles.length} profil{profiles.length > 1 ? 's' : ''} enrichi{profiles.length > 1 ? 's' : ''}
              {totalCount > profiles.length && ` sur ${totalCount}`}
            </Text>
            <Text style={styles.countSubtext}>
              Avec sports, hobbies, localisation et plus encore
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
    backgroundColor: '#F8F9FA',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
  },
  welcomeHeader: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Fallback
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
    lineHeight: 22,
  },
  countHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  countText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '700',
    marginBottom: 4,
  },
  countSubtext: {
    fontSize: 13,
    color: '#666666',
    fontStyle: 'italic',
  },
  separator: {
    height: 0, // Pas de séparateur car les cartes ont déjà des marges
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
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
    paddingVertical: 24,
    backgroundColor: '#F8F9FA',
    marginTop: 8,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  footerText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
}); 