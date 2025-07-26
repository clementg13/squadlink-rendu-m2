import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/stores/authStore';

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
  const { user, session, loading, initialize, isOnboarding, initialized } = useAuth();
  const [isReady, setIsReady] = useState(false);

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

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!loading && !isReady) {
      setIsReady(true);
    }
  }, [loading, isReady]);

  useEffect(() => {
    // Navigation uniquement quand tout est prêt
    if (isReady && !loading) {
      console.log('🎯 RootLayout: Navigation check');
      console.log('🎯 RootLayout: User:', user ? 'authenticated' : 'not authenticated');
      console.log('🎯 RootLayout: Is onboarding:', isOnboarding);
      console.log('🎯 RootLayout: Loading:', loading, 'Initialized:', initialized);
      
      // Si on est en onboarding, ne pas rediriger
      if (isOnboarding) {
        console.log('🎯 RootLayout: Onboarding mode - no redirect');
        return;
      }
      
      // Navigation normale
      if (user && session) {
        console.log('🎯 RootLayout: Redirecting to protected area');
        router.replace('/(protected)/(tabs)');
      } else {
        console.log('🎯 RootLayout: Redirecting to onboarding');
        router.replace('/(public)/onboarding');
      }
    }
  }, [user, session, loading, isOnboarding, isReady]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Route principale qui gère la redirection */}
        <Stack.Screen name="index" />
        
        {/* Routes publiques */}
        <Stack.Screen name="(public)" />
        
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
  );
}