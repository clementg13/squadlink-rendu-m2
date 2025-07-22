import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { UserProfile } from '@/types/profile';

interface ProfileFormProps {
  formData: {
    firstname: string;
    lastname: string;
    birthdate: string;
    biography?: string;
  };
  saving: boolean;
  onFieldChange: (field: string, value: string) => void;
}

export default function ProfileForm({ formData, saving, onFieldChange }: ProfileFormProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0];
      onFieldChange('birthdate', formattedDate);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    // Nettoyer la valeur avant de l'envoyer
    const cleanValue = value ? value.trim() : '';
    onFieldChange(field, cleanValue);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Prénom</Text>
        <TextInput
          style={[styles.input, saving && styles.inputDisabled]}
          value={formData.firstname || ''}
          onChangeText={(value) => handleFieldChange('firstname', value)}
          placeholder="Votre prénom"
          autoCapitalize="words"
          editable={!saving}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nom</Text>
        <TextInput
          style={[styles.input, saving && styles.inputDisabled]}
          value={formData.lastname || ''}
          onChangeText={(value) => handleFieldChange('lastname', value)}
          placeholder="Votre nom"
          autoCapitalize="words"
          editable={!saving}
        />
      </View>

      {formData.birthdate && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date de naissance</Text>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              {new Date(formData.birthdate).toLocaleDateString('fr-FR')}
            </Text>
            <Text style={styles.dateHint}>
              Pour modifier votre date de naissance, contactez le support
            </Text>
          </View>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Biographie</Text>
        <TextInput
          style={[styles.textArea, saving && styles.inputDisabled]}
          value={formData.biography || ''}
          onChangeText={(value) => handleFieldChange('biography', value)}
          placeholder="Parlez-nous de vous..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={!saving}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateContainer: {
    flexDirection: 'column',
  },
  dateText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  dateHint: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
});
