import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserProfile } from '@/types/profile';

interface ProfileInfoProps {
  profile?: UserProfile | null;
}

export default function ProfileInfo({ profile }: ProfileInfoProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Informations du compte</Text>
      
      {profile?.biography && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Biographie</Text>
          <Text style={styles.infoValue} numberOfLines={3}>
            {profile.biography}
          </Text>
        </View>
      )}
      
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Score</Text>
        <Text style={styles.infoValue}>{profile?.score || 0} points</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Profil complété</Text>
        <Text style={styles.infoValue}>
          {profile?.fully_completed ? 'Oui' : 'Non'}
        </Text>
      </View>

      {profile?.sports && profile.sports.length > 0 && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Sports pratiqués</Text>
          <Text style={styles.infoValue}>
            {profile.sports.length} sport(s)
          </Text>
        </View>
      )}

      {profile?.socialMedias && profile.socialMedias.length > 0 && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Réseaux sociaux</Text>
          <Text style={styles.infoValue}>
            {profile.socialMedias.length} réseau(x)
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  infoValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
});
