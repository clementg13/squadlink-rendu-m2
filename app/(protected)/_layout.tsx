import { useAuth } from '@/stores/authStore';
import { Redirect, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function ProtectedLayout() {
  const { user, loading, isOnboarding } = useAuth();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShouldRender(true);
    }
  }, [loading]);

  if (loading || !shouldRender) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Si on est en onboarding, rediriger vers l'onboarding
  if (isOnboarding) {
    console.log('🔒 ProtectedLayout: Redirecting to onboarding');
    return <Redirect href="/(public)/onboarding" />;
  }

  // Si pas d'utilisateur, rediriger vers l'auth
  if (!user) {
    console.log('🔒 ProtectedLayout: No user, redirecting to auth');
    return <Redirect href="/(public)/auth" />;
  }

  console.log('🔒 ProtectedLayout: Utilisateur authentifié, rendu du contenu protégé');
  return <Stack screenOptions={{ headerShown: false }} />;
}