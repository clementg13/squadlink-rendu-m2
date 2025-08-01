import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

interface OnboardingTermsProps {
  onAccept: () => void;
  onBack: () => void;
}

export default function OnboardingTerms({ onAccept, onBack }: OnboardingTermsProps) {
  // const router = useRouter(); // Variable non utilisée
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conditions d'utilisation</Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Utilise le contenu réel de la page terms */}
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
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
          <Text style={styles.acceptButtonText}>J'accepte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#2c3e50' },
  scroll: { flex: 1, marginBottom: 16 },
  content: { paddingBottom: 32 },
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
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  backButton: { padding: 14, borderRadius: 8, backgroundColor: '#eee', flex: 1, marginRight: 8, alignItems: 'center' },
  backButtonText: { color: '#007AFF', fontWeight: '600' },
  acceptButton: { padding: 14, borderRadius: 8, backgroundColor: '#007AFF', flex: 1, marginLeft: 8, alignItems: 'center' },
  acceptButtonText: { color: '#fff', fontWeight: '600' },
});
