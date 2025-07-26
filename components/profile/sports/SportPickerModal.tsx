import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Sport, SportLevel } from '@/types/profile';

interface SportPickerModalProps {
  visible: boolean;
  sports: Sport[];
  sportLevels: SportLevel[];
  onSelect: (sportId: string, levelId: string) => void;
  onClose: () => void;
}

export default function SportPickerModal({
  visible,
  sports,
  sportLevels,
  onSelect,
  onClose
}: SportPickerModalProps) {
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<SportLevel | null>(null);

  const handleConfirm = () => {
    if (selectedSport && selectedLevel) {
      onSelect(selectedSport.id, selectedLevel.id);
      setSelectedSport(null);
      setSelectedLevel(null);
    }
  };

  const handleCancel = () => {
    setSelectedSport(null);
    setSelectedLevel(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Ajouter un sport</Text>
          
          {!selectedSport ? (
            <>
              <Text style={styles.stepTitle}>1. Choisissez un sport :</Text>
              <FlatList
                data={sports}
                keyExtractor={(item) => item.id}
                style={styles.list}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => setSelectedSport(item)}
                  >
                    <Text style={styles.listItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Tous les sports ont été ajoutés</Text>
                }
              />
            </>
          ) : (
            <>
              <Text style={styles.stepTitle}>2. Choisissez votre niveau en {selectedSport.name} :</Text>
              <FlatList
                data={sportLevels}
                keyExtractor={(item) => item.id}
                style={styles.list}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.listItem,
                      selectedLevel?.id === item.id && styles.selectedItem
                    ]}
                    onPress={() => setSelectedLevel(item)}
                  >
                    <Text style={[
                      styles.listItemText,
                      selectedLevel?.id === item.id && styles.selectedItemText
                    ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Aucun niveau disponible</Text>
                }
              />
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setSelectedSport(null)}
                >
                  <Text style={styles.backButtonText}>Retour</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    !selectedLevel && styles.disabledButton
                  ]}
                  onPress={handleConfirm}
                  disabled={!selectedLevel}
                  testID="confirm-button"
                >
                  <Text style={styles.confirmButtonText}>Confirmer</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 15,
  },
  list: {
    maxHeight: 300,
    marginBottom: 20,
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedItem: {
    backgroundColor: '#007AFF',
  },
  listItemText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  selectedItemText: {
    color: '#fff',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 10,
    borderRadius: 6,
    marginRight: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 10,
    borderRadius: 6,
    marginLeft: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#dee2e6',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
});
