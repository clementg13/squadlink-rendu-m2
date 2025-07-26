import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { UserProfile, Sport, SportLevel } from '@/types/profile';
import SportChip from './SportChip';
import SportPickerModal from './SportPickerModal';

interface ProfileSportsProps {
  profile?: UserProfile | null;
  sports: Sport[];
  sportLevels: SportLevel[];
  saving: boolean;
  onAddSport: (sportId: string, levelId: string) => Promise<void>;
  onRemoveSport: (sportId: string) => Promise<void>;
}

export default function ProfileSports({ 
  profile, 
  sports, 
  sportLevels,
  saving, 
  onAddSport, 
  onRemoveSport 
}: ProfileSportsProps) {
  const [showSportPicker, setShowSportPicker] = useState(false);

  const getUserSports = () => {
    return profile?.sports || [];
  };

  const getAvailableSports = () => {
    const userSportIds = getUserSports().map(s => s.id_sport);
    return sports.filter(s => !userSportIds.includes(s.id));
  };

  const handleAddSport = async (sportId: string, levelId: string) => {
    await onAddSport(sportId, levelId);
    setShowSportPicker(false);
  };

  const handleRemoveSport = (sportId: string) => {
    Alert.alert(
      'Supprimer le sport',
      'Êtes-vous sûr de vouloir supprimer ce sport ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => onRemoveSport(sportId)
        },
      ]
    );
  };

  const userSports = getUserSports();

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mes sports</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowSportPicker(true)}
          disabled={saving}
        >
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sportsContainer}>
        {userSports.length > 0 ? (
          userSports.map((userSport) => (
            <SportChip
              key={`${userSport.id_sport}-${userSport.id_sport_level}`}
              userSport={userSport}
              saving={saving}
              onRemove={handleRemoveSport}
            />
          ))
        ) : (
          <Text style={styles.noSportsText}>
            Aucun sport ajouté. Ajoutez vos sports pratiqués pour améliorer votre profil !
          </Text>
        )}
      </View>

      <SportPickerModal
        visible={showSportPicker}
        sports={getAvailableSports()}
        sportLevels={sportLevels}
        onSelect={handleAddSport}
        onClose={() => setShowSportPicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sportsContainer: {
    minHeight: 50,
  },
  noSportsText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 20,
  },
});