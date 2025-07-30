import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProfileHobby } from '@/types/profile';
import HobbyChip from './HobbyChip';

interface HobbyGroupProps {
  title: string;
  hobbies: ProfileHobby[];
  canHighlight: boolean;
  saving: boolean;
  onToggleHighlight: (hobbyId: string) => void;
  onRemove: (hobbyId: string) => void;
}

export default function HobbyGroup({
  title,
  hobbies,
  canHighlight,
  saving,
  onToggleHighlight,
  onRemove
}: HobbyGroupProps) {
  if (hobbies.length === 0) return null;

  return (
    <View style={styles.hobbyGroup}>
      <Text style={styles.hobbyGroupTitle}>{title}</Text>
      <View style={styles.hobbiesContainer}>
        {hobbies.map((userHobby) => (
          <HobbyChip
            key={`${userHobby.is_highlighted ? 'highlighted' : 'regular'}-${userHobby.id}-${userHobby.id_hobbie}`}
            userHobby={userHobby}
            isHighlighted={userHobby.is_highlighted}
            canHighlight={canHighlight}
            saving={saving}
            onToggleHighlight={onToggleHighlight}
            onRemove={onRemove}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hobbyGroup: {
    marginBottom: 15,
  },
  hobbyGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 8,
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
