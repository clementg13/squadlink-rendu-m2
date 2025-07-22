import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/stores/authStore';

interface ProfileActionsProps {
  hasChanges: boolean;
  saving: boolean;
  onSave: () => Promise<void>;
  onCancel: () => void;
  onSignOut: () => void;
}

export default function ProfileActions({ 
  hasChanges, 
  saving, 
  onSave, 
  onCancel, 
  onSignOut 
}: ProfileActionsProps) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // La redirection est gérée dans le store
    } catch (error) {
      console.error('❌ ProfileActions: Sign out error:', error);
      // Optionnel: afficher une erreur à l'utilisateur
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[
            styles.saveButton, 
            (!hasChanges || saving) && styles.saveButtonDisabled
          ]}
          onPress={onSave}
          disabled={!hasChanges || saving}
          testID="save-button"
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {hasChanges ? 'Enregistrer' : 'Modifier profil'}
            </Text>
          )}
        </TouchableOpacity>

        {hasChanges && (
          <TouchableOpacity 
            style={[styles.cancelButton, saving && styles.cancelButtonDisabled]}
            onPress={onCancel}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.signOutButton, saving && styles.signOutButtonDisabled]}
        onPress={onSignOut || handleSignOut}
        disabled={saving}
      >
        <Text style={styles.signOutButtonText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#007AFF',
  },
  saveButtonDisabled: {
    backgroundColor: '#007AFF80',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    backgroundColor: '#6c757d',
  },
  cancelButtonDisabled: {
    backgroundColor: '#6c757d80',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutButtonDisabled: {
    backgroundColor: '#dc354580',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
