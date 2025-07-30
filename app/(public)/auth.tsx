import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/stores/authStore';

export default function AuthScreen() {
  const router = useRouter();
  const { setIsOnboarding } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>🏋️‍♂️</Text>
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
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Votre mot de passe"
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          {/* Lien mot de passe oublié après les champs */}
          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
            onPress={() => router.push('/forgot-password')}
          >
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
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
            >
              <Text style={styles.signupLink}>S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Espacement supplémentaire pour éviter la barre de navigation */}
        <View style={styles.bottomSpacer} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    paddingBottom: 40, // Espacement supplémentaire en bas
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20, // Réduit l'espacement
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  signupLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16, // Réduit l'espacement
    marginBottom: 20, // Ajout d'espace en bas
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
  bottomSpacer: {
    height: 20, // Espacement supplémentaire
  },
});