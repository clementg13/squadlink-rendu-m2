import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface ProfileTagProps {
  text: string;
  variant?: 'sport' | 'hobby' | 'location' | 'social' | 'gym' | 'age';
  highlighted?: boolean;
  size?: 'small' | 'medium';
}

const tagColors = {
  sport: {
    background: '#E3F2FD',
    text: '#1976D2',
    border: '#BBDEFB',
  },
  hobby: {
    background: '#F3E5F5',
    text: '#7B1FA2',
    border: '#E1BEE7',
  },
  location: {
    background: '#E8F5E8',
    text: '#388E3C',
    border: '#C8E6C9',
  },
  social: {
    background: '#FFF3E0',
    text: '#F57C00',
    border: '#FFCC02',
  },
  gym: {
    background: '#FCE4EC',
    text: '#C2185B',
    border: '#F8BBD9',
  },
  age: {
    background: '#F5F5F5',
    text: '#616161',
    border: '#E0E0E0',
  },
};

export default function ProfileTag({ 
  text, 
  variant = 'hobby', 
  highlighted = false, 
  size = 'medium' 
}: ProfileTagProps) {
  const colors = tagColors[variant];
  
  const tagStyle = [
    styles.tag,
    size === 'small' ? styles.tagSmall : styles.tagMedium,
    {
      backgroundColor: highlighted ? colors.text : colors.background,
      borderColor: colors.border,
    },
  ];

  const textStyle = [
    styles.tagText,
    size === 'small' ? styles.tagTextSmall : styles.tagTextMedium,
    {
      color: highlighted ? '#FFFFFF' : colors.text,
    },
  ];

  return (
    <View style={tagStyle}>
      <Text style={textStyle} numberOfLines={1}>
        {text}
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
  tagText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  tagTextSmall: {
    fontSize: 10,
  },
  tagTextMedium: {
    fontSize: 11,
  },
}); 