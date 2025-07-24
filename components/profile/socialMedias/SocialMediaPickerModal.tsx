import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput, StyleSheet } from 'react-native';
import { SocialMedia } from '@/types/profile';

interface SocialMediaPickerModalProps {
  visible: boolean;
  socialMedias: SocialMedia[];
  onSelect: (socialMediaId: string, username: string) => void;
  onClose: () => void;
}

export default function SocialMediaPickerModal({
  visible,
  socialMedias,
  onSelect,
  onClose
}: SocialMediaPickerModalProps) {
  const [selectedSocialMedia, setSelectedSocialMedia] = useState<SocialMedia | null>(null);
  const [username, setUsername] = useState('');

  const handleConfirm = () => {
    if (selectedSocialMedia && username.trim()) {
      onSelect(selectedSocialMedia.id, username.trim());
      setSelectedSocialMedia(null);
      setUsername('');
    }
  };

  const handleCancel = () => {
    setSelectedSocialMedia(null);
    setUsername('');
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
          <Text style={styles.modalTitle}>Ajouter un réseau social</Text>
          
          {!selectedSocialMedia ? (
            <>
              <Text style={styles.stepTitle}>1. Choisissez un réseau social :</Text>
              <FlatList
                data={socialMedias}
                keyExtractor={(item) => item.id}
                style={styles.list}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => setSelectedSocialMedia(item)}
                  >
                    <Text style={styles.listItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Tous les réseaux sociaux ont été ajoutés</Text>
                }
              />
            </>
          ) : (
            <>
              <Text style={styles.stepTitle}>2. Entrez votre nom d'utilisateur {selectedSocialMedia.name} :</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nom d'utilisateur :</Text>
                <TextInput
                  style={styles.textInput}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Votre nom d'utilisateur"
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setSelectedSocialMedia(null)}
                >
                  <Text style={styles.backButtonText}>Retour</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    !username.trim() && styles.disabledButton
                  ]}
                  onPress={handleConfirm}
                  disabled={!username.trim()}
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
  listItemText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  emptyText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
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
