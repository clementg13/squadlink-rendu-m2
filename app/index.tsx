import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore, useAuthUser, useAuthLoading } from '@/stores/authStore';
import { Text } from '@/components/Themed';

export default function IndexScreen() {
  const router = useRouter();
  
  // Utiliser des selectors spécifiques pour forcer les re-renders
  const user = useAuthUser();
  const loading = useAuthLoading();
  const initialized = useAuthStore((state) => state.initialized);
  const setOnAuthChange = useAuthStore((state) => state.setOnAuthChange);

  // Configurer le callback de redirection
  useEffect(() => {
    setOnAuthChange((user) => {
      if (user) {
        router.replace('/(protected)/(tabs)');
      } else {
        router.replace('/(public)/onboarding');
      }
    });
  }, [router, setOnAuthChange]);

  useEffect(() => {
    // Attendre que l'authentification soit initialisée
    if (!initialized) {
      return;
    }

    // Ne pas rediriger si on est en cours de chargement d'une action
    if (loading) {
      return;
    }

    // Rediriger selon l'état d'authentification
    if (user) {
      router.replace('/(protected)/(tabs)');
    } else {
      router.replace('/(public)/onboarding');
    }
  }, [user, initialized, loading, router]);

  // Afficher un écran de chargement pendant la redirection
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>
        {!initialized ? 'Initialisation...' : loading ? 'Chargement...' : 'Redirection...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
}); 