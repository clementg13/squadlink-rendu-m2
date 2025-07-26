import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';

interface OnboardingSportsProps {
  onNext: (sportsData: SportSelection[]) => void;
  onBack: () => void;
}

interface Sport {
  id: string;
  name: string;
}

interface SportLevel {
  id: string;
  name: string;
}

interface SportSelection {
  sportId: string;
  levelId: string;
  sportName: string;
  levelName: string;
}

export default function OnboardingSports({ onNext, onBack }: OnboardingSportsProps) {
  const [sports, setSports] = useState<Sport[]>([]);
  const [sportLevels, setSportLevels] = useState<SportLevel[]>([]);
  const [selectedSports, setSelectedSports] = useState<SportSelection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSportsData();
  }, []);

  const loadSportsData = async () => {
    try {
      const [sportsResponse, levelsResponse] = await Promise.all([
        supabase.from('sport').select('*').order('name'),
        supabase.from('sportlevel').select('*').order('name')
      ]);

      if (sportsResponse.error) throw sportsResponse.error;
      if (levelsResponse.error) throw levelsResponse.error;

      setSports(sportsResponse.data || []);
      setSportLevels(levelsResponse.data || []);
    } catch (error) {
      console.error('Error loading sports data:', error);
      Alert.alert('Erreur', 'Impossible de charger les sports disponibles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSportSelect = (sport: Sport) => {
    const isSelected = selectedSports.find(s => s.sportId === sport.id);
    
    if (isSelected) {
      // Retirer le sport
      setSelectedSports(prev => prev.filter(s => s.sportId !== sport.id));
    } else if (selectedSports.length < 5) {
      // Ajouter le sport avec le niveau débutant par défaut
      const beginnerLevel = sportLevels.find(level => level.name.toLowerCase().includes('débutant')) || sportLevels[0];
      if (beginnerLevel) {
        setSelectedSports(prev => [...prev, {
          sportId: sport.id,
          levelId: beginnerLevel.id,
          sportName: sport.name,
          levelName: beginnerLevel.name,
        }]);
      }
    } else {
      Alert.alert('Limite atteinte', 'Vous pouvez sélectionner maximum 5 sports');
    }
  };

  const handleLevelChange = (sportId: string, levelId: string) => {
    const level = sportLevels.find(l => l.id === levelId);
    if (!level) return;

    setSelectedSports(prev => 
      prev.map(sport => 
        sport.sportId === sportId 
          ? { ...sport, levelId, levelName: level.name }
          : sport
      )
    );
  };

  const handleNext = () => {
    if (selectedSports.length === 0) {
      Alert.alert('Sélection requise', 'Veuillez sélectionner au moins un sport');
      return;
    }

    console.log('🏃 OnboardingSports: Sports selected:', selectedSports);
    onNext(selectedSports);
  };

  const renderSportItem = ({ item }: { item: Sport }) => {
    const isSelected = selectedSports.find(s => s.sportId === item.id);
    const selectedSport = selectedSports.find(s => s.sportId === item.id);

    return (
      <View style={styles.sportItem}>
        <TouchableOpacity
          style={[
            styles.sportButton,
            isSelected && styles.sportButtonSelected
          ]}
          onPress={() => handleSportSelect(item)}
        >
          <Text style={[
            styles.sportButtonText,
            isSelected && styles.sportButtonTextSelected
          ]}>
            {item.name}
          </Text>
        </TouchableOpacity>

        {isSelected && selectedSport && (
          <View style={styles.levelSelector}>
            <Text style={styles.levelLabel}>Niveau :</Text>
            <View style={styles.levelButtons}>
              {sportLevels.map(level => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.levelButton,
                    selectedSport.levelId === level.id && styles.levelButtonSelected
                  ]}
                  onPress={() => handleLevelChange(item.id, level.id)}
                >
                  <Text style={[
                    styles.levelButtonText,
                    selectedSport.levelId === level.id && styles.levelButtonTextSelected
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

  if (isLoading) {
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
        <Text style={styles.title}>Vos sports</Text>
        <Text style={styles.subtitle}>
          Sélectionnez les sports que vous pratiquez (max 5)
        </Text>
        <Text style={styles.counter}>
          {selectedSports.length}/5 sports sélectionnés
        </Text>

        <FlatList
          data={sports}
          keyExtractor={(item) => item.id}
          renderItem={renderSportItem}
          showsVerticalScrollIndicator={false}
          style={styles.sportsList}
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
            style={[
              styles.nextButton,
              selectedSports.length === 0 && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={selectedSports.length === 0}
          >
            <Text style={styles.nextButtonText}>Continuer</Text>
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
  sportsList: {
    flex: 1,
  },
  sportItem: {
    marginBottom: 16,
  },
  sportButton: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
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
    fontWeight: '500',
  },
  sportButtonTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  levelSelector: {
    marginTop: 12,
    paddingLeft: 16,
  },
  levelLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  levelButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  levelButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  levelButtonText: {
    fontSize: 14,
    color: '#666',
  },
  levelButtonTextSelected: {
    color: '#fff',
    fontWeight: '500',
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
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
