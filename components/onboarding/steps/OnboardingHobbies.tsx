import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';

interface OnboardingHobbiesProps {
  userId: string;
  onNext: (hobbiesData: string[]) => void;
  onBack: () => void;
}

interface Hobby {
  id: string;
  name: string;
  emoji?: string;
}

export default function OnboardingHobbies({ userId, onNext, onBack }: OnboardingHobbiesProps) {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHobbies();
  }, []);

  const loadHobbies = async () => {
    try {
      const { data, error } = await supabase
        .from('hobbie')
        .select('*')
        .order('name');

      if (error) throw error;
      setHobbies(data || []);
    } catch (error) {
      console.error('Error loading hobbies:', error);
      Alert.alert('Erreur', 'Impossible de charger les hobbies disponibles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHobbyToggle = (hobbyId: string) => {
    if (selectedHobbies.includes(hobbyId)) {
      setSelectedHobbies(prev => prev.filter(id => id !== hobbyId));
    } else if (selectedHobbies.length < 10) {
      setSelectedHobbies(prev => [...prev, hobbyId]);
    } else {
      Alert.alert('Limite atteinte', 'Vous pouvez sélectionner maximum 10 hobbies');
    }
  };

  const handleNext = () => {
    console.log('🎯 OnboardingHobbies: Hobbies selected:', selectedHobbies);
    onNext(selectedHobbies);
  };

  const renderHobbyItem = ({ item }: { item: Hobby }) => {
    const isSelected = selectedHobbies.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.hobbyButton,
          isSelected && styles.hobbyButtonSelected
        ]}
        onPress={() => handleHobbyToggle(item.id)}
      >
        <Text style={[
          styles.hobbyButtonText,
          isSelected && styles.hobbyButtonTextSelected
        ]}>
          {item.emoji && `${item.emoji} `}{item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement des hobbies...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Vos centres d'intérêt</Text>
        <Text style={styles.subtitle}>
          Sélectionnez vos hobbies pour trouver des personnes avec des intérêts similaires (optionnel)
        </Text>
        <Text style={styles.counter}>
          {selectedHobbies.length}/10 hobbies sélectionnés
        </Text>

        <FlatList
          data={hobbies}
          keyExtractor={(item) => item.id}
          renderItem={renderHobbyItem}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          style={styles.hobbiesList}
          columnWrapperStyle={styles.row}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {selectedHobbies.length > 0 ? 'Continuer' : 'Passer cette étape'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  counter: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  hobbiesList: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  hobbyButton: {
    flex: 0.48,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  hobbyButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  hobbyButtonText: {
    fontSize: 14,
    color: '#2c3e50',
    textAlign: 'center',
    fontWeight: '500',
  },
  hobbyButtonTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  footer: {
    paddingTop: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});