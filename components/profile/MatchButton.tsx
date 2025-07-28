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
import { MatchService, MatchResult } from '@/services/matchService';
import { CompatibleProfile } from '@/services/compatibleProfileService';

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
  }>({ exists: false, isAccepted: false, isInitiator: false });
  const [scaleValue] = useState(new Animated.Value(1));

  // Vérifier le statut du match
  useEffect(() => {
    const checkMatchStatus = async () => {
      if (profile.user_id) {
        const status = await MatchService.getMatchStatus(profile.user_id);
        setMatchStatus(status);
      }
    };

    checkMatchStatus();
  }, [profile.user_id]);

  const handleMatch = async () => {
    if (!profile.user_id || disabled || matchStatus.exists) {
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
        setMatchStatus({ exists: true, isAccepted: false, isInitiator: true });
        
        Alert.alert(
          'Demande d\'ami envoyée ! 👥',
          `Vous avez envoyé une demande d'ami à ${profile.firstname}. Ils recevront une notification et pourront accepter votre demande.`,
          [{ text: 'OK' }]
        );

        onMatchSuccess?.(result);
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
    const buttonStyle: any = [styles.button, styles[size]];
    
    if (variant === 'primary') {
      buttonStyle.push(styles.primary);
    } else if (variant === 'secondary') {
      buttonStyle.push(styles.secondary);
    } else if (variant === 'outline') {
      buttonStyle.push(styles.outline);
    }

    if (disabled || matchStatus.exists) {
      buttonStyle.push(styles.disabled);
    }

    return buttonStyle;
  };

  const getTextStyle = () => {
    const textStyle: any = [styles.text, styles[`${size}Text`]];
    
    if (variant === 'outline') {
      textStyle.push(styles.outlineText);
    } else if (variant === 'primary') {
      textStyle.push(styles.primaryText);
    }

    if (disabled || matchStatus.exists) {
      textStyle.push(styles.disabledText);
    }

    return textStyle;
  };

  // Texte du bouton selon l'état
  const getButtonText = () => {
    if (matchStatus.isAccepted) {
      return 'Amis ✓';
    }
    if (matchStatus.exists) {
      return 'Demande envoyée ✓';
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
    if (matchStatus.exists) {
      return '✓';
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
        disabled={disabled || matchStatus.exists || isLoading}
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
  
  // Tailles
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
  },
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
    opacity: 0.6,
  },
  
  // Textes par taille
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
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
  disabledText: {
    color: '#999999',
  },
}); 