import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UserProfile, Gym, GymSubscription } from '@/types/profile';
import GymPickerModal from './GymPickerModal';
import SubscriptionPickerModal from './SubscriptionPickerModal';

interface ProfileGymProps {
  profile?: UserProfile | null;
  gyms: Gym[];
  gymSubscriptions: GymSubscription[];
  saving: boolean;
  onUpdateGym: (subscriptionId: string | null, gymId?: string | null) => Promise<void>;
  onLoadGymSubscriptions: () => Promise<void>;
}

export default function ProfileGym({ 
  profile, 
  gyms, 
  gymSubscriptions,
  saving, 
  onUpdateGym,
  onLoadGymSubscriptions
}: ProfileGymProps) {
  const [showGymPicker, setShowGymPicker] = useState(false);
  const [showSubscriptionPicker, setShowSubscriptionPicker] = useState(false);
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null);

  useEffect(() => {
    onLoadGymSubscriptions();
  }, [onLoadGymSubscriptions, gyms.length]);

  const handleGymSelect = (gymId: string) => {
    setSelectedGymId(gymId);
    setShowGymPicker(false);
    setShowSubscriptionPicker(true);
  };

  const handleSubscriptionSelect = async (subscriptionId: string) => {
    setShowSubscriptionPicker(false);
    await onUpdateGym(subscriptionId, selectedGymId);
  };

  const handleRemoveSubscription = async () => {
    setSelectedGymId(null);
    await onUpdateGym(null, null);
  };

  const getSelectedGym = () => {
    if (!selectedGymId) return null;
    
    const selectedGymIdStr = selectedGymId.toString();
    return gyms.find(g => g.id.toString() === selectedGymIdStr) || null;
  };

  useEffect(() => {
    if (profile?.gymsubscription) {
      const gymIdFromProfile = profile.gymsubscription.id_gym;
      setSelectedGymId(gymIdFromProfile?.toString() || null);
    } else {
      setSelectedGymId(null);
    }
  }, [profile?.gymsubscription]);

  const getGymsWithSubscriptions = () => {
    return gyms.filter(gym => 
      gymSubscriptions.some(sub => {
        const gymIdStr = gym.id.toString();
        const subGymIdStr = sub.id_gym.toString();
        return subGymIdStr === gymIdStr;
      })
    );
  };

  const getAvailableSubscriptions = () => {
    if (!selectedGymId) return [];
    
    const selectedGymIdStr = selectedGymId.toString();
    return gymSubscriptions.filter(s => {
      const subGymIdStr = s.id_gym.toString();
      return subGymIdStr === selectedGymIdStr;
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Salle de sport</Text>
      
      {profile?.gymsubscription ? (
        <View style={styles.currentSelection}>
          <View style={styles.selectionRow}>
            <Text style={styles.label}>Salle :</Text>
            <Text style={styles.value}>{getSelectedGym()?.name || 'Non définie'}</Text>
          </View>
          <View style={styles.selectionRow}>
            <Text style={styles.label}>Abonnement :</Text>
            <Text style={styles.value}>{profile.gymsubscription.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => setShowGymPicker(true)}
            disabled={saving}
          >
            <Text style={styles.changeButtonText}>Changer d'abonnement</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemoveSubscription}
            disabled={saving}
          >
            <Text style={styles.removeButtonText}>Supprimer l'abonnement</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.noSelection}>
          <Text style={styles.noSelectionText}>Aucun abonnement sélectionné</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowGymPicker(true)}
            disabled={saving}
          >
            <Text style={styles.selectButtonText}>Choisir un abonnement</Text>
          </TouchableOpacity>
        </View>
      )}

      <GymPickerModal
        visible={showGymPicker}
        gyms={getGymsWithSubscriptions()}
        onSelect={handleGymSelect}
        onClose={() => setShowGymPicker(false)}
      />

      <SubscriptionPickerModal
        visible={showSubscriptionPicker}
        subscriptions={getAvailableSubscriptions()}
        onSelect={handleSubscriptionSelect}
        onClose={() => setShowSubscriptionPicker(false)}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  currentSelection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  selectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  value: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  changeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    backgroundColor: '#dc3545',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  noSelection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noSelectionText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 15,
  },
  selectButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});