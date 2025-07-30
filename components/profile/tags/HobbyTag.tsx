import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProfileHobby } from '@/types/profile';

interface HobbyTagProps {
  hobby: ProfileHobby;
  size?: 'small' | 'medium';
}

export default function HobbyTag({ hobby, size = 'medium' }: HobbyTagProps) {
  const hobbyName = hobby.hobbie?.name || 'Hobby';
  const isHighlighted = hobby.is_highlighted;

  const colors = isHighlighted 
    ? {
        background: '#7B1FA2',
        text: '#FFFFFF',
        border: '#7B1FA2',
      }
    : {
        background: '#F3E5F5',
        text: '#7B1FA2',
        border: '#E1BEE7',
      };

  const tagStyle = [
    styles.tag,
    size === 'small' ? styles.tagSmall : styles.tagMedium,
    {
      backgroundColor: colors.background,
      borderColor: colors.border,
    },
  ];

  return (
    <View style={tagStyle}>
      {isHighlighted && (
        <Text style={styles.highlightIcon}>⭐</Text>
      )}
      <Text 
        style={[
          styles.hobbyName,
          size === 'small' ? styles.textSmall : styles.textMedium,
          { color: colors.text }
        ]}
        numberOfLines={1}
      >
        {hobbyName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagMedium: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  highlightIcon: {
    fontSize: 10,
    marginRight: 3,
  },
  hobbyName: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textSmall: {
    fontSize: 10,
  },
  textMedium: {
    fontSize: 11,
  },
}); 