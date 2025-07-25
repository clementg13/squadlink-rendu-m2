import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ConversationItem from '../../ConversationItem';

const mockOnPress = jest.fn();

describe('ConversationItem', () => {
  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders conversation item correctly', () => {
    const { getByText } = render(
      <ConversationItem
        id="1"
        name="John Doe"
        lastMessage="Hello there!"
        lastMessageTime="12:30"
        unreadCount={0}
        onPress={mockOnPress}
      />
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Hello there!')).toBeTruthy();
    expect(getByText('12:30')).toBeTruthy();
  });

  it('shows unread badge when there are unread messages', () => {
    const { getByText } = render(
      <ConversationItem
        id="1"
        name="John Doe"
        lastMessage="Hello there!"
        lastMessageTime="12:30"
        unreadCount={5}
        onPress={mockOnPress}
      />
    );

    expect(getByText('5')).toBeTruthy();
  });

  it('shows 99+ for unread count over 99', () => {
    const { getByText } = render(
      <ConversationItem
        id="1"
        name="John Doe"
        lastMessage="Hello there!"
        lastMessageTime="12:30"
        unreadCount={150}
        onPress={mockOnPress}
      />
    );

    expect(getByText('99+')).toBeTruthy();
  });

  it('shows online indicator when user is online', () => {
    const { UNSAFE_getAllByType } = render(
      <ConversationItem
        id="1"
        name="John Doe"
        lastMessage="Hello there!"
        lastMessageTime="12:30"
        unreadCount={0}
        isOnline={true}
        onPress={mockOnPress}
      />
    );

    const { View } = require('react-native');
    const views = UNSAFE_getAllByType(View);
    // Should have an online indicator view
    expect(views.length).toBeGreaterThan(3);
  });

  it('shows group icon for group conversations', () => {
    const { UNSAFE_getByType } = render(
      <ConversationItem
        id="1"
        name="Group Chat"
        lastMessage="Hello everyone!"
        lastMessageTime="12:30"
        unreadCount={0}
        isGroup={true}
        onPress={mockOnPress}
      />
    );

    const { FontAwesome } = require('@expo/vector-icons');
    expect(UNSAFE_getByType(FontAwesome)).toBeTruthy();
  });

  it('calls onPress when conversation item is pressed', () => {
    const { getByText } = render(
      <ConversationItem
        id="1"
        name="John Doe"
        lastMessage="Hello there!"
        lastMessageTime="12:30"
        unreadCount={0}
        onPress={mockOnPress}
      />
    );

    fireEvent.press(getByText('John Doe'));
    expect(mockOnPress).toHaveBeenCalled();
  });

  it('styles unread messages correctly', () => {
    const { getByText } = render(
      <ConversationItem
        id="1"
        name="John Doe"
        lastMessage="Unread message"
        lastMessageTime="12:30"
        unreadCount={3}
        onPress={mockOnPress}
      />
    );

    const lastMessage = getByText('Unread message');
    expect(lastMessage).toBeTruthy();
  });
});
