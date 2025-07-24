import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { UserProfile, Hobbie } from '@/types/profile';
import HobbyGroup from './hobbies/HobbyGroup';
import HobbyPickerModal from './hobbies/HobbyPickerModal';

interface ProfileHobbiesProps {
  profile?: UserProfile | null;
  hobbies: Hobbie[];
  saving: boolean;
  onAddHobby: (hobbyId: string) => Promise<void>;
  onRemoveHobby: (hobbyId: string) => Promise<void>;
  onToggleHighlight: (hobbyId: string) => Promise<void>;
}

export default function ProfileHobbies({ 
  profile, 
  hobbies, 
  saving, 
  onAddHobby, 
  onRemoveHobby, 
  onToggleHighlight 
}: ProfileHobbiesProps) {
  const [showHobbyPicker, setShowHobbyPicker] = useState(false);

  const getUserHobbies = () => {
    // Correction : certains profils utilisent "hobbies", d'autres "hobby"
    return profile?.hobbies || [];
  };

  const getAvailableHobbies = () => {
    const userHobbyIds = getUserHobbies().map(h => h.id_hobbie);
    return hobbies.filter(h => !userHobbyIds.includes(h.id));
  };

  const getHighlightedHobbies = () => {
    return getUserHobbies().filter(h => h.is_highlighted);
  };

  const getRegularHobbies = () => {
    return getUserHobbies().filter(h => !h.is_highlighted);
  };

  const handleAddHobby = async (hobbyId: string) => {
    await onAddHobby(hobbyId);
    setShowHobbyPicker(false);
  };

  const handleRemoveHobby = (hobbyId: string) => {
    Alert.alert(
      'Supprimer le hobby',
      'Êtes-vous sûr de vouloir supprimer ce hobby ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => onRemoveHobby(hobbyId)
        },
      ]
    );
  };

  const highlightedHobbies = getHighlightedHobbies();
  const regularHobbies = getRegularHobbies();
  const canHighlight = highlightedHobbies.length < 3;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mes hobbies</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowHobbyPicker(true)}
          disabled={saving}
        >
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <HobbyGroup
        title={`⭐ Favoris (${highlightedHobbies.length}/3)`}
        hobbies={highlightedHobbies}
        canHighlight={false}
        saving={saving}
        onToggleHighlight={onToggleHighlight}
        onRemove={handleRemoveHobby}
      />

      <HobbyGroup
        title="Autres hobbies"
        hobbies={regularHobbies}
        canHighlight={canHighlight}
        saving={saving}
        onToggleHighlight={onToggleHighlight}
        onRemove={handleRemoveHobby}
      />

      {getUserHobbies().length === 0 && (
        <Text style={styles.noHobbiesText}>Aucun hobby ajouté. Commencez par en ajouter !</Text>
      )}

      <HobbyPickerModal
        visible={showHobbyPicker}
        hobbies={getAvailableHobbies()}
        onSelect={handleAddHobby}
        onClose={() => setShowHobbyPicker(false)}
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
  noHobbiesText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
});
