import React from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';

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
  return (
    <View>
      {/* Boutons d'action */}
      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={[styles.button, styles.buttonPrimary]} 
          onPress={onSave}
          disabled={saving || !hasChanges}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonTextPrimary}>Modifier profil</Text>
          )}
        </TouchableOpacity>

        {hasChanges && (
          <TouchableOpacity 
            style={[styles.button, styles.buttonSecondary]} 
            onPress={onCancel}
            disabled={saving}
          >
            <Text style={styles.buttonTextSecondary}>Annuler</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bouton de déconnexion */}
      <View style={styles.signOutSection}>
        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={onSignOut}
          disabled={saving}
        >
          <Text style={styles.signOutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    backgroundColor: '#6c757d',
  },
  buttonTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutSection: {
    padding: 20,
    marginTop: 10,
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
