import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { MatchService, MatchResult } from '@/services/matchService';
import { CompatibleProfile } from '@/services/compatibleProfileService';
import { useMatchRefreshStore } from '@/stores/matchRefreshStore';

interface MatchButtonProps {
  profile: CompatibleProfile;
  onMatchSuccess?: (result: MatchResult) => void;
  onMatchError?: (error: string) => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

export default function MatchButton({
  profile,
  onMatchSuccess,
  onMatchError,
  size = 'medium',
  variant = 'primary',
  disabled = false,
}: MatchButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [matchStatus, setMatchStatus] = useState<{
    exists: boolean;
    isAccepted: boolean;
    isInitiator: boolean;
    isRejected: boolean;
    isPending: boolean;
  }>({ 
    exists: false, 
    isAccepted: false, 
    isInitiator: false,
    isRejected: false,
    isPending: false
  });
  const [scaleValue] = useState(new Animated.Value(1));
  const triggerRefresh = useMatchRefreshStore((state) => state.triggerRefresh);
  const refreshTrigger = useMatchRefreshStore((state) => state.refreshTrigger);

  // Vérifier le statut du match
  useEffect(() => {
    const checkMatchStatus = async () => {
      if (profile.user_id) {
        const status = await MatchService.getMatchStatus(profile.user_id);
        setMatchStatus(status);
      }
    };

    checkMatchStatus();
  }, [profile.user_id, refreshTrigger]);

  const handleMatch = async () => {
    // Si on est le receiver et qu'il y a une demande en attente, naviguer vers pending-matches
    if (matchStatus.exists && matchStatus.isPending && !matchStatus.isInitiator) {
      router.push('/(protected)/pending-matches');
      return;
    }

    // Si on est l'initiateur et qu'il y a une demande en attente, ne rien faire
    if (matchStatus.exists && matchStatus.isPending && matchStatus.isInitiator) {
      return;
    }

    // Si le match est refusé, ne rien faire
    if (matchStatus.exists && matchStatus.isRejected) {
      return;
    }

    // Si on est amis, ne rien faire
    if (matchStatus.exists && matchStatus.isAccepted) {
      return;
    }

    if (!profile.user_id || disabled) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await MatchService.initiateMatch(profile.user_id);

      if (result.success) {
        // Animation de succès
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.2,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();

        // Mettre à jour le statut
        setMatchStatus({ 
          exists: true, 
          isAccepted: false, 
          isInitiator: true,
          isRejected: false,
          isPending: true
        });
        
        Alert.alert(
          'Demande d\'ami envoyée ! 👥',
          `Vous avez envoyé une demande d'ami à ${profile.firstname}. Ils recevront une notification et pourront accepter votre demande.`,
          [{ text: 'OK' }]
        );

        onMatchSuccess?.(result);
        triggerRefresh(); // Déclencher le rafraîchissement
      } else {
        Alert.alert('Erreur', result.message);
        onMatchError?.(result.message);
      }
    } catch (error) {
      console.error('❌ MatchButton: Error during match:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inattendue';
      Alert.alert('Erreur', errorMessage);
      onMatchError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Styles dynamiques basés sur la taille et la variante
  const getButtonStyle = () => {
    return [
      styles.button,
      styles[size],
      variant === 'primary' && styles.primary,
      variant === 'secondary' && styles.secondary,
      variant === 'outline' && styles.outline,
      (disabled || (matchStatus.exists && matchStatus.isRejected) || (matchStatus.exists && matchStatus.isAccepted)) && styles.disabled,
      (matchStatus.exists && matchStatus.isPending && !matchStatus.isInitiator) && styles.received,
      (matchStatus.exists && matchStatus.isPending && matchStatus.isInitiator) && styles.pending,
    ].filter(Boolean);
  };

  const getTextStyle = () => {
    return [
      styles.text,
      styles[`${size}Text`],
      variant === 'outline' && styles.outlineText,
      variant === 'primary' && styles.primaryText,
      (matchStatus.exists && matchStatus.isPending && !matchStatus.isInitiator) && styles.receivedText,
      (matchStatus.exists && matchStatus.isPending && matchStatus.isInitiator) && styles.pendingText,
      (matchStatus.exists && matchStatus.isRejected) && styles.rejectedText,
      (disabled || (matchStatus.exists && matchStatus.isAccepted)) && styles.disabledText,
    ].filter(Boolean);
  };

  // Texte du bouton selon l'état
  const getButtonText = () => {
    if (matchStatus.isAccepted) {
      return 'Amis ✓';
    }
    if (matchStatus.exists && matchStatus.isPending && !matchStatus.isInitiator) {
      return 'Demande reçue';
    }
    if (matchStatus.exists && matchStatus.isPending && matchStatus.isInitiator) {
      return 'Demande en attente';
    }
    if (matchStatus.exists && matchStatus.isRejected) {
      return 'Demande refusée';
    }
    if (isLoading) {
      return 'Envoi...';
    }
    return 'Demander en ami';
  };

  // Icône selon l'état
  const getButtonIcon = () => {
    if (matchStatus.isAccepted) {
      return '👥';
    }
    if (matchStatus.exists && matchStatus.isPending && !matchStatus.isInitiator) {
      return '📨';
    }
    if (matchStatus.exists && matchStatus.isPending && matchStatus.isInitiator) {
      return '⏳';
    }
    if (matchStatus.exists && matchStatus.isRejected) {
      return '❌';
    }
    if (isLoading) {
      return '';
    }
    return '💪';
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={handleMatch}
        disabled={disabled || (matchStatus.exists && matchStatus.isPending && matchStatus.isInitiator) || (matchStatus.exists && matchStatus.isRejected) || (matchStatus.exists && matchStatus.isAccepted) || isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator 
            size={size === 'small' ? 'small' : 'small'} 
            color={variant === 'outline' ? '#007AFF' : '#FFFFFF'} 
          />
        ) : (
          <View style={styles.content}>
            <Text style={styles.icon}>{getButtonIcon()}</Text>
            <Text style={getTextStyle()}>{getButtonText()}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  
  // Tailles - Utilisés dynamiquement via styles[size]
  // eslint-disable-next-line react-native/no-unused-styles
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  medium: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 52,
  },
  
  // Variantes
  primary: {
    backgroundColor: '#2196F3',
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  
  // États
  disabled: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E0E0E0',
    opacity: 0.8,
  },
  received: {
    backgroundColor: '#007AFF',
  },
  pending: {
    backgroundColor: '#007AFF',
  },
  // eslint-disable-next-line react-native/no-unused-styles
  rejected: {
    backgroundColor: '#8E8E93',
  },

  
  // Textes par taille - Utilisés dynamiquement via styles[`${size}Text`]
  // eslint-disable-next-line react-native/no-unused-styles
  smallText: {
    fontSize: 14,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  mediumText: {
    fontSize: 16,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  largeText: {
    fontSize: 18,
  },
  
  // Textes par variante
  outlineText: {
    color: '#007AFF',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  
  // Textes par état
  receivedText: {
    color: '#FFFFFF',
  },
  pendingText: {
    color: '#FFFFFF',
  },
  rejectedText: {
    color: '#616161',
  },
  disabledText: {
    color: '#666666',
    opacity: 0.9,
  },
}); 