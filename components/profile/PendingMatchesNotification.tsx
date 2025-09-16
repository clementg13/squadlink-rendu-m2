import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MatchService } from '@/services/matchService';
import { router } from 'expo-router';
import { useMatchRefreshStore } from '@/stores/matchRefreshStore';
import { useAuthUser, useAuthLoading } from '@/stores/authStore';

export default function PendingMatchesNotification() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const refreshTrigger = useMatchRefreshStore((state) => state.refreshTrigger);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAnimatedRef = useRef(false);
  const user = useAuthUser();
  const authLoading = useAuthLoading();

  useEffect(() => {
    // Attendre que l'auth soit prête et qu'un utilisateur existe
    if (authLoading || !user?.id) {
      return;
    }

    // Debounce pour éviter les refreshs trop fréquents
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      loadPendingCount();
    }, 200); // Attendre 200ms avant de charger

    // Animation d'entrée uniquement lors du premier chargement
    if (!hasAnimatedRef.current) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      hasAnimatedRef.current = true;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [refreshTrigger, fadeAnim, user?.id, authLoading]);

  const loadPendingCount = async () => {
    try {
      setIsLoading(true);
      const matches = await MatchService.getPendingReceivedMatches();
      setPendingCount(matches.length);
    } catch (error) {
      console.error('❌ PendingMatchesNotification: Error loading count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePress = () => {
    router.push('/(protected)/pending-matches');
  };

  // Ne pas afficher si pas de demandes
  if (!isLoading && pendingCount === 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.notificationCard} onPress={handlePress}>
        <View style={styles.iconContainer}>
          <Ionicons name="people" size={24} color="#007AFF" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingCount}</Text>
          </View>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>
            {pendingCount === 1 ? 'Nouvelle demande d\'ami' : `${pendingCount} nouvelles demandes d'amis`}
          </Text>
          <Text style={styles.subtitle}>Appuyez pour voir les détails</Text>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 8,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
}); 