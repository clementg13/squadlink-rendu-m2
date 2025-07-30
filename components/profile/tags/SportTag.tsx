import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProfileSport } from '@/types/profile';

interface SportTagProps {
  sport: ProfileSport;
  size?: 'small' | 'medium';
}

export default function SportTag({ sport, size = 'medium' }: SportTagProps) {
  const sportName = sport.sport?.name || 'Sport';
  const levelName = sport.sportlevel?.name || '';
  
  // Couleurs basées sur le niveau
  const getLevelColor = (level: string) => {
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes('débutant') || lowerLevel.includes('beginner')) {
      return {
        background: '#E8F5E8',
        text: '#2E7D32',
        border: '#C8E6C9',
      };
    }
    if (lowerLevel.includes('intermédiaire') || lowerLevel.includes('intermediate')) {
      return {
        background: '#FFF3E0',
        text: '#EF6C00',
        border: '#FFE0B2',
      };
    }
    if (lowerLevel.includes('avancé') || lowerLevel.includes('advanced') || lowerLevel.includes('expert')) {
      return {
        background: '#FFEBEE',
        text: '#C62828',
        border: '#FFCDD2',
      };
    }
    // Couleur par défaut
    return {
      background: '#E3F2FD',
      text: '#1976D2',
      border: '#BBDEFB',
    };
  };

  const colors = getLevelColor(levelName);

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
      <Text 
        style={[
          styles.sportName,
          size === 'small' ? styles.textSmall : styles.textMedium,
          { color: colors.text }
        ]}
        numberOfLines={1}
      >
        {sportName}
      </Text>
      {levelName && (
        <Text 
          style={[
            styles.levelName,
            size === 'small' ? styles.levelTextSmall : styles.levelTextMedium,
            { color: colors.text }
          ]}
          numberOfLines={1}
        >
          {levelName}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
    alignSelf: 'flex-start',
    minHeight: 24,
    justifyContent: 'center',
  },
  tagSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minHeight: 20,
  },
  tagMedium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minHeight: 24,
  },
  sportName: {
    fontWeight: '700',
    textAlign: 'center',
  },
  levelName: {
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.8,
  },
  textSmall: {
    fontSize: 10,
  },
  textMedium: {
    fontSize: 11,
  },
  levelTextSmall: {
    fontSize: 8,
    marginTop: 1,
  },
  levelTextMedium: {
    fontSize: 9,
    marginTop: 1,
  },
}); 