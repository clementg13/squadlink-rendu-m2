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
