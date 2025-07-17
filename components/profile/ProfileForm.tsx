import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { UserProfile } from '@/stores/profileStore';

interface ProfileFormProps {
  formData: {
    lastname: string;
    firstname: string;
    birthdate: string;
    biography: string;
  };
  profile?: UserProfile | null;
  saving: boolean;
  onFieldChange: (field: string, value: string) => void;
}

export default function ProfileForm({ formData, profile, saving, onFieldChange }: ProfileFormProps) {
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

  return (
    <View style={styles.container}>
      {/* Prénom */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Prénom</Text>
        <TextInput
          style={styles.input}
          value={formData.firstname}
          onChangeText={(value) => onFieldChange('firstname', value)}
          placeholder="Votre prénom"
          editable={!saving}
        />
      </View>

      {/* Nom */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Nom</Text>
        <TextInput
          style={styles.input}
          value={formData.lastname}
          onChangeText={(value) => onFieldChange('lastname', value)}
          placeholder="Votre nom"
          editable={!saving}
        />
      </View>

      {/* Date de naissance */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Date de naissance</Text>
        <TouchableOpacity 
          style={[styles.input, styles.datePickerButton]}
          onPress={() => setShowDatePicker(true)}
          disabled={saving}
        >
          <Text style={formData.birthdate ? styles.dateText : styles.placeholderText}>
            {formData.birthdate ? 
              new Date(formData.birthdate).toLocaleDateString('fr-FR') : 
              'Sélectionnez votre date de naissance'
            }
          </Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
          />
        )}
      </View>

      {/* Localisation (lecture seule) */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Localisation</Text>
        <View style={[styles.input, styles.inputReadonly]}>
          <Text style={styles.inputTextReadonly}>
            {profile?.location ? 
              `${profile.location.town} (${profile.location.postal_code})` : 
              'Non définie'
            }
          </Text>
        </View>
      </View>

      {/* Salle de sport */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Salle de sport</Text>
        <View style={[styles.input, styles.inputReadonly]}>
          <Text style={styles.inputTextReadonly}>
            {profile?.gym?.name || 'Non définie'}
          </Text>
        </View>
      </View>

      {/* Abonnement salle */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Type d'abonnement</Text>
        <View style={[styles.input, styles.inputReadonly]}>
          <Text style={styles.inputTextReadonly}>
            {profile?.gymsubscription?.name || 'Non défini'}
          </Text>
        </View>
      </View>

      {/* Biographie */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Biographie</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.biography}
          onChangeText={(value) => onFieldChange('biography', value)}
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
  fieldGroup: {
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
  inputReadonly: {
    backgroundColor: '#f8f9fa',
  },
  inputTextReadonly: {
    fontSize: 16,
    color: '#6c757d',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  placeholderText: {
    fontSize: 16,
    color: '#6c757d',
  },
});
