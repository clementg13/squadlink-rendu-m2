import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ProfileSport } from '@/types/profile';

interface SportChipProps {
  userSport: ProfileSport;
  saving: boolean;
  onRemove: (sportId: string) => void;
}

export default function SportChip({
  userSport,
  saving,
  onRemove
}: SportChipProps) {
  return (
    <View style={styles.sportChip}>
      <View style={styles.sportInfo}>
        <Text style={styles.sportName}>{userSport.sport?.name}</Text>
        <Text style={styles.sportLevel}>{userSport.sportlevel?.name}</Text>
      </View>
      
      <TouchableOpacity
        style={styles.removeButton}
        testID="remove-sport"
        disabled={saving}
        onPress={() => onRemove(userSport.id_sport)}
      >
        <Text>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 8,
  },
  sportInfo: {
    flex: 1,
    marginRight: 8,
  },
  sportName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  sportLevel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  removeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
