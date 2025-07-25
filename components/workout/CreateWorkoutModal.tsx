import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome } from '@expo/vector-icons';
import { CreateWorkoutSessionData } from '@/types/workout';

interface Sport {
  id: string;
  name: string;
}

interface CreateWorkoutModalProps {
  visible: boolean;
  sports: Sport[];
  onClose: () => void;
  onCreateSession: (data: CreateWorkoutSessionData) => Promise<void>;
}

export default function CreateWorkoutModal({
  visible,
  sports,
  onClose,
  onCreateSession,
}: CreateWorkoutModalProps) {
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [showSportPicker, setShowSportPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // États pour la date et l'heure
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [startTime, setStartTime] = useState(() => {
    const defaultStart = new Date();
    defaultStart.setHours(18, 0, 0, 0);
    return defaultStart;
  });
  const [endTime, setEndTime] = useState(() => {
    const defaultEnd = new Date();
    defaultEnd.setHours(19, 30, 0, 0);
    return defaultEnd;
  });

  // États pour l'affichage des pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Réinitialiser les valeurs quand le modal s'ouvre
  useEffect(() => {
    if (visible) {
      setSelectedSport(null);
      setShowSportPicker(false);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow);
      
      const defaultStart = new Date();
      defaultStart.setHours(18, 0, 0, 0);
      setStartTime(defaultStart);
      
      const defaultEnd = new Date();
      defaultEnd.setHours(19, 30, 0, 0);
      setEndTime(defaultEnd);
    }
  }, [visible]);

  const handleDateChange = (_event: unknown, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleStartTimeChange = (_event: unknown, time?: Date) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (time) {
      setStartTime(time);
      
      // Ajuster automatiquement l'heure de fin pour qu'elle soit 1h30 après le début
      const newEndTime = new Date(time);
      newEndTime.setHours(newEndTime.getHours() + 1);
      newEndTime.setMinutes(newEndTime.getMinutes() + 30);
      setEndTime(newEndTime);
    }
  };

  const handleEndTimeChange = (_event: unknown, time?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (time) {
      setEndTime(time);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const handleCreate = async () => {
    // Validation du sport
    if (!selectedSport) {
      Alert.alert('Erreur', 'Veuillez sélectionner un sport');
      return;
    }

    // Validation des heures
    if (endTime <= startTime) {
      Alert.alert('Erreur', 'L\'heure de fin doit être après l\'heure de début');
      return;
    }

    // Créer les dates complètes en combinant la date sélectionnée avec les heures
    const sessionStart = new Date(selectedDate);
    sessionStart.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

    const sessionEnd = new Date(selectedDate);
    sessionEnd.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

    // Validation que c'est dans le futur
    const now = new Date();
    if (sessionStart <= now) {
      Alert.alert('Erreur', 'La séance doit être programmée dans le futur');
      return;
    }

    setLoading(true);

    try {
      const sessionData: CreateWorkoutSessionData = {
        start_date: sessionStart.toISOString(),
        end_date: sessionEnd.toISOString(),
        id_sport: selectedSport.id,
        groupId: 0, // Sera remplacé par le vrai groupId
      };

      await onCreateSession(sessionData);
      onClose();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la séance');
    } finally {
      setLoading(false);
    }
  };

  const renderSportPicker = () => (
    <View style={styles.sportPicker}>
      {sports.map((sport) => (
        <TouchableOpacity
          key={sport.id}
          style={styles.sportOption}
          onPress={() => {
            setSelectedSport(sport);
            setShowSportPicker(false);
          }}
        >
          <Text style={styles.sportOptionText}>{sport.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Nouvelle séance</Text>
          <TouchableOpacity onPress={onClose}>
            <FontAwesome name="times" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Sport */}
          <View style={styles.section}>
            <Text style={styles.label}>Sport</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowSportPicker(!showSportPicker)}
            >
              <Text style={styles.selectorText}>
                {selectedSport ? selectedSport.name : 'Sélectionner un sport'}
              </Text>
              <FontAwesome name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
            {showSportPicker && renderSportPicker()}
          </View>

          {/* Date */}
          <View style={styles.section}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {formatDate(selectedDate)}
              </Text>
              <FontAwesome name="calendar" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Heures */}
          <View style={styles.timeSection}>
            <View style={styles.timeInput}>
              <Text style={styles.label}>Heure de début</Text>
              <TouchableOpacity
                style={styles.timeSelector}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text style={styles.timeText}>{formatTime(startTime)}</Text>
                <FontAwesome name="clock-o" size={16} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.timeInput}>
              <Text style={styles.label}>Heure de fin</Text>
              <TouchableOpacity
                style={styles.timeSelector}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text style={styles.timeText}>{formatTime(endTime)}</Text>
                <FontAwesome name="clock-o" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Créer</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Start Time Picker */}
        {showStartTimePicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            display="default"
            onChange={handleStartTimeChange}
          />
        )}

        {/* End Time Picker */}
        {showEndTimePicker && (
          <DateTimePicker
            value={endTime}
            mode="time"
            display="default"
            onChange={handleEndTimeChange}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
  sportPicker: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: 8,
  },
  sportOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sportOptionText: {
    fontSize: 16,
    color: '#333',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  timeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  timeText: {
    fontSize: 16,
    color: '#333',
  },
  timeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  createButton: {
    flex: 1,
    marginLeft: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});