import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome } from '@expo/vector-icons';
import { Sport } from '@/types/profile';
import { CreateWorkoutSessionData } from '@/types/workout';

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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSportsList, setShowSportsList] = useState(false);

  useEffect(() => {
    if (visible) {
      // Initialiser avec la date d'aujourd'hui et une heure dans le futur
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      
      setSelectedDate(tomorrow);
      
      const start = new Date(tomorrow);
      start.setHours(18, 0, 0, 0); // 18h00
      setStartTime(start);
      
      const end = new Date(tomorrow);
      end.setHours(19, 30, 0, 0); // 19h30
      setEndTime(end);
      
      setSelectedSport(null);
    }
  }, [visible]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      // Mettre à jour les heures avec la nouvelle date
      const newStartTime = new Date(date);
      newStartTime.setHours(startTime.getHours(), startTime.getMinutes());
      setStartTime(newStartTime);
      
      const newEndTime = new Date(date);
      newEndTime.setHours(endTime.getHours(), endTime.getMinutes());
      setEndTime(newEndTime);
    }
  };

  const handleStartTimeChange = (event: any, time?: Date) => {
    setShowStartTimePicker(false);
    if (time) {
      const newStartTime = new Date(selectedDate);
      newStartTime.setHours(time.getHours(), time.getMinutes());
      setStartTime(newStartTime);
      
      // Ajuster l'heure de fin si elle est avant l'heure de début
      if (newStartTime >= endTime) {
        const newEndTime = new Date(newStartTime);
        newEndTime.setHours(newStartTime.getHours() + 1, newStartTime.getMinutes());
        setEndTime(newEndTime);
      }
    }
  };

  const handleEndTimeChange = (event: any, time?: Date) => {
    setShowEndTimePicker(false);
    if (time) {
      const newEndTime = new Date(selectedDate);
      newEndTime.setHours(time.getHours(), time.getMinutes());
      setEndTime(newEndTime);
    }
  };

  const validateAndCreate = async () => {
    if (!selectedSport) {
      Alert.alert('Erreur', 'Veuillez sélectionner un sport');
      return;
    }

    if (startTime >= endTime) {
      Alert.alert('Erreur', 'L\'heure de fin doit être après l\'heure de début');
      return;
    }

    if (startTime <= new Date()) {
      Alert.alert('Erreur', 'La séance ne peut pas être programmée dans le passé');
      return;
    }

    setLoading(true);
    try {
      await onCreateSession({
        start_date: startTime.toISOString(),
        end_date: endTime.toISOString(),
        id_sport: selectedSport.id,
        groupId: 0, // Sera défini dans le composant parent
      });
      onClose();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la séance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Annuler</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Nouvelle séance</Text>
          <TouchableOpacity onPress={validateAndCreate} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text style={styles.createButton}>Créer</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Sélection du sport */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sport</Text>
            <TouchableOpacity 
              style={styles.sportSelector}
              onPress={() => setShowSportsList(!showSportsList)}
            >
              <Text style={[styles.sportText, !selectedSport && styles.placeholder]}>
                {selectedSport ? selectedSport.name : 'Sélectionner un sport'}
              </Text>
              <FontAwesome 
                name={showSportsList ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#666" 
              />
            </TouchableOpacity>
            
            {showSportsList && (
              <View style={styles.sportsList}>
                {sports.map((sport) => (
                  <TouchableOpacity
                    key={sport.id}
                    style={[
                      styles.sportItem,
                      selectedSport?.id === sport.id && styles.selectedSportItem
                    ]}
                    onPress={() => {
                      setSelectedSport(sport);
                      setShowSportsList(false);
                    }}
                  >
                    <Text style={[
                      styles.sportItemText,
                      selectedSport?.id === sport.id && styles.selectedSportItemText
                    ]}>
                      {sport.name}
                    </Text>
                    {selectedSport?.id === sport.id && (
                      <FontAwesome name="check" size={16} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date</Text>
            <TouchableOpacity
              style={styles.timeSelector}
              onPress={() => setShowDatePicker(true)}
            >
              <FontAwesome name="calendar" size={20} color="#007AFF" />
              <Text style={styles.timeText}>
                {selectedDate.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Heure de début */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Heure de début</Text>
            <TouchableOpacity
              style={styles.timeSelector}
              onPress={() => setShowStartTimePicker(true)}
            >
              <FontAwesome name="clock-o" size={20} color="#007AFF" />
              <Text style={styles.timeText}>
                {startTime.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Heure de fin */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Heure de fin</Text>
            <TouchableOpacity
              style={styles.timeSelector}
              onPress={() => setShowEndTimePicker(true)}
            >
              <FontAwesome name="clock-o" size={20} color="#007AFF" />
              <Text style={styles.timeText}>
                {endTime.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Date Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showStartTimePicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            display="default"
            onChange={handleStartTimeChange}
          />
        )}

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
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  createButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sportSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sportText: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  sportsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 8,
  },
  sportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedSportItem: {
    backgroundColor: '#f0f8ff',
  },
  sportItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedSportItemText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
});
