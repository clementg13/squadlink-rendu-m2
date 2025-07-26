import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { UserProfile, SocialMedia } from '@/types/profile';
import SocialMediaChip from './SocialMediaChip';
import SocialMediaPickerModal from './SocialMediaPickerModal';

interface ProfileSocialMediasProps {
  profile?: UserProfile | null;
  socialMedias: SocialMedia[];
  saving: boolean;
  onAddSocialMedia: (socialMediaId: string, username: string) => Promise<void>;
  onUpdateSocialMedia: (socialMediaId: string, username: string) => Promise<void>;
  onRemoveSocialMedia: (socialMediaId: string) => Promise<void>;
}

export default function ProfileSocialMedias({ 
  profile, 
  socialMedias,
  saving, 
  onAddSocialMedia,
  onUpdateSocialMedia,
  onRemoveSocialMedia 
}: ProfileSocialMediasProps) {
  const [showSocialMediaPicker, setShowSocialMediaPicker] = useState(false);

  const getUserSocialMedias = () => {
    return profile?.socialMedias || [];
  };

  const getAvailableSocialMedias = () => {
    const userSocialMediaIds = getUserSocialMedias().map(s => s.id_social_media);
    return socialMedias.filter(s => !userSocialMediaIds.includes(s.id));
  };

  const handleAddSocialMedia = async (socialMediaId: string, username: string) => {
    await onAddSocialMedia(socialMediaId, username);
    setShowSocialMediaPicker(false);
  };

  const handleUpdateSocialMedia = async (socialMediaId: string, username: string) => {
    await onUpdateSocialMedia(socialMediaId, username);
  };

  const handleRemoveSocialMedia = (socialMediaId: string) => {
    Alert.alert(
      'Supprimer le réseau social',
      'Êtes-vous sûr de vouloir supprimer ce réseau social ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => onRemoveSocialMedia(socialMediaId)
        },
      ]
    );
  };

  const userSocialMedias = getUserSocialMedias();

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Réseaux sociaux</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowSocialMediaPicker(true)}
          disabled={saving}
        >
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.socialMediasContainer}>
        {userSocialMedias.length > 0 ? (
          userSocialMedias.map((userSocialMedia) => (
            <SocialMediaChip
              key={userSocialMedia.id_social_media}
              userSocialMedia={userSocialMedia}
              saving={saving}
              onUpdate={handleUpdateSocialMedia}
              onRemove={handleRemoveSocialMedia}
            />
          ))
        ) : (
          <Text style={styles.noSocialMediasText}>
            Aucun réseau social ajouté. Ajoutez vos profils pour vous connecter avec d'autres utilisateurs !
          </Text>
        )}
      </View>

      <SocialMediaPickerModal
        visible={showSocialMediaPicker}
        socialMedias={getAvailableSocialMedias()}
        onSelect={handleAddSocialMedia}
        onClose={() => setShowSocialMediaPicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  socialMediasContainer: {
    minHeight: 50,
  },
  noSocialMediasText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 20,
  },
});