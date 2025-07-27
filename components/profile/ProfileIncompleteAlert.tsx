import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { router } from 'expo-router';

interface ProfileIncompleteAlertProps {
  completionPercentage: number;
  missingFields: string[];
  compact?: boolean; // Version compacte pour la page d'accueil
  clickable?: boolean; // Si l'alerte doit être cliquable (défaut: true)
}

export default function ProfileIncompleteAlert({ 
  completionPercentage, 
  missingFields, 
  compact = false,
  clickable = true 
}: ProfileIncompleteAlertProps) {
  const scaleValue = new Animated.Value(1);

  const handlePress = () => {
    if (!clickable) return;

    // Animation de pression
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigation vers la page profil
    router.push('/(protected)/(tabs)/profile');
  };

  const getAlertColor = () => {
    if (completionPercentage >= 80) return '#FF9500'; // Orange pour presque complet
    if (completionPercentage >= 50) return '#FF6B6B'; // Rouge-orange pour moyennement complet
    return '#FF3B30'; // Rouge pour très incomplet
  };

  const getEmoji = () => {
    if (completionPercentage >= 80) return '⚠️';
    if (completionPercentage >= 50) return '🚨';
    return '❗';
  };

  if (compact) {
    // Version compacte pour la page d'accueil
    return (
      <Animated.View style={[styles.compactContainer, { transform: [{ scale: scaleValue }] }]}>
        <TouchableOpacity 
          style={[styles.compactAlert, { borderLeftColor: getAlertColor() }]}
          onPress={handlePress}
          activeOpacity={clickable ? 0.8 : 1}
          disabled={!clickable}
        >
          <View style={styles.compactContent}>
            <Text style={styles.compactEmoji}>{getEmoji()}</Text>
            <View style={styles.compactTextContainer}>
              <Text style={styles.compactTitle}>Profil incomplet ({completionPercentage}%)</Text>
              <Text style={styles.compactSubtitle}>
                Complétez votre profil pour apparaître dans l'app
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>→</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Version complète pour la page profil
  return (
    <Animated.View style={[styles.fullContainer, { transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity 
        style={[styles.fullAlert, { backgroundColor: `${getAlertColor()}15`, borderColor: getAlertColor() }]}
        onPress={handlePress}
        activeOpacity={clickable ? 0.8 : 1}
        disabled={!clickable}
      >
        <View style={styles.fullHeader}>
          <Text style={styles.fullEmoji}>{getEmoji()}</Text>
          <Text style={[styles.fullTitle, { color: getAlertColor() }]}>
            Profil incomplet
          </Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${completionPercentage}%`,
                  backgroundColor: getAlertColor()
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{completionPercentage}% complété</Text>
        </View>

        <Text style={styles.fullDescription}>
          Votre profil n'apparaît pas dans l'application car il manque des informations essentielles.
        </Text>

        <View style={styles.missingFieldsContainer}>
          <Text style={styles.missingFieldsTitle}>Informations manquantes :</Text>
          {missingFields.map((field, index) => (
            <View key={index} style={styles.missingFieldItem}>
              <Text style={styles.missingFieldBullet}>•</Text>
              <Text style={styles.missingFieldText}>{field}</Text>
            </View>
          ))}
        </View>

        {clickable && (
          <View style={styles.actionContainer}>
            <Text style={[styles.actionText, { color: getAlertColor() }]}>
              Appuyez pour compléter votre profil
            </Text>
          </View>
        )}

      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Styles pour la version compacte (page d'accueil)
  compactContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  compactAlert: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderLeftWidth: 4,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  compactTextContainer: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  compactSubtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
  },
  arrowContainer: {
    marginLeft: 8,
  },
  arrow: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },

  // Styles pour la version complète (page profil)
  fullContainer: {
    marginHorizontal: 20,
    marginVertical: 16,
  },
  fullAlert: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  fullHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fullEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  fullTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'right',
  },
  fullDescription: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
    marginBottom: 16,
  },
  missingFieldsContainer: {
    marginBottom: 16,
  },
  missingFieldsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  missingFieldItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  missingFieldBullet: {
    fontSize: 16,
    color: '#666666',
    marginRight: 8,
    width: 16,
  },
  missingFieldText: {
    fontSize: 15,
    color: '#555555',
    flex: 1,
  },
  actionContainer: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
}); 