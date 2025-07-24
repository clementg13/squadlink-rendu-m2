import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Animated,
  StatusBar,
  Platform,
  SafeAreaView
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useConversations } from '@/hooks/useMessages';
import { Conversation } from '@/types/messaging';

export default function MessagesScreen() {
  const router = useRouter();
  const { 
    conversations, 
    loading, 
    error, 
    refreshConversations, 
    isRealtimeActive 
  } = useConversations(true); // Toujours utiliser le service amélioré
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessageAnimation] = useState(new Animated.Value(0));

  // Animation pour indiquer de nouveaux messages
  useEffect(() => {
    if (conversations.length > 0) {
      Animated.sequence([
        Animated.timing(newMessageAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(newMessageAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [conversations.length, newMessageAnimation]);

  // Filtrer les conversations selon la recherche
  const filteredConversations = conversations.filter((conv: Conversation) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navigation vers une conversation
  const handleConversationPress = (groupId: number, conversationName: string) => {
    router.push(`/(protected)/conversation?groupId=${groupId}&name=${encodeURIComponent(conversationName)}` as `/(protected)/conversation?groupId=${number}&name=${string}`);
  };

  // Rendu d'une conversation
  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(item.id, item.name)}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <FontAwesome 
            name={item.isGroup ? 'users' : 'user'} 
            size={24} 
            color="#666" 
          />
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>
      </View>
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.messageTime}>{item.lastMessageTime}</Text>
        </View>
        
        <View style={styles.messagePreview}>
          <Text 
            style={[
              styles.lastMessage, 
              item.lastMessage === 'Soyez le premier à écrire' && styles.emptyMessage
            ]} 
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#fff" 
        translucent={false}
      />
      <View style={styles.container}>
      {/* Header avec barre de recherche et indicateur temps réel */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={16} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une conversation..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {/* Indicateur de connexion temps réel */}
        <View style={styles.realtimeIndicator}>
          <View style={[
            styles.realtimeDot, 
            { backgroundColor: isRealtimeActive ? '#4CAF50' : '#ff6b6b' }
          ]} />
          <Text style={[
            styles.realtimeText,
            { color: isRealtimeActive ? '#4CAF50' : '#ff6b6b' }
          ]}>
            {isRealtimeActive ? 'En ligne' : 'Hors ligne'}
          </Text>
        </View>
      </View>

      {/* Liste des conversations */}
      {error ? (
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-triangle" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshConversations}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : loading && conversations.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement des conversations...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id.toString()}
          style={styles.conversationsList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshConversations}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <FontAwesome name="comments-o" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Aucune conversation trouvée</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Essayez un autre terme de recherche' : 'Commencez une nouvelle conversation'}
              </Text>
            </View>
          )}
        />
      )}
    </View>
    </SafeAreaView>
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
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
  },
  realtimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  realtimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  realtimeText: {
    fontSize: 10,
    fontWeight: '600',
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
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  emptyMessage: {
    fontStyle: 'italic',
    color: '#999',
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginLeft: 78,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    marginTop: 16,
    textAlign: 'center',
    marginHorizontal: 20,
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
}); 