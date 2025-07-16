import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuthUser } from '@/stores/authStore';

export default function ProfileScreen() {
  const user = useAuthUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      
      <View style={styles.profileInfo}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user?.email}</Text>
        
        <Text style={styles.label}>Statut:</Text>
        <Text style={styles.value}>
          {user?.email_confirmed_at ? 'Compte confirmé' : 'En attente de confirmation'}
        </Text>
        
        <Text style={styles.label}>Membre depuis:</Text>
        <Text style={styles.value}>
          {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  profileInfo: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
}); 