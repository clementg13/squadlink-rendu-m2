import { Stack } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';

export default function AuthLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Style par défaut pour les écrans d'authentification
        contentStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#f5f5f5',
        },
        // Animation pour les écrans d'auth
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
} 