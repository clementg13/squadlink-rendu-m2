import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';

interface MessageItemProps {
  id: string;
  text: string;
  senderName: string;
  timestamp: string;
  isMe: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  onPress?: () => void;
}

export default function MessageItem({
  text,
  senderName,
  timestamp,
  isMe,
  status = 'sent',
  onPress,
}: MessageItemProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.messageContainer,
        isMe ? styles.myMessage : styles.otherMessage
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {!isMe && (
        <Text style={styles.senderName}>{senderName}</Text>
      )}
      
      <View style={[
        styles.messageBubble,
        isMe ? styles.myMessageBubble : styles.otherMessageBubble
      ]}>
        <Text style={[
          styles.messageText,
          isMe ? styles.myMessageText : styles.otherMessageText
        ]}>
          {text}
        </Text>
      </View>
      
      <View style={[
        styles.messageInfo,
        isMe ? styles.myMessageInfo : styles.otherMessageInfo
      ]}>
        <Text style={styles.messageTime}>{timestamp}</Text>
        {isMe && (
          <FontAwesome 
            name={
              status === 'sending' ? 'clock-o' :
              status === 'sent' ? 'check' :
              status === 'delivered' ? 'check' :
              'check'
            } 
            size={12} 
            color={status === 'read' ? '#007AFF' : '#666'}
            style={styles.statusIcon}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginLeft: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  myMessageInfo: {
    justifyContent: 'flex-end',
  },
  otherMessageInfo: {
    justifyContent: 'flex-start',
  },
  messageTime: {
    fontSize: 11,
    color: '#666',
  },
  statusIcon: {
    marginLeft: 4,
  },
});
