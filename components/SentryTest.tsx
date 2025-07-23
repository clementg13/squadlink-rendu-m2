import React from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import * as Sentry from '@sentry/react-native';

const SentryTestComponent = () => {
  const throwJSError = () => {
    console.log('🚨 Déclenchement d\'une erreur JavaScript pour test Sentry');
    throw new Error('Test JavaScript Error for Sentry - ' + new Date().toISOString());
  };

  const triggerNativeError = () => {
    console.log('🚨 Déclenchement d\'un crash natif pour test Sentry');
    Alert.alert(
      'Crash natif',
      'Ceci va provoquer un crash de l\'application',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Crash!', onPress: () => Sentry.nativeCrash() }
      ]
    );
  };

  const sendTestMessage = () => {
    console.log('📤 Envoi d\'un message de test à Sentry');
    Sentry.captureMessage('Message de test depuis SquadLink - ' + new Date().toISOString(), 'info');
    Alert.alert('Message envoyé', 'Un message de test a été envoyé à Sentry');
  };

  const sendTestException = () => {
    console.log('📤 Envoi d\'une exception de test à Sentry');
    Sentry.captureException(new Error('Exception de test depuis SquadLink - ' + new Date().toISOString()));
    Alert.alert('Exception envoyée', 'Une exception de test a été envoyée à Sentry');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Tests Sentry</Text>
      <View style={styles.buttonContainer}>
        <Button title="📤 Message de test" onPress={sendTestMessage} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="⚠️ Exception de test" onPress={sendTestException} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="💥 Erreur JS" onPress={throwJSError} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="🔥 Crash natif" onPress={triggerNativeError} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    marginVertical: 4,
  },
});

export default SentryTestComponent;