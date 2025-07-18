import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ProfileHobby } from '@/types/profile';

interface HobbyChipProps {
  userHobby: ProfileHobby;
  isHighlighted: boolean;
  canHighlight: boolean;
  saving: boolean;
  onToggleHighlight: (hobbyId: string) => void;
  onRemove: (hobbyId: string) => void;
}

export default function HobbyChip({
  userHobby,
  isHighlighted,
  canHighlight,
  saving,
  onToggleHighlight,
  onRemove
}: HobbyChipProps) {
  return (
    <View style={[styles.hobbyChip, isHighlighted && styles.hobbyHighlighted]}>
      <Text style={isHighlighted ? styles.hobbyChipTextHighlighted : styles.hobbyChipText}>
        {userHobby.hobbie?.name}
      </Text>
      
      {!isHighlighted && canHighlight && (
        <TouchableOpacity
          style={styles.hobbyAction}
          onPress={() => onToggleHighlight(userHobby.id_hobbie)}
          disabled={saving}
        >
          <Text style={styles.hobbyActionText}>☆</Text>
        </TouchableOpacity>
      )}
      
      {isHighlighted && (
        <TouchableOpacity
          style={styles.hobbyAction}
          onPress={() => onToggleHighlight(userHobby.id_hobbie)}
          disabled={saving}
        >
          <Text style={styles.hobbyActionTextHighlighted}>⭐</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity
        style={styles.hobbyAction}
        onPress={() => onRemove(userHobby.id_hobbie)}
        disabled={saving}
      >
        <Text style={isHighlighted ? styles.hobbyActionTextHighlighted : styles.hobbyActionText}>
          ✕
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  hobbyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 4,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  hobbyHighlighted: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  hobbyChipText: {
    fontSize: 14,
    color: '#2c3e50',
    marginRight: 4,
  },
  hobbyChipTextHighlighted: {
    fontSize: 14,
    color: '#fff',
    marginRight: 4,
  },
  hobbyAction: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  hobbyActionText: {
    fontSize: 16,
    color: '#6c757d',
  },
  hobbyActionTextHighlighted: {
    fontSize: 16,
    color: '#fff',
  },
});
