import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { OnboardingSport, OnboardingGym, OnboardingHobbies } from '@/types/onboarding';

interface Gym {
  id: string;
  name: string;
}

interface GymSubscription {
  id: string;
  name: string;
}

interface Hobby {
  id: string;
  name: string;
}

interface OnboardingGymOrHobbiesProps {
  sports: OnboardingSport[];
  gymData?: OnboardingGym;
  hobbiesData?: OnboardingHobbies;
  onNext: (data: { gym?: OnboardingGym; hobbies?: OnboardingHobbies }) => void;
  onBack: () => void;
}

export default function OnboardingGymOrHobbies({ 
  sports, 
  gymData, 
  hobbiesData, 
  onNext, 
  onBack 
}: OnboardingGymOrHobbiesProps) {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [subscriptions, setSubscriptions] = useState<GymSubscription[]>([]);
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedGym, setSelectedGym] = useState(gymData?.gymId || '');
  const [selectedSubscription, setSelectedSubscription] = useState(gymData?.subscriptionId || '');
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(hobbiesData?.hobbyIds || []);

  // Check if user selected gym sports
  const hasGymSports = sports.some(sport => {
    // You would need to check against your sports data to determine which are gym sports
    // For now, assuming sports with IDs 1, 2, 3 are gym sports
    return ['1', '2', '3'].includes(sport.sportId);
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const promises = [
        supabase.from('hobbie').select('id, name').order('name')
      ];

      if (hasGymSports) {
        promises.push(
          supabase.from('gym').select('id, name').order('name'),
          supabase.from('gymsubscription').select('id, name').order('name')
        );
      }

      const results = await Promise.all(promises);
      
      setHobbies(results[0].data || []);
      
      if (hasGymSports) {
        setGyms(results[1]?.data || []);
        setSubscriptions(results[2]?.data || []);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données');
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

  const handleNext = () => {
    const result: { gym?: OnboardingGym; hobbies?: OnboardingHobbies } = {};

    if (hasGymSports && selectedGym) {
      result.gym = {
        gymId: selectedGym,
        subscriptionId: selectedSubscription || undefined
      };
    }

    if (selectedHobbies.length > 0) {
      result.hobbies = { hobbyIds: selectedHobbies };
    }

    if (!hasGymSports && selectedHobbies.length === 0) {
      Alert.alert('Sélection requise', 'Veuillez sélectionner au moins un hobby');
      return;
    }

    onNext(result);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {hasGymSports ? 'Votre salle de sport' : 'Vos hobbies'}
        </Text>
        <Text style={styles.subtitle}>
          {hasGymSports 
            ? 'Sélectionnez votre salle de sport et votre abonnement'
            : 'Choisissez vos hobbies pour enrichir votre profil'
          }
        </Text>

        {hasGymSports && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Salle de sport</Text>
            <FlatList
              data={gyms}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    selectedGym === item.id && styles.optionButtonSelected
                  ]}
                  onPress={() => setSelectedGym(item.id)}
                >
                  <Text style={[
                    styles.optionButtonText,
                    selectedGym === item.id && styles.optionButtonTextSelected
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              style={styles.optionsList}
            />

            {selectedGym && subscriptions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Type d'abonnement</Text>
                <FlatList
                  data={subscriptions}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        selectedSubscription === item.id && styles.optionButtonSelected
                      ]}
                      onPress={() => setSelectedSubscription(item.id)}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        selectedSubscription === item.id && styles.optionButtonTextSelected
                      ]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                  style={styles.optionsList}
                />
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {hasGymSports ? 'Hobbies (optionnel)' : 'Hobbies'}
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
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Terminer</Text>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  optionsList: {
    maxHeight: 200,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  optionButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  optionButtonText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  optionButtonTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  hobbiesList: {
    maxHeight: 300,
  },
  hobbyChip: {
    flex: 1,
    margin: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
