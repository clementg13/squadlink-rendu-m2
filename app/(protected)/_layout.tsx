import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useColorScheme } from '@/components/useColorScheme';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';

export default function ProtectedLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { user, loading, initialized } = useAuthStore();

  useEffect(() => {
    // Attendre que l'authentification soit initialisée
    if (!initialized || loading) {
      return;
    }

    console.log('🔒 Protection des routes - État:', { user: !!user, loading, initialized });

    // Rediriger vers l'authentification si pas connecté
    if (!user) {
      console.log('❌ Utilisateur non connecté, redirection vers login');
      router.replace('/(auth)/login');
    } else {
      console.log('✅ Utilisateur connecté, accès autorisé');
    }
  }, [user, loading, initialized, router]);

  // Afficher un écran de chargement pendant la vérification
  if (!initialized || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>
          {!initialized ? 'Initialisation...' : 'Vérification...'}
        </Text>
      </View>
    );
  }

  // Afficher un écran de chargement si pas d'utilisateur (pendant la redirection)
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Redirection...</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Style par défaut pour les écrans protégés
        contentStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
        },
      }}
    >
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
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