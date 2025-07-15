import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuth, useAuthUser, useAuthLoading } from '@/stores/authStore';
import { env } from '@/constants/Environment';

export default function HomeScreen() {
  const user = useAuthUser();
  const loading = useAuthLoading();
  const { signIn, signUp, signOut } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour gérer la connexion
  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      Alert.alert('Erreur de connexion', error.message);
    } else {
      Alert.alert('Succès', 'Connexion réussie !');
      setEmail('');
      setPassword('');
    }
  };

  // Fonction pour gérer l'inscription
  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password);
    setIsLoading(false);

    if (error) {
      Alert.alert('Erreur d\'inscription', error.message);
    } else {
      Alert.alert(
        'Inscription réussie',
        'Vérifiez votre email pour confirmer votre compte'
      );
      setEmail('');
      setPassword('');
      setIsSignUp(false);
    }
  };

  // Fonction pour gérer la déconnexion
  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      Alert.alert('Succès', 'Déconnexion réussie !');
    }
  };

  // Affichage pendant le chargement initial
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  // Interface pour utilisateur connecté
  if (user) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Bienvenue dans SquadLink</Text>
          <Text style={styles.subtitle}>Vous êtes connecté !</Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userInfoTitle}>Informations utilisateur :</Text>
          <Text style={styles.userInfoText}>Email: {user.email}</Text>
          <Text style={styles.userInfoText}>ID: {user.id}</Text>
          <Text style={styles.userInfoText}>
            Confirmé: {user.email_confirmed_at ? 'Oui' : 'Non'}
          </Text>
        </View>

        <View style={styles.storeInfo}>
          <Text style={styles.envTitle}>État du store Zustand :</Text>
          <Text style={styles.envText}>✅ Utilisateur connecté</Text>
          <Text style={styles.envText}>✅ Session active</Text>
          <Text style={styles.envText}>✅ Store initialisé</Text>
        </View>

        <View style={styles.envInfo}>
          <Text style={styles.envTitle}>Configuration Supabase :</Text>
          <Text style={styles.envText}>URL: {env.EXPO_PUBLIC_SUPABASE_URL}</Text>
          <Text style={styles.envText}>Environnement: {env.NODE_ENV}</Text>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Interface d'authentification
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>SquadLink</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Créer un compte' : 'Se connecter'}
          </Text>
          <Text style={styles.zustandBadge}>Powered by Zustand 🐻</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={isSignUp ? handleSignUp : handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isSignUp ? 'S\'inscrire' : 'Se connecter'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={styles.switchButtonText}>
              {isSignUp
                ? 'Déjà un compte ? Se connecter'
                : 'Pas de compte ? S\'inscrire'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.envInfo}>
          <Text style={styles.envTitle}>Configuration :</Text>
          <Text style={styles.envText}>Environnement: {env.NODE_ENV}</Text>
          <Text style={styles.envText}>Debug: {env.DEBUG ? 'Activé' : 'Désactivé'}</Text>
          <Text style={styles.envText}>🐻 Gestion d'état: Zustand</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 4,
  },
  zustandBadge: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  form: {
    width: '100%',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    alignItems: 'center',
    padding: 10,
  },
  switchButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  userInfo: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  userInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  userInfoText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  storeInfo: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  envInfo: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  envTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  envText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
