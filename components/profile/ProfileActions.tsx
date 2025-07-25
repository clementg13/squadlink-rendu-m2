import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useAuth } from '@/stores/authStore';

interface ProfileActionsProps {
  hasChanges: boolean;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProfileActions({
  hasChanges,
  saving,
  onSave,
  onCancel,
}: ProfileActionsProps) {
  const { signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch {
              Alert.alert('Erreur', 'Une erreur s\'est produite lors de la déconnexion');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Boutons d'action du profil */}
      <View style={styles.actionButtons}>
        {hasChanges && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          testID="save-button"
          style={[styles.button, styles.saveButton, saving && styles.buttonDisabled]}
          onPress={onSave}
          disabled={saving}
          accessibilityState={{ disabled: saving }}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {hasChanges ? 'Enregistrer' : 'Modifier profil'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Bouton de déconnexion - même taille que les autres boutons */}
      <TouchableOpacity
        style={[styles.button, styles.signOutButton]}
        onPress={handleSignOut}
      >
        <Text style={styles.signOutButtonText}>🚪 Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16, // Espacement entre les boutons d'action et le bouton de déconnexion
  },
  button: {
    flex: 1,
    paddingVertical: 16, // Taille uniforme pour tous les boutons
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52, // Hauteur minimale uniforme
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#dc3545', // Rouge pour indiquer une action destructive
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});