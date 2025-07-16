import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Politique de confidentialité</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Collecte des informations</Text>
          <Text style={styles.text}>
            Nous collectons les informations que vous nous fournissez directement, 
            comme votre nom, votre adresse e-mail et d'autres informations de profil.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Utilisation des informations</Text>
          <Text style={styles.text}>
            Nous utilisons vos informations pour fournir, maintenir et améliorer 
            nos services, ainsi que pour communiquer avec vous.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Partage des informations</Text>
          <Text style={styles.text}>
            Nous ne vendons, n'échangeons et ne louons pas vos informations 
            personnelles à des tiers sans votre consentement.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Sécurité des données</Text>
          <Text style={styles.text}>
            Nous mettons en œuvre des mesures de sécurité appropriées pour protéger 
            vos informations personnelles contre l'accès non autorisé.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Vos droits</Text>
          <Text style={styles.text}>
            Vous avez le droit d'accéder, de corriger ou de supprimer vos 
            informations personnelles. Contactez-nous pour exercer ces droits.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Modifications</Text>
          <Text style={styles.text}>
            Nous pouvons mettre à jour cette politique de confidentialité de temps 
            en temps. Nous vous informerons de tout changement important.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 