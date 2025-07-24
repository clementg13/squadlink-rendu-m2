import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuth, useAuthUser, useAuthLoading } from '@/stores/authStore';
import { env } from '@/constants/Environment';

export default function HomeScreen() {
  const user = useAuthUser();
  const loading = useAuthLoading();
  const { signOut } = useAuth();

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
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bienvenue dans SquadLink</Text>
        <Text style={styles.subtitle}>Tableau de bord principal</Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userInfoTitle}>Informations utilisateur :</Text>
        <Text style={styles.userInfoText}>Email: {user?.email}</Text>
        <Text style={styles.userInfoText}>ID: {user?.id}</Text>
        <Text style={styles.userInfoText}>
          Confirmé: {user?.email_confirmed_at ? 'Oui' : 'Non'}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    paddingTop: 20,
    paddingHorizontal: 20,
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
  userInfo: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 20,
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
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  envInfo: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    marginHorizontal: 20,
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
    marginHorizontal: 20,
    marginBottom: 40,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 