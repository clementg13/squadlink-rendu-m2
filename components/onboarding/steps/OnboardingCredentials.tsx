import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

interface OnboardingCredentialsProps {
  onNext: (userId: string) => void;
}

export default function OnboardingCredentials({ onNext }: OnboardingCredentialsProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Références pour la navigation clavier
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const validateForm = () => {
    const errors = [];

    if (!email.trim()) {
      errors.push('L\'email est requis');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push('L\'email n\'est pas valide');
    }

    if (!password) {
      errors.push('Le mot de passe est requis');
    } else if (password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }

    if (!confirmPassword) {
      errors.push('La confirmation du mot de passe est requise');
    } else if (password !== confirmPassword) {
      errors.push('Les mots de passe ne correspondent pas');
    }

    return errors;
  };

  const handleCreateAccount = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      Alert.alert('Erreur de validation', errors.join('\n'));
      return;
    }

    setIsLoading(true);

    try {
      console.log('📝 OnboardingCredentials: Creating account for:', email);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error('❌ OnboardingCredentials: Signup failed:', error);
        let errorMessage = 'Impossible de créer le compte';
        
        if (error.message.includes('User already registered')) {
          errorMessage = 'Cette adresse email est déjà utilisée';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'L\'adresse email n\'est pas valide';
        } else if (error.message.includes('Password')) {
          errorMessage = 'Le mot de passe ne respecte pas les critères requis';
        }
        
        Alert.alert('Erreur', errorMessage);
        return;
      }

      if (!data.user?.id) {
        console.error('❌ OnboardingCredentials: No user ID received');
        Alert.alert('Erreur', 'Impossible de créer le compte. Veuillez réessayer.');
        return;
      }

      // Attendre un peu pour que la session soit bien établie
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Vérifier que l'utilisateur est bien authentifié
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('❌ OnboardingCredentials: User not authenticated after signup');
        Alert.alert('Erreur', 'Problème d\'authentification. Veuillez réessayer.');
        return;
      }

      console.log('✅ OnboardingCredentials: Account created and authenticated, user ID:', user.id);
      onNext(user.id);

    } catch (error) {
      console.error('❌ OnboardingCredentials: Unexpected error:', error);
      Alert.alert('Erreur', 'Une erreur inattendue est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Créez votre compte</Text>
        <Text style={styles.subtitle}>
          Rejoignez la communauté SquadLink pour trouver vos partenaires sportifs
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="votre@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              editable={!isLoading}
              testID="onboarding-email-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              ref={passwordInputRef}
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Minimum 6 caractères"
              secureTextEntry
              autoComplete="new-password"
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
              editable={!isLoading}
              testID="onboarding-password-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <TextInput
              ref={confirmPasswordInputRef}
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirmez votre mot de passe"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleCreateAccount}
              editable={!isLoading}
              testID="onboarding-confirm-password-input"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.signupButton, isLoading && styles.signupButtonDisabled]} 
          onPress={handleCreateAccount}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.signupButtonText}>Créer mon compte</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginLinkText}>Vous avez déjà un compte ? </Text>
          <TouchableOpacity 
            onPress={() => router.replace('/(public)/auth')}
            disabled={isLoading}
          >
            <Text style={styles.loginLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 32,
    lineHeight: 22,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
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
  signupButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  signupButtonDisabled: {
    backgroundColor: '#999',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});