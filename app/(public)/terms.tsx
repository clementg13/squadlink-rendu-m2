import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Conditions d'utilisation</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptation des conditions</Text>
          <Text style={styles.text}>
            En utilisant SquadLink, vous acceptez ces conditions d'utilisation. 
            Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Utilisation du service</Text>
          <Text style={styles.text}>
            SquadLink est une plateforme de collaboration d'équipe. Vous vous engagez à 
            utiliser le service de manière responsable et conforme aux lois en vigueur.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Compte utilisateur</Text>
          <Text style={styles.text}>
            Vous êtes responsable de maintenir la confidentialité de votre compte 
            et de votre mot de passe. Vous acceptez la responsabilité de toutes les 
            activités qui se produisent sous votre compte.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Propriété intellectuelle</Text>
          <Text style={styles.text}>
            Le contenu, les fonctionnalités et les fonctionnalités de SquadLink 
            sont et resteront la propriété exclusive de SquadLink et de ses concédants.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Modifications</Text>
          <Text style={styles.text}>
            Nous nous réservons le droit de modifier ces conditions à tout moment. 
            Les modifications prendront effet immédiatement après leur publication.
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