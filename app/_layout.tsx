import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useSegments, useRouter } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { user, loading, initialized } = useAuth();
  const [navigationReady, setNavigationReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Gérer la redirection basée sur l'authentification
  useEffect(() => {
    if (!navigationReady || !initialized || loading) return;

    const currentPath = `/${segments.join('/')}`;
    console.log('🔄 RootLayout: Current path:', currentPath);
    console.log('🔄 RootLayout: User authenticated:', !!user);

    // Ne pas rediriger si on est déjà dans l'onboarding
    if (currentPath.includes('onboarding')) {
      console.log('📋 RootLayout: In onboarding, not redirecting');
      return;
    }

    const inAuthGroup = segments[0] === '(public)';
    const inProtectedGroup = segments[0] === '(protected)';

    if (user) {
      if (inAuthGroup) {
        console.log('🔄 RootLayout: User authenticated, redirecting to protected area');
        router.replace('/(protected)/(tabs)');
      }
    } else {
      if (inProtectedGroup) {
        console.log('🔄 RootLayout: User not authenticated, redirecting to login');
        router.replace('/(auth)/login');
      }
    }
  }, [user, segments, navigationReady, initialized, loading]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Route principale qui gère la redirection */}
          <Stack.Screen name="index" />
          
          {/* Routes publiques */}
          <Stack.Screen name="(public)" />
          
          {/* Routes d'authentification */}
          <Stack.Screen name="(auth)" />
          
          {/* Routes protégées */}
          <Stack.Screen name="(protected)" />
          
          {/* Modals globaux */}
          <Stack.Screen 
            name="modal" 
            options={{ 
              presentation: 'modal',
              headerShown: true,
              title: 'Modal'
            }} 
          />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
