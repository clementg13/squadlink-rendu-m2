import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProfileHeaderProps {
  firstname?: string;
  lastname?: string;
}

export default function ProfileHeader({ firstname, lastname }: ProfileHeaderProps) {
  const getInitials = () => {
    return firstname?.charAt(0)?.toUpperCase() || 
           lastname?.charAt(0)?.toUpperCase() || '?';
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>
              {getInitials()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
});
