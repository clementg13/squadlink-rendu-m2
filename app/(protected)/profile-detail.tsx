import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { CompatibleProfile } from '@/services/compatibleProfileService';


// Composants pour l'affichage

// Tags pour l'affichage
import SportTag from '@/components/profile/tags/SportTag';
import HobbyTag from '@/components/profile/tags/HobbyTag';
import ProfileTag from '@/components/profile/tags/ProfileTag';

export default function ProfileDetailScreen() {
  const params = useLocalSearchParams();
  const profileData = params.profile ? JSON.parse(params.profile as string) as CompatibleProfile : null;
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simple initialisation sans boucle
    if (profileData) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [profileData]);

  const handleBack = () => {
    router.back();
  };

  // Fonction pour obtenir la couleur du score de compatibilité
  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    if (score >= 40) return '#FFC107';
    return '#9E9E9E';
  };

  // Fonction pour obtenir l'icône du niveau de compatibilité
  const getCompatibilityIcon = (score: number) => {
    if (score >= 80) return '🔥';
    if (score >= 60) return '⭐';
    if (score >= 40) return '👍';
    return '👌';
  };

  if (loading || !profileData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement des informations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec bouton retour */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profileData.firstname} {profileData.lastname}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header du profil avec avatar et nom */}
        <View style={styles.profileHeaderSection}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {profileData.firstname?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
            </View>
            <Text style={styles.profileName}>
              {profileData.firstname} {profileData.lastname}
            </Text>
          </View>
          
          {/* Informations de base */}
          <View style={styles.basicInfo}>
            <View style={styles.infoRow}>
              {profileData.age && (
                <ProfileTag 
                  text={`${profileData.age} ans`} 
                  variant="age" 
                  size="medium"
                />
              )}
              {profileData.location && (
                <ProfileTag 
                  text={`📍 ${profileData.location.town}`} 
                  variant="location" 
                  size="medium"
                />
              )}
            </View>
            
            {/* Score de compatibilité */}
            <View style={styles.compatibilitySection}>
              <Text style={styles.compatibilityLabel}>Compatibilité</Text>
              <View 
                style={[
                  styles.compatibilityBadge, 
                  { backgroundColor: getCompatibilityColor(profileData.compatibility_score) }
                ]}
              >
                <Text style={styles.compatibilityIcon}>
                  {getCompatibilityIcon(profileData.compatibility_score)}
                </Text>
                <Text style={styles.compatibilityValue}>
                  {Math.round(profileData.compatibility_score)}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Biographie */}
        {profileData.biography && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À propos de {profileData.firstname}</Text>
            <View style={styles.biographyContainer}>
              <Text style={styles.biography}>
                "{profileData.biography}"
              </Text>
            </View>
          </View>
        )}

        {/* Localisation */}
        {profileData.location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Localisation</Text>
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>
                📍 {profileData.location.town}
              </Text>
              {profileData.location.postal_code && (
                <Text style={styles.postalCode}>
                  {profileData.location.postal_code}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Salle de sport */}
        {profileData.gym && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Salle de sport</Text>
            <View style={styles.gymContainer}>
              <Text style={styles.gymName}>🏋️ {profileData.gym.name}</Text>
              {profileData.gymSubscription && (
                <Text style={styles.gymSubscription}>
                  Abonnement: {profileData.gymSubscription.name}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Sports */}
        {profileData.sports && profileData.sports.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sports pratiqués par {profileData.firstname}</Text>
            <View style={styles.tagsContainer}>
              {profileData.sports.map((sport: any, index: number) => (
                <SportTag 
                  key={`${sport.id_sport}-${index}`} 
                  sport={sport} 
                  size="medium"
                />
              ))}
            </View>
          </View>
        )}

        {/* Hobbies */}
        {profileData.hobbies && profileData.hobbies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Centres d'intérêt de {profileData.firstname}</Text>
            <View style={styles.tagsContainer}>
              {profileData.hobbies.map((hobby: any, index: number) => (
                <HobbyTag 
                  key={`${hobby.id_hobbie}-${index}`} 
                  hobby={hobby} 
                  size="medium"
                />
              ))}
            </View>
          </View>
        )}

        {/* Réseaux sociaux */}
        {profileData.socialMedias && profileData.socialMedias.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Réseaux sociaux</Text>
            <View style={styles.socialContainer}>
              {profileData.socialMedias.map((social: any, index: number) => (
                <View key={`${social.id_social_media}-${index}`} style={styles.socialItem}>
                  <Text style={styles.socialPlatform}>
                    {social.socialmedia?.name}:
                  </Text>
                  <Text style={styles.socialUsername}>
                    @{social.username}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Espace en bas */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  placeholder: {
    width: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  profileHeaderSection: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
    marginBottom: 12,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarPlaceholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  basicInfo: {
    paddingHorizontal: 20,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compatibilitySection: {
    alignItems: 'center',
  },
  compatibilityLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  compatibilityBadge: {
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  compatibilityIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  compatibilityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  biographyContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  biography: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555555',
    fontStyle: 'italic',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  postalCode: {
    fontSize: 14,
    color: '#666666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gymContainer: {
    backgroundColor: '#FCE4EC',
    borderRadius: 12,
    padding: 16,
  },
  gymName: {
    fontSize: 16,
    color: '#C2185B',
    fontWeight: '700',
    marginBottom: 4,
  },
  gymSubscription: {
    fontSize: 14,
    color: '#C2185B',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  socialContainer: {
    gap: 12,
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
  },
  socialPlatform: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
    marginRight: 8,
  },
  socialUsername: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '700',
  },
  bottomSpace: {
    height: 40,
  },
}); 