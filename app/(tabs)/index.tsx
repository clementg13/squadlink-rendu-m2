import { StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { env, isDevelopment } from '@/constants/Environment';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SquadLink</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      
      {/* Exemple d'utilisation des variables d'environnement */}
      <View style={styles.envInfo}>
        <Text style={styles.envTitle}>Variables d'environnement :</Text>
        <Text style={styles.envText}>API URL: {env.API_URL}</Text>
        <Text style={styles.envText}>Debug: {env.DEBUG ? 'Activé' : 'Désactivé'}</Text>
        <Text style={styles.envText}>Log Level: {env.LOG_LEVEL}</Text>
        <Text style={styles.envText}>Environnement: {env.NODE_ENV}</Text>
        <Text style={styles.envText}>Mode développement: {isDevelopment ? 'Oui' : 'Non'}</Text>
      </View>
      
      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  envInfo: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    width: '90%',
  },
  envTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  envText: {
    fontSize: 14,
    marginBottom: 5,
  },
});
