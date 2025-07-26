import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { CompatibleProfile } from '@/types/profile';

interface ProfileCardProps {
  profile: CompatibleProfile;
  onPress?: (profile: CompatibleProfile) => void;
}

const CARD_MARGIN = 16;

export default function ProfileCard({ profile, onPress }: ProfileCardProps) {
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
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
    if (score >= 80) return '#4CAF50'; // Vert
    if (score >= 60) return '#FF9800'; // Orange
    if (score >= 40) return '#FFC107'; // Jaune
    return '#9E9E9E'; // Gris
  };

  // Fonction pour obtenir le texte du niveau de compatibilité
  const getCompatibilityText = (score: number) => {
    if (score >= 80) return 'Excellente';
    if (score >= 60) return 'Bonne';
    if (score >= 40) return 'Moyenne';
    return 'Faible';
  };

  // Fonction pour obtenir l'icône du niveau de compatibilité
  const getCompatibilityIcon = (score: number) => {
    if (score >= 80) return '🔥';
    if (score >= 60) return '⭐';
    if (score >= 40) return '👍';
    return '👌';
  };

  return (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Header avec nom et score utilisateur */}
        <View style={styles.header}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>
              {profile.firstname} {profile.lastname}
            </Text>
            <Text style={styles.userId}>#{profile.profile_id}</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>{profile.score}</Text>
          </View>
        </View>

        {/* Biographie */}
        {profile.biography && (
          <View style={styles.biographyContainer}>
            <Text style={styles.biography} numberOfLines={2}>
              {profile.biography}
            </Text>
          </View>
        )}

        {/* Footer avec compatibilité améliorée */}
        <View style={styles.footer}>
          <View style={styles.compatibilityContainer}>
            <Text style={styles.compatibilityLabel}>Compatibilité</Text>
            <View style={styles.compatibilityScore}>
              <View 
                style={[
                  styles.compatibilityBadge, 
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
              <Text style={[
                styles.compatibilityText,
                { color: getCompatibilityColor(profile.compatibility_score) }
              ]}>
                {getCompatibilityText(profile.compatibility_score)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: CARD_MARGIN,
    marginVertical: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  userId: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 70,
  },
  scoreLabel: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  biographyContainer: {
    marginBottom: 16,
  },
  biography: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666666',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compatibilityContainer: {
    flex: 1,
  },
  compatibilityLabel: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  compatibilityScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compatibilityBadge: {
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
    justifyContent: 'center',
  },
  compatibilityIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  compatibilityValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  compatibilityText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 