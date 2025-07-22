import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { OnboardingCredentials } from '@/types/onboarding';
import { OnboardingService } from '@/services/onboardingService';
import { useAuth } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

interface OnboardingCredentialsProps {
  data?: OnboardingCredentials;
  onNext: (credentials: OnboardingCredentials, userId: string) => void;
}

export default function OnboardingCredentialsStep({ data, onNext }: OnboardingCredentialsProps) {
  const [credentials, setCredentials] = useState<OnboardingCredentials>({
    email: data?.email || '',
    password: data?.password || '',
    confirmPassword: data?.confirmPassword || '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const { signUp } = useAuth();

  const handleNext = async () => {
    const errors = OnboardingService.validateCredentials(credentials);
    
    if (errors.length > 0) {
      Alert.alert('Erreur de validation', errors.join('\n'));
      return;
    }

    try {
      setIsCreating(true);
      console.log('📝 OnboardingCredentials: Creating account for:', credentials.email);
      
      // Utiliser le store d'authentification pour l'inscription
      const { error } = await signUp(credentials.email, credentials.password);
      
      if (error) {
        console.error('❌ OnboardingCredentials: Signup failed:', error);
        let errorMessage = 'Impossible de créer le compte';
        
        if (error.message.includes('Email address') && error.message.includes('invalid')) {
          errorMessage = 'L\'adresse email n\'est pas valide';
        } else if (error.message.includes('already registered')) {
          errorMessage = 'Cette adresse email est déjà utilisée';
        } else if (error.message.includes('Password')) {
          errorMessage = 'Le mot de passe ne respecte pas les critères requis';
        }
        
        Alert.alert('Erreur', errorMessage);
        return;
      }

      console.log('✅ OnboardingCredentials: Account created, retrieving user ID...');
      
      // Tenter de récupérer l'userId plusieurs fois
      let userId = null;
      let attempts = 0;
      const maxAttempts = 5;

      while (!userId && attempts < maxAttempts) {
        attempts++;
        console.log(`🔍 OnboardingCredentials: Attempt ${attempts} to get user ID`);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          userId = session.user.id;
          console.log('✅ OnboardingCredentials: User ID found:', userId);
          break;
        }
        
        console.warn(`⚠️ OnboardingCredentials: No session found on attempt ${attempts}`);
      }
      
      if (userId) {
        console.log('✅ OnboardingCredentials: Proceeding to profile step with userId:', userId);
        onNext(credentials, userId);
      } else {
        console.error('❌ OnboardingCredentials: Could not retrieve user ID after signup');
        Alert.alert(
          'Erreur', 
          'Le compte a été créé mais nous ne pouvons pas continuer. Veuillez vous connecter manuellement.',
          [{ 
            text: 'OK', 
            onPress: () => {
              // Rediriger vers la page de connexion
              router.replace('/(auth)/login');
            }
          }]
        );
      }
      
    } catch (error) {
      console.error('❌ OnboardingCredentials: Unexpected error:', error);
      Alert.alert('Erreur', 'Une erreur inattendue est survenue');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Créons votre compte</Text>
        <Text style={styles.subtitle}>
          Commençons par créer votre compte SquadLink
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={credentials.email}
              onChangeText={(text) => setCredentials(prev => ({ ...prev, email: text }))}
              placeholder="votre@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isCreating}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              value={credentials.password}
              onChangeText={(text) => setCredentials(prev => ({ ...prev, password: text }))}
              placeholder="Minimum 6 caractères"
              secureTextEntry
              autoComplete="new-password"
              editable={!isCreating}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <TextInput
              style={styles.input}
              value={credentials.confirmPassword}
              onChangeText={(text) => setCredentials(prev => ({ ...prev, confirmPassword: text }))}
              placeholder="Confirmez votre mot de passe"
              secureTextEntry
              autoComplete="new-password"
              editable={!isCreating}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.nextButton, isCreating && styles.nextButtonDisabled]} 
        onPress={handleNext}
        disabled={isCreating}
      >
        {isCreating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.nextButtonText}>Créer mon compte</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 32,
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  nextButtonDisabled: {
    backgroundColor: '#999',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
