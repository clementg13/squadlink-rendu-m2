// Test rapide pour vérifier que le PasswordInput fonctionne
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PasswordInput from './PasswordInput';

export default function PasswordInputTest() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test PasswordInput</Text>
      
      <Text style={styles.label}>Style Auth (login):</Text>
      <PasswordInput
        inputStyle={styles.authInput}
        placeholder="Tapez votre mot de passe"
        value="test123"
      />
      
      <Text style={styles.label}>Style Onboarding (register):</Text>
      <PasswordInput
        inputStyle={styles.onboardingInput}
        placeholder="Tapez votre mot de passe"
        value="test456"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 10,
  },
  authInput: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  onboardingInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2c3e50',
    marginBottom: 20,
  },
});
