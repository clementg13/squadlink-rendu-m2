import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { CompatibleProfile } from '@/services/compatibleProfileService';
import SportTag from './tags/SportTag';
import HobbyTag from './tags/HobbyTag';
import MatchButton from './MatchButton';

interface ProfileCardProps {
  profile: CompatibleProfile;
  onPress?: (profile: CompatibleProfile) => void;
}

export default function ProfileCard({ profile, onPress }: ProfileCardProps) {
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (onPress) {
      onPress(profile);
    }
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

  // Limiter le nombre de tags affichés
  const maxSportsToShow = 3;
  const maxHobbiesToShow = 4;
  const sportsToShow = profile.sports?.slice(0, maxSportsToShow) || [];
  const hobbiesToShow = profile.hobbies?.slice(0, maxHobbiesToShow) || [];
  const remainingSports = (profile.sports?.length || 0) - maxSportsToShow;
  const remainingHobbies = (profile.hobbies?.length || 0) - maxHobbiesToShow;

  return (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Header moderne avec nom et infos clés */}
        <View style={styles.header}>
          <View style={styles.topRow}>
            <View style={styles.nameSection}>
              <Text style={styles.name}>
                {profile.firstname} {profile.lastname}
              </Text>
              <View style={styles.metaRow}>
                {profile.age !== undefined && profile.age !== null && (
                  <View style={styles.metaChip}>
                    <Text style={styles.metaText}>{profile.age} ans</Text>
                  </View>
                )}
                {profile.location && (
                  <View style={styles.metaChip}>
                    <Text style={styles.metaText}>📍 {profile.location.town}</Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.compatibilitySection}>
              <View 
                style={[
                  styles.compatibilityContainer, 
                  { backgroundColor: getCompatibilityColor(profile.compatibility_score) }
                ]}
              >
                <Text style={styles.compatibilityIcon}>
                  {getCompatibilityIcon(profile.compatibility_score)}
                </Text>
                <Text style={styles.compatibilityValue}>
                  {Math.round(profile.compatibility_score)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Gym info si disponible */}
          {profile.gym && (
            <View style={styles.gymRow}>
              <Text style={styles.gymText}>🏋️ {profile.gym.name}</Text>
              {profile.gymSubscription && (
                <Text style={styles.gymSubscription}>• {profile.gymSubscription.name}</Text>
              )}
            </View>
          )}
        </View>

        {/* Section tags optimisée */}
        <View style={styles.contentSection}>
          {/* Sports en ligne */}
          {sportsToShow.length > 0 && (
            <View style={styles.tagsRow}>
              <View style={styles.tagCategory}>
                <Text style={styles.categoryIcon}>🏃‍♂️</Text>
                <Text style={styles.categoryLabel}>Sports</Text>
              </View>
              <View style={styles.tagsList}>
                {sportsToShow.map((sport, index) => (
                  <SportTag 
                    key={`${sport.id_sport}-${index}`} 
                    sport={sport} 
                    size="small"
                  />
                ))}
                {remainingSports > 0 && (
                  <View style={styles.moreTag}>
                    <Text style={styles.moreText}>+{remainingSports}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Hobbies en ligne */}
          {hobbiesToShow.length > 0 && (
            <View style={styles.tagsRow}>
              <View style={styles.tagCategory}>
                <Text style={styles.categoryIcon}>🎯</Text>
                <Text style={styles.categoryLabel}>Hobbies</Text>
              </View>
              <View style={styles.tagsList}>
                {hobbiesToShow.map((hobby, index) => (
                  <HobbyTag 
                    key={`${hobby.id_hobbie}-${index}`} 
                    hobby={hobby} 
                    size="small"
                  />
                ))}
                {remainingHobbies > 0 && (
                  <View style={styles.moreTag}>
                    <Text style={styles.moreText}>+{remainingHobbies}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Biographie si disponible */}
          {profile.biography && (
            <View style={styles.biographyRow}>
              <Text style={styles.biographyIcon}>💭</Text>
              <Text style={styles.biography} numberOfLines={1}>
                {profile.biography}
              </Text>
            </View>
          )}
        </View>

        {/* Bouton de match */}
        <View style={styles.matchSection}>
          <MatchButton 
            profile={profile}
            size="small"
            variant="primary"
            onMatchSuccess={(result) => {
              console.log('💕 ProfileCard: Match successful:', result);
            }}
            onMatchError={(error) => {
              console.error('❌ ProfileCard: Match error:', error);
            }}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  header: {
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameSection: {
    flex: 1,
    marginRight: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaChip: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  metaText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
  },
  compatibilitySection: {
    alignItems: 'flex-end',
  },
  compatibilityContainer: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 75,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  compatibilityIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  compatibilityValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  gymRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCE4EC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
  gymText: {
    fontSize: 14,
    color: '#C2185B',
    fontWeight: '600',
  },
  gymSubscription: {
    fontSize: 13,
    color: '#C2185B',
    fontWeight: '500',
    marginLeft: 8,
    opacity: 0.8,
  },
  contentSection: {
    gap: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: 6,
  },
  moreTag: {
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  biographyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  biographyIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  biography: {
    fontSize: 14,
    color: '#555555',
    fontStyle: 'italic',
    flex: 1,
    lineHeight: 20,
  },
  matchSection: {
    marginTop: 16,
    alignItems: 'center',
  },
}); 