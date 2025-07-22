import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { OnboardingHobbies } from '@/types/onboarding';
import { OnboardingService } from '@/services/onboardingService';

interface Hobby {
  id: string;
  name: string;
}

interface OnboardingHobbiesProps {
  data?: OnboardingHobbies;
  userId: string;
  onNext: (hobbies: OnboardingHobbies) => void;
  onBack: () => void;
}

export default function OnboardingHobbiesStep({ data, userId, onNext, onBack }: OnboardingHobbiesProps) {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(data?.hobbyIds || []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHobbies();
  }, []);

  const loadHobbies = async () => {
    try {
      const { data, error } = await supabase
        .from('hobbie')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setHobbies(data || []);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les hobbies');
    } finally {
      setLoading(false);
    }
  };

  const handleHobbyToggle = (hobbyId: string) => {
    setSelectedHobbies(prev => 
      prev.includes(hobbyId) 
        ? prev.filter(id => id !== hobbyId)
        : [...prev, hobbyId]
    );
  };

  const handleNext = async () => {
    if (selectedHobbies.length === 0) {
      Alert.alert('Sélection requise', 'Veuillez sélectionner au moins un hobby');
      return;
    }

    try {
      setSaving(true);
      const hobbiesData = { hobbyIds: selectedHobbies };
      const result = await OnboardingService.updateUserHobbies(userId, hobbiesData);
      
      if (result.success) {
        onNext(hobbiesData);
      } else {
        Alert.alert('Erreur', result.error || 'Impossible de sauvegarder les hobbies');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur inattendue est survenue');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
        <Text style={styles.title}>Vos hobbies</Text>
        <Text style={styles.subtitle}>
          Sélectionnez vos hobbies pour enrichir votre profil
        </Text>

        <FlatList
          data={hobbies}
          keyExtractor={item => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.hobbyChip,
                selectedHobbies.includes(item.id) && styles.hobbyChipSelected
              ]}
              onPress={() => handleHobbyToggle(item.id)}
            >
              <Text style={[
                styles.hobbyChipText,
                selectedHobbies.includes(item.id) && styles.hobbyChipTextSelected
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          style={styles.hobbiesList}
        />
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.nextButton, saving && styles.nextButtonDisabled]} 
          onPress={handleNext}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>Terminer le profil</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 24,
    lineHeight: 22,
  },
  hobbiesList: {
    flex: 1,
  },
  hobbyChip: {
    flex: 1,
    margin: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  hobbyChipSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  hobbyChipText: {
    fontSize: 14,
    color: '#2c3e50',
    textAlign: 'center',
  },
  hobbyChipTextSelected: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  buttons: {
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
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#999',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
