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
import { Message } from '@/types/messaging';

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
  
  const { messages, loading, error, sending, sendMessage, refreshMessages } = useConversation(groupId);
  const [inputText, setInputText] = useState('');
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
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
      setInputText(messageText); // Restaurer le texte en cas d'erreur
    }
  };

  // Rendu d'un message
  const renderMessage = ({ item }: { item: Message }) => (
    <MessageItem message={item} />
  );

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
          
          <TouchableOpacity style={styles.infoButton}>
            <FontAwesome name="info-circle" size={20} color="#007AFF" />
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
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          style={styles.messagesList}
          contentContainerStyle={[
            styles.messagesContent,
            messages.length === 0 && styles.emptyMessagesContent
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            // Auto-scroll après le redimensionnement du contenu
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
          onLayout={() => {
            // Auto-scroll lors du premier rendu
            if (messages.length > 0) {
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
});
