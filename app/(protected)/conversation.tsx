import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useConversation } from '@/hooks/useMessages';
import { useProfile } from '@/stores/profileStore';
import { useAuth } from '@/stores/authStore';
import { workoutService } from '@/services/workoutService';
import { Message } from '@/types/messaging';
import { WorkoutSession, CreateWorkoutSessionData } from '@/types/workout';
import CreateWorkoutModal from '@/components/workout/CreateWorkoutModal';
import WorkoutSessionMessage from '@/components/workout/WorkoutSessionMessage';
import { groupService, GroupMember } from '@/services/groupService';
import GroupMembersModal from '@/components/group/GroupMembersModal';

// Composant pour un message individuel
const MessageItem = ({ message }: { message: Message }) => (
  <View style={[
    styles.messageContainer,
    message.isMe ? styles.myMessage : styles.otherMessage
  ]}>
    <View style={[
      styles.messageBubble,
      message.isMe ? styles.myBubble : styles.otherBubble
    ]}>
      {!message.isMe && (
        <Text style={styles.senderName}>{message.senderName}</Text>
      )}
      <Text style={[
        styles.messageText,
        message.isMe ? styles.myMessageText : styles.otherMessageText
      ]}>
        {message.text}
      </Text>
      <Text style={[
        styles.messageTime,
        message.isMe ? styles.myMessageTime : styles.otherMessageTime
      ]}>
        {message.timestamp}
      </Text>
    </View>
  </View>
);

export default function ConversationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const groupId = parseInt(params.groupId as string);
  const conversationName = params.name as string;
  
  const { user } = useAuth();
  const { sports } = useProfile();
  const { messages, loading, error, sending, sendMessage, refreshMessages } = useConversation(groupId);
  
  const [inputText, setInputText] = useState('');
  const [showCreateWorkout, setShowCreateWorkout] = useState(false);
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [workoutSessions, setWorkoutSessions] = useState<{[key: number]: WorkoutSession}>({});
  const [userParticipations, setUserParticipations] = useState<{[key: number]: boolean}>({});
  
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (messages.length > 0) {
      // Délai plus long pour s'assurer que le rendu est terminé
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Envoyer un message
  const handleSendMessage = async () => {
    if (!inputText.trim() || sending) return;

    const messageText = inputText.trim();
    setInputText('');

    try {
      await sendMessage(messageText);
      // Scroll vers le bas après l'envoi
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch {
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
      setInputText(messageText); // Restaurer le texte en cas d'erreur
    }
  };

  const handleCreateWorkoutSession = async (data: CreateWorkoutSessionData) => {
    try {
      const session = await workoutService.createWorkoutSession({
        ...data,
        groupId,
        created_by: user?.id || '', // Ajout du créateur
      });
      
      // Ajouter le créateur comme participant automatiquement
      if (user?.id) {
        await workoutService.joinWorkoutSession(session.id, user.id);
      }
      
      // Rafraîchir les données de la session créée
      await refreshWorkoutSession(session.id);
      
      // Supprimer l'envoi du message de notification
      // await sendMessage(`🏋️‍♂️ Nouvelle séance créée !`);
      
      Alert.alert('Succès', 'Séance créée avec succès !');
    } catch (error) {
      console.error('Error creating workout session:', error);
      throw error;
    }
  };

  const refreshWorkoutSession = async (sessionId: number) => {
    try {
      const session = await workoutService.getWorkoutSessionWithParticipants(sessionId);
      setWorkoutSessions(prev => ({ ...prev, [sessionId]: session }));
      
      if (user?.id) {
        const isParticipating = await workoutService.isUserParticipating(sessionId, user.id);
        setUserParticipations(prev => ({ ...prev, [sessionId]: isParticipating }));
      }
    } catch (error) {
      console.error('Error refreshing workout session:', error);
    }
  };

  // Charger les séances existantes au démarrage
  useEffect(() => {
    const loadExistingWorkoutSessions = async () => {
      try {
        console.log('🔍 Chargement des séances existantes pour le groupe:', groupId);
        const sessions = await workoutService.getGroupWorkoutSessions(groupId);
        
        console.log('📋 Séances trouvées:', sessions.length);
        
        // Traiter les séances récupérées
        for (const session of sessions) {
          setWorkoutSessions(prev => ({ ...prev, [session.id]: session }));
          
          if (user?.id) {
            const isParticipating = await workoutService.isUserParticipating(session.id, user.id);
            setUserParticipations(prev => ({ ...prev, [session.id]: isParticipating }));
          }
        }
      } catch (error) {
        console.error('Error loading existing workout sessions:', error);
      }
    };
    
    if (groupId && user?.id) {
      loadExistingWorkoutSessions();
    }
  }, [groupId, user?.id]);

  const handleJoinSession = async (sessionId: number) => {
    if (!user?.id) return;
    
    try {
      await workoutService.joinWorkoutSession(sessionId, user.id);
      await refreshWorkoutSession(sessionId);
      Alert.alert('Succès', 'Vous participez maintenant à cette séance !');
    } catch {
      Alert.alert('Erreur', 'Impossible de rejoindre la séance');
    }
  };

  const handleLeaveSession = async (sessionId: number) => {
    if (!user?.id) return;
    
    Alert.alert(
      'Annuler participation',
      'Êtes-vous sûr de vouloir annuler votre participation ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          style: 'destructive',
          onPress: async () => {
            try {
              await workoutService.leaveWorkoutSession(sessionId, user.id);
              await refreshWorkoutSession(sessionId);
              Alert.alert('Succès', 'Participation annulée');
            } catch {
              Alert.alert('Erreur', 'Impossible d\'annuler la participation');
            }
          }
        }
      ]
    );
  };

  // Charger les membres du groupe
  const loadGroupMembers = async () => {
    console.log('🔍 ConversationScreen: Loading group members for group:', groupId);
    console.log('🔍 ConversationScreen: Group ID type:', typeof groupId, 'isNaN:', isNaN(groupId));
    
    if (!groupId || isNaN(groupId)) {
      console.error('❌ ConversationScreen: Invalid group ID:', groupId);
      Alert.alert('Erreur', 'ID de groupe invalide');
      return;
    }
    
    // Si les membres sont déjà chargés, ne pas recharger
    if (groupMembers.length > 0) {
      return;
    }
    
    setLoadingMembers(true);
    try {
      const members = await groupService.getGroupMembers(groupId);
      setGroupMembers(members);
      
      if (members.length === 0) {
        console.warn('⚠️ ConversationScreen: No members found');
      }
    } catch (error) {
      console.error('❌ ConversationScreen: Error loading group members:', error);
      Alert.alert('Erreur', 'Impossible de charger les membres du groupe');
    } finally {
      setLoadingMembers(false);
    }
  };

  // Optimiser le chargement des membres - charger dès l'ouverture de la conversation
  useEffect(() => {
    const loadInitialGroupMembers = async () => {
      if (groupId && !loadingMembers && groupMembers.length === 0) {
        console.log('🔍 ConversationScreen: Loading initial group members');
        setLoadingMembers(true);
        try {
          const members = await groupService.getGroupMembers(groupId);
          setGroupMembers(members);
        } catch (error) {
          console.error('❌ ConversationScreen: Error loading initial group members:', error);
        } finally {
          setLoadingMembers(false);
        }
      }
    };

    loadInitialGroupMembers();
  }, [groupId, groupMembers.length, loadingMembers]); // Charger dès que groupId est disponible

  const handleShowGroupInfo = async () => {
    // Si les membres ne sont pas encore chargés, les charger
    if (groupMembers.length === 0 && !loadingMembers) {
      await loadGroupMembers();
    }
    setShowGroupMembers(true);
  };

  const handleDeleteSession = async (sessionId: number) => {
    Alert.alert(
      'Supprimer la séance',
      'Voulez-vous vraiment supprimer cette séance ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await workoutService.deleteWorkoutSession(sessionId, user?.id || '');
              
              // Supprimer la séance de l'état local
              setWorkoutSessions(prev => {
                const updated = { ...prev };
                delete updated[sessionId];
                return updated;
              });
              
              Alert.alert('Séance supprimée');
            } catch (error) {
              const errorMessage = (error instanceof Error && error.message) ? error.message : 'Impossible de supprimer la séance';
              Alert.alert('Erreur', errorMessage);
            }
          }
        }
      ]
    );
  };

  // Rendu d'un message (incluant les séances)
  const renderMessage = ({ item }: { item: Message | WorkoutSession }) => {
    // Si c'est une séance d'entraînement
    if ('start_date' in item) {
      const session = item as WorkoutSession;
      return (
        <WorkoutSessionMessage
          session={session}
          currentUserId={user?.id || ''}
          isParticipating={userParticipations[session.id] || false}
          onJoin={() => handleJoinSession(session.id)}
          onLeave={() => handleLeaveSession(session.id)}
          onDelete={() => handleDeleteSession(session.id)} // Ajout
        />
      );
    }
    
    // Sinon c'est un message normal
    return <MessageItem message={item as Message} />;
  };

  // Combine messages and workout sessions for display
  const combinedData = [
    ...messages,
    ...Object.values(workoutSessions)
  ].sort((a, b) => {
    try {
      // Utiliser created_at pour les séances et timestamp pour les messages
      let aTime: string;
      let bTime: string;
      
      if ('start_date' in a) {
        // C'est une séance d'entraînement
        aTime = a.created_at || a.start_date;
        // Validation supplémentaire pour les séances
        if (!aTime || aTime === 'Invalid Date' || aTime === '') {
          console.warn('⚠️ Séance avec date invalide:', a);
          return 1; // Mettre les éléments invalides à la fin
        }
      } else {
        // C'est un message - gérer les différents formats de timestamp
        try {
          if (!a.timestamp || a.timestamp === '') {
            console.warn('⚠️ Message avec timestamp invalide:', a);
            return 1;
          }
          
          // Si le timestamp est au format dd/MM HH:MM
          if (/^\d{2}\/\d{2}\s\d{2}:\d{2}$/.test(a.timestamp)) {
            const [datePart, timePart] = a.timestamp.split(' ');
            const [day, month] = datePart.split('/');
            const [hours, minutes] = timePart.split(':');
            const currentYear = new Date().getFullYear();
            const messageDate = new Date(currentYear, parseInt(month, 10) - 1, parseInt(day, 10), parseInt(hours, 10), parseInt(minutes, 10));
            aTime = messageDate.toISOString();
          }
          // Si le timestamp est au format HH:MM, utiliser la date d'aujourd'hui
          else if (/^\d{2}:\d{2}$/.test(a.timestamp)) {
            const today = new Date();
            const [hours, minutes] = a.timestamp.split(':');
            today.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
            aTime = today.toISOString();
          } else {
            // Essayer de parser comme une date normale
            aTime = new Date(a.timestamp).toISOString();
          }
        } catch {
          console.warn('⚠️ Erreur conversion timestamp message:', a.timestamp);
          return 1;
        }
      }
      
      if ('start_date' in b) {
        // C'est une séance d'entraînement
        bTime = b.created_at || b.start_date;
        if (!bTime || bTime === 'Invalid Date' || bTime === '') {
          console.warn('⚠️ Séance avec date invalide:', b);
          return -1;
        }
      } else {
        // C'est un message - gérer les différents formats de timestamp
        try {
          if (!b.timestamp || b.timestamp === '') {
            console.warn('⚠️ Message avec timestamp invalide:', b);
            return -1;
          }
          
          // Si le timestamp est au format dd/MM HH:MM
          if (/^\d{2}\/\d{2}\s\d{2}:\d{2}$/.test(b.timestamp)) {
            const [datePart, timePart] = b.timestamp.split(' ');
            const [day, month] = datePart.split('/');
            const [hours, minutes] = timePart.split(':');
            const currentYear = new Date().getFullYear();
            const messageDate = new Date(currentYear, parseInt(month, 10) - 1, parseInt(day, 10), parseInt(hours, 10), parseInt(minutes, 10));
            bTime = messageDate.toISOString();
          }
          // Si le timestamp est au format HH:MM, utiliser la date d'aujourd'hui
          else if (/^\d{2}:\d{2}$/.test(b.timestamp)) {
            const today = new Date();
            const [hours, minutes] = b.timestamp.split(':');
            today.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
            bTime = today.toISOString();
          } else {
            // Essayer de parser comme une date normale
            bTime = new Date(b.timestamp).toISOString();
          }
        } catch {
          console.warn('⚠️ Erreur conversion timestamp message:', b.timestamp);
          return -1;
        }
      }
      
      // Validation des dates avant création d'objets Date
      const dateA = new Date(aTime);
      const dateB = new Date(bTime);
      
      // Vérifier que les dates sont valides ET dans une plage raisonnable
      const minDate = new Date('1970-01-01').getTime();
      const maxDate = new Date('2100-01-01').getTime();
      
      const timeA = dateA.getTime();
      const timeB = dateB.getTime();
      
      if (isNaN(timeA) || timeA < minDate || timeA > maxDate) {
        console.warn('⚠️ Date A hors limites:', { aTime, timeA });
        return 1;
      }
      
      if (isNaN(timeB) || timeB < minDate || timeB > maxDate) {
        console.warn('⚠️ Date B hors limites:', { bTime, timeB });
        return -1;
      }
      
      return timeA - timeB;
    } catch (error) {
      console.error('❌ Erreur lors du tri des données combinées:', error);
      console.error('❌ Données problématiques:', { a, b });
      return 0; // En cas d'erreur, ne pas changer l'ordre
    }
  });

  return (
    <>
      {/* Gestion de la status bar selon la plateforme */}
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#fff" 
        translucent={false}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FontAwesome name="arrow-left" size={20} color="#007AFF" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.conversationTitle}>{conversationName || `Groupe ${groupId}`}</Text>
            <Text style={styles.conversationSubtitle}>
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={handleShowGroupInfo}
            disabled={loadingMembers}
          >
            {loadingMembers ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <FontAwesome name="info-circle" size={20} color="#007AFF" />
            )}
          </TouchableOpacity>
        </View>

      {/* Messages */}
      {error ? (
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-triangle" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshMessages}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement des messages...</Text>
        </View>
      ) : (
        <View style={styles.messagesContainer}>
          <FlatList
            ref={flatListRef}
            data={combinedData}
            renderItem={renderMessage}
            keyExtractor={(item) => {
              if ('start_date' in item) {
                return `workout-${item.id}`;
              }
              return `message-${item.id}`;
            }}
            style={styles.messagesList}
            contentContainerStyle={[
              styles.messagesContent,
              combinedData.length === 0 && styles.emptyMessagesContent
            ]}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              if (combinedData.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: false });
              }
            }}
            onLayout={() => {
              if (combinedData.length > 0) {
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: false });
                }, 100);
              }
            }}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <FontAwesome name="comments-o" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Aucun message</Text>
                <Text style={styles.emptySubtext}>Commencez la conversation !</Text>
              </View>
            )}
          />

          {/* Bouton flottant pour créer une séance */}
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => setShowCreateWorkout(true)}
          >
            <FontAwesome name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Zone de saisie */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Tapez votre message..."
            placeholderTextColor="#666"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || sending) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <FontAwesome name="send" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de création de séance */}
      <CreateWorkoutModal
        visible={showCreateWorkout}
        sports={sports}
        onClose={() => setShowCreateWorkout(false)}
        onCreateSession={handleCreateWorkoutSession}
      />

      {/* Modal des membres du groupe */}
      <GroupMembersModal
        visible={showGroupMembers}
        members={groupMembers}
        groupName={conversationName}
        onClose={() => setShowGroupMembers(false)}
      />
    </KeyboardAvoidingView>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    // Padding pour Android pour éviter la collision avec la status bar
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  conversationSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  infoButton: {
    padding: 8,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
    position: 'relative',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
    flexGrow: 1,
  },
  emptyMessagesContent: {
    flex: 1,
    justifyContent: 'center',
  },
  messageContainer: {
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 6,
  },
  otherBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});