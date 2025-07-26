import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export default function ErrorMessage({ 
  message, 
  onRetry, 
  type = 'error' 
}: ErrorMessageProps) {
  const getErrorColor = () => {
    switch (type) {
      case 'warning':
        return '#FF9800';
      case 'info':
        return '#2196F3';
      default:
        return '#F44336';
    }
  };

  const getErrorIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  return (
    <View style={[styles.container, { borderLeftColor: getErrorColor() }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{getErrorIcon()}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={[styles.retryText, { color: getErrorColor() }]}>
            Réessayer
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF8F0',
    borderLeftWidth: 4,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 18,
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
