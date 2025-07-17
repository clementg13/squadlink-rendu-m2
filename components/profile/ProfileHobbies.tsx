import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, FlatList, StyleSheet } from 'react-native';
import { UserProfile, Hobbie } from '@/stores/profileStore';

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
    return profile?.hobbies || [];
  };

  const getAvailableHobbies = () => {
    const userHobbyIds = getUserHobbies().map(h => h.id_hobbie);
    return hobbies.filter(h => !userHobbyIds.includes(h.id));
  };

  const getHighlightedHobbies = () => {
    return getUserHobbies().filter(h => h.is_highlighted);
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

      {/* Hobbies en favoris */}
      {getHighlightedHobbies().length > 0 && (
        <View style={styles.hobbyGroup}>
          <Text style={styles.hobbyGroupTitle}>⭐ Favoris ({getHighlightedHobbies().length}/3)</Text>
          <View style={styles.hobbiesContainer}>
            {getHighlightedHobbies().map((userHobby) => (
              <View key={userHobby.id} style={[styles.hobbyChip, styles.hobbyHighlighted]}>
                <Text style={styles.hobbyChipTextHighlighted}>{userHobby.hobbie?.name}</Text>
                <TouchableOpacity
                  style={styles.hobbyAction}
                  onPress={() => onToggleHighlight(userHobby.id_hobbie)}
                  disabled={saving}
                >
                  <Text style={styles.hobbyActionTextHighlighted}>⭐</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.hobbyAction}
                  onPress={() => handleRemoveHobby(userHobby.id_hobbie)}
                  disabled={saving}
                >
                  <Text style={styles.hobbyActionTextHighlighted}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Autres hobbies */}
      {getUserHobbies().filter(h => !h.is_highlighted).length > 0 && (
        <View style={styles.hobbyGroup}>
          <Text style={styles.hobbyGroupTitle}>Autres hobbies</Text>
          <View style={styles.hobbiesContainer}>
            {getUserHobbies().filter(h => !h.is_highlighted).map((userHobby) => (
              <View key={userHobby.id} style={styles.hobbyChip}>
                <Text style={styles.hobbyChipText}>{userHobby.hobbie?.name}</Text>
                {getHighlightedHobbies().length < 3 && (
                  <TouchableOpacity
                    style={styles.hobbyAction}
                    onPress={() => onToggleHighlight(userHobby.id_hobbie)}
                    disabled={saving}
                  >
                    <Text style={styles.hobbyActionText}>☆</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.hobbyAction}
                  onPress={() => handleRemoveHobby(userHobby.id_hobbie)}
                  disabled={saving}
                >
                  <Text style={styles.hobbyActionText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {getUserHobbies().length === 0 && (
        <Text style={styles.noHobbiesText}>Aucun hobby ajouté. Commencez par en ajouter !</Text>
      )}

      {/* Modal pour sélection d'hobby */}
      <Modal
        visible={showHobbyPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHobbyPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionnez un hobby</Text>
            <FlatList
              data={getAvailableHobbies()}
              keyExtractor={(item) => item.id}
              style={styles.hobbyList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleAddHobby(item.id)}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.noHobbiesText}>Tous les hobbies ont été ajoutés</Text>
              }
            />
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowHobbyPicker(false)}
            >
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  hobbyGroup: {
    marginBottom: 15,
  },
  hobbyGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 8,
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hobbyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 4,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  hobbyHighlighted: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  hobbyChipText: {
    fontSize: 14,
    color: '#2c3e50',
    marginRight: 4,
  },
  hobbyChipTextHighlighted: {
    fontSize: 14,
    color: '#fff',
    marginRight: 4,
  },
  hobbyAction: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  hobbyActionText: {
    fontSize: 16,
    color: '#6c757d',
  },
  hobbyActionTextHighlighted: {
    fontSize: 16,
    color: '#fff',
  },
  noHobbiesText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
  hobbyList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalItemText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  modalCancelButton: {
    marginTop: 15,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#007AFF',
  },
});
