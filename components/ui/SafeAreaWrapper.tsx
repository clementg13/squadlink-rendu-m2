import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string;
  statusBarStyle?: 'light' | 'dark' | 'auto';
  statusBarBackgroundColor?: string;
}

export default function SafeAreaWrapper({
  children,
  backgroundColor = '#fff',
  statusBarStyle = 'dark',
  statusBarBackgroundColor,
}: SafeAreaWrapperProps) {
  return (
    <>
      <StatusBar 
        style={statusBarStyle} 
        backgroundColor={statusBarBackgroundColor || backgroundColor}
        translucent={Platform.OS === 'android'}
      />
      <SafeAreaView 
        style={[
          styles.container,
          { backgroundColor }
        ]}
        edges={['top', 'left', 'right', 'bottom']}
      >
        <View style={styles.content}>
          {children}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
}); 