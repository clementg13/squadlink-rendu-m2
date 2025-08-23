import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/stores/authStore';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import PasswordInput from '@/components/ui/PasswordInput';

export default function AuthScreen() {
  const router = useRouter();
  const { setIsOnboarding } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Référence pour le champ mot de passe
  const passwordInputRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Désactiver le mode onboarding pour les utilisateurs existants qui se connectent
      console.log('✅ Auth: Connexion réussie, désactivation du mode onboarding');
      setIsOnboarding(false);
      
      // Laisser le système de layout gérer la redirection automatique
      console.log('✅ Auth: Redirection automatique en cours...');
      
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Une erreur est survenue.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaWrapper backgroundColor="#fff" statusBarStyle="dark">
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo} importantForAccessibility="no">🏋️‍♂️</Text>
          <Text style={styles.title}>SquadLink</Text>
          <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
        </View>

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
              returnKeyType="next"
              onSubmitEditing={() => {
                // Focus sur le champ mot de passe quand on appuie sur "next"
                passwordInputRef.current?.focus();
              }}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <PasswordInput
              ref={passwordInputRef}
              inputStyle={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Votre mot de passe"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              editable={!isLoading}
            />
          </View>



          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            accessibilityLabel="Se connecter"
            accessibilityHint="Appuyez pour vous connecter à votre compte"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          {/* Lien d'inscription déplacé */}
          <View style={styles.signupLinkContainer}>
            <Text style={styles.signupLinkText}>Pas encore de compte ? </Text>
            <TouchableOpacity 
              onPress={() => router.replace('/(public)/onboarding')}
              disabled={isLoading}
              accessibilityLabel="S'inscrire"
              accessibilityHint="Appuyez pour créer un nouveau compte"
            >
              <Text style={styles.signupLink}>S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#007AFF80',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },

  signupLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  signupLinkText: {
    fontSize: 14,
    color: '#666',
  },
  signupLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});