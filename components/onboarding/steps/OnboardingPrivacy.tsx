import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

interface OnboardingPrivacyProps {
  onAccept: () => void;
  onBack: () => void;
}

export default function OnboardingPrivacy({ onAccept, onBack }: OnboardingPrivacyProps) {
  // const router = useRouter(); // Variable non utilisée
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Politique de confidentialité</Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Utilise le contenu réel de la page privacy */}
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
