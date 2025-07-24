import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { ProfileSocialMedia } from '@/types/profile';

interface SocialMediaChipProps {
  userSocialMedia: ProfileSocialMedia;
  saving: boolean;
  onUpdate: (socialMediaId: string, username: string) => Promise<void>;
  onRemove: (socialMediaId: string) => void;
}

export default function SocialMediaChip({
  userSocialMedia,
  saving,
  onUpdate,
  onRemove
}: SocialMediaChipProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState(userSocialMedia.username);

  const handleSave = async () => {
    if (!editedUsername.trim()) {
      Alert.alert('Erreur', 'Le nom d\'utilisateur ne peut pas être vide');
      return;
    }

    if (editedUsername.trim() === userSocialMedia.username) {
      setIsEditing(false);
      return;
    }

    try {
      await onUpdate(userSocialMedia.id_social_media, editedUsername.trim());
      setIsEditing(false);
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour le nom d\'utilisateur');
      setEditedUsername(userSocialMedia.username);
    }
  };

  const handleCancel = () => {
    setEditedUsername(userSocialMedia.username);
    setIsEditing(false);
  };

  return (
    <View style={styles.socialMediaChip}>
      <View style={styles.socialMediaInfo}>
        <Text style={styles.socialMediaName}>{userSocialMedia.socialmedia?.name}</Text>
        {isEditing ? (
          <TextInput
            style={styles.usernameInput}
            value={editedUsername}
            onChangeText={setEditedUsername}
            placeholder="Nom d'utilisateur"
            autoFocus
            editable={!saving}
          />
        ) : (
          <Text style={styles.username}>@{userSocialMedia.username}</Text>
        )}
      </View>
      
      <View style={styles.actions}>
        {isEditing ? (
          <>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>✓</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>✕</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
              disabled={saving}
            >
              <Text style={styles.editButtonText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemove(userSocialMedia.id_social_media)}
              disabled={saving}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  socialMediaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 8,
  },
  socialMediaInfo: {
    flex: 1,
    marginRight: 8,
  },
  socialMediaName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  username: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  usernameInput: {
    fontSize: 12,
    color: '#2c3e50',
    marginTop: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
    paddingVertical: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 14,
  },
  saveButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#28a745',
  },
  cancelButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#dc3545',
  },
  removeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeButtonText: {
    fontSize: 16,
    color: '#dc3545',
  },
});
