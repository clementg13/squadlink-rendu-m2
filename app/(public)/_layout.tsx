import { Stack, Redirect } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/stores/authStore';
import { useSegments } from 'expo-router';

export default function PublicLayout() {
  const colorScheme = useColorScheme();
  const { user, isOnboarding } = useAuth();
  const segments = useSegments();

  // Pages autorisées même quand connecté (avec le préfixe (public))
  const allowedWhenAuthenticated = ['(public)/privacy', '(public)/terms'];
  
  // Si l'utilisateur est connecté et n'est pas en onboarding
  if (user && !isOnboarding) {
    // Construire le chemin complet pour la comparaison
    const currentPath = segments.join('/');
    if (!allowedWhenAuthenticated.includes(currentPath)) {
      console.log('🔒 PublicLayout: Utilisateur connecté, redirection vers l\'app depuis:', currentPath);
      return <Redirect href="/(protected)/(tabs)" />;
    }
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Style par défaut pour les écrans publics
        contentStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
        },
      }}
    >
      <Stack.Screen name="auth" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="privacy" />
    </Stack>
  );
} 