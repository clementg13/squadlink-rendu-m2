import { useEffect, useState } from 'react';
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
  
  const [renderCount, setRenderCount] = useState(0);
  const [redirected, setRedirected] = useState(false);

  // Configurer le callback de redirection
  useEffect(() => {
    console.log('📞 IndexScreen: Configuration du callback de redirection');
    setOnAuthChange((user) => {
      console.log('🔄 IndexScreen: Callback de redirection appelé avec user:', !!user);
      if (user) {
        console.log('✅ Callback: Redirection vers les routes protégées');
        router.replace('/(protected)/(tabs)');
      } else {
        console.log('🔄 Callback: Redirection vers l\'onboarding');
        router.replace('/(public)/onboarding');
      }
    });
  }, [router, setOnAuthChange]);

  // Forcer un re-render pour diagnostiquer
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  }, [user, loading, initialized]);

  console.log('🔄 IndexScreen render #', renderCount, '- État:', { 
    user: !!user, 
    loading, 
    initialized,
    redirected,
    userEmail: user?.email || 'null' 
  });

  useEffect(() => {
    console.log('🔄 IndexScreen useEffect déclenché #', renderCount, '- État:', { 
      user: !!user, 
      loading, 
      initialized,
      redirected,
      userEmail: user?.email || 'null' 
    });

    // Éviter les redirections multiples
    if (redirected) {
      console.log('🚫 Redirection déjà effectuée, arrêt');
      return;
    }

    // Attendre que l'authentification soit initialisée
    if (!initialized) {
      console.log('⏳ En attente de l\'initialisation...');
      return;
    }

    // Ne pas rediriger si on est en cours de chargement d'une action
    if (loading) {
      console.log('⏳ En cours de chargement...');
      return;
    }

    // Rediriger selon l'état d'authentification
    if (user) {
      // Utilisateur connecté -> routes protégées (tabs)
      console.log('✅ Utilisateur connecté, redirection vers les routes protégées');
      setRedirected(true);
      router.replace('/(protected)/(tabs)');
    } else {
      // Utilisateur non connecté -> onboarding
      console.log('🔄 Utilisateur non connecté, redirection vers l\'onboarding');
      setRedirected(true);
      router.replace('/(public)/onboarding');
    }
  }, [user, initialized, loading, router, renderCount, redirected]);

  // Afficher un écran de chargement pendant la redirection
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>
        {!initialized ? 'Initialisation...' : loading ? 'Chargement...' : 'Redirection...'}
      </Text>
      <Text style={styles.debugText}>
        Render #{renderCount} - User: {user ? 'Connecté' : 'Non connecté'} - Redirected: {redirected ? 'Oui' : 'Non'}
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
  debugText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
  },
}); 