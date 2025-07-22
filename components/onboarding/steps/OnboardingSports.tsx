import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { OnboardingSport } from '@/types/onboarding';
import { OnboardingService } from '@/services/onboardingService';

interface Sport {
  id: string;
  name: string;
}

interface Level {
  id: string;
  name: string;
}

interface OnboardingSportsProps {
  data?: OnboardingSport[];
  userId: string;
  onNext: (sports: OnboardingSport[]) => void;
  onBack: () => void;
}

export default function OnboardingSports({ data, userId, onNext, onBack }: OnboardingSportsProps) {
  const [sports, setSports] = useState<Sport[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedSports, setSelectedSports] = useState<OnboardingSport[]>(data || []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSportsAndLevels();
  }, []);

  const loadSportsAndLevels = async () => {
    try {
      const [sportsResult, levelsResult] = await Promise.all([
        supabase.from('sport').select('id, name').order('name'),
        supabase.from('sportlevel').select('id, name').order('id')
      ]);

      if (sportsResult.error) throw sportsResult.error;
      if (levelsResult.error) throw levelsResult.error;

      setSports(sportsResult.data || []);
      setLevels(levelsResult.data || []);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const handleSportSelect = (sportId: string) => {
    const isSelected = selectedSports.some(s => s.sportId === sportId);
    
    if (isSelected) {
      setSelectedSports(prev => prev.filter(s => s.sportId !== sportId));
    } else {
      // Add sport with default level
      setSelectedSports(prev => [...prev, { sportId, levelId: levels[0]?.id || '1' }]);
    }
  };

  const handleLevelChange = (sportId: string, levelId: string) => {
    setSelectedSports(prev => 
      prev.map(sport => 
        sport.sportId === sportId ? { ...sport, levelId } : sport
      )
    );
  };

  const handleNext = async () => {
    if (selectedSports.length === 0) {
      Alert.alert('Sport requis', 'Veuillez sélectionner au moins un sport');
      return;
    }

    try {
      setSaving(true);
      const result = await OnboardingService.updateUserSports(userId, selectedSports);
      
      if (result.success) {
        onNext(selectedSports);
      } else {
        Alert.alert('Erreur', result.error || 'Impossible de sauvegarder les sports');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur inattendue est survenue');
    } finally {
      setSaving(false);
    }
  };

  const renderSport = ({ item }: { item: Sport }) => {
    const selectedSport = selectedSports.find(s => s.sportId === item.id);
    const isSelected = !!selectedSport;

    return (
      <View style={styles.sportItem}>
        <TouchableOpacity
          style={[styles.sportButton, isSelected && styles.sportButtonSelected]}
          onPress={() => handleSportSelect(item.id)}
        >
          <Text style={[styles.sportButtonText, isSelected && styles.sportButtonTextSelected]}>
            {item.name}
          </Text>
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.levelSelector}>
            <Text style={styles.levelLabel}>Niveau :</Text>
            <View style={styles.levelButtons}>
              {levels.map(level => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.levelButton,
                    selectedSport?.levelId === level.id && styles.levelButtonSelected
                  ]}
                  onPress={() => handleLevelChange(item.id, level.id)}
                >
                  <Text style={[
                    styles.levelButtonText,
                    selectedSport?.levelId === level.id && styles.levelButtonTextSelected
                  ]}>
                    {level.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement des sports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Choisissez vos sports</Text>
        <Text style={styles.subtitle}>
          Sélectionnez les sports que vous pratiquez et votre niveau
        </Text>

        <FlatList
          data={sports}
          renderItem={renderSport}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          style={styles.sportsList}
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
            <Text style={styles.nextButtonText}>Suivant</Text>
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
  sportsList: {
    flex: 1,
  },
  sportItem: {
    marginBottom: 16,
  },
  sportButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  sportButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  sportButtonText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  sportButtonTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  levelSelector: {
    marginTop: 8,
    paddingLeft: 16,
  },
  levelLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  levelButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  levelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  levelButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  levelButtonText: {
    fontSize: 12,
    color: '#666',
  },
  levelButtonTextSelected: {
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
