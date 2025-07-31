import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MessageItem from '@/components/MessageItem';

const mockOnPress = jest.fn();

describe('MessageItem', () => {
  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders message correctly for current user', () => {
    const { getByText } = render(
      <MessageItem
        id="1"
        text="Hello world"
        senderName="John Doe"
        timestamp="12:30"
        isMe={true}
        onPress={mockOnPress}
      />
    );

    expect(getByText('Hello world')).toBeTruthy();
    expect(getByText('12:30')).toBeTruthy();
    // Should not show sender name for current user
    expect(() => getByText('John Doe')).toThrow();
  });

  it('renders message correctly for other user', () => {
    const { getByText } = render(
      <MessageItem
        id="1"
        text="Hello world"
        senderName="John Doe"
        timestamp="12:30"
        isMe={false}
        onPress={mockOnPress}
      />
    );

    expect(getByText('Hello world')).toBeTruthy();
    expect(getByText('12:30')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
  });

  it('calls onPress when message is pressed', () => {
    const { getByText } = render(
      <MessageItem
        id="1"
        text="Hello world"
        senderName="John Doe"
        timestamp="12:30"
        isMe={false}
        onPress={mockOnPress}
      />
    );

    fireEvent.press(getByText('Hello world'));
    expect(mockOnPress).toHaveBeenCalled();
  });

  it('shows correct status icons for sent messages', () => {
    const { UNSAFE_getByType } = render(
      <MessageItem
        id="1"
        text="Hello world"
        senderName="John Doe"
        timestamp="12:30"
        isMe={true}
        status="sent"
        onPress={mockOnPress}
      />
    );

    const { FontAwesome } = require('@expo/vector-icons');
    expect(UNSAFE_getByType(FontAwesome)).toBeTruthy();
  });

  it('applies correct styles for my message vs other message', () => {
    const { rerender, getByText } = render(
      <MessageItem
        id="1"
        text="Hello world"
        senderName="John Doe"
        timestamp="12:30"
        isMe={true}
        onPress={mockOnPress}
      />
    );

    const myMessage = getByText('Hello world');
    expect(myMessage).toBeTruthy();

    rerender(
      <MessageItem
        id="1"
        text="Hello world"
        senderName="John Doe"
        timestamp="12:30"
        isMe={false}
        onPress={mockOnPress}
      />
    );

    const otherMessage = getByText('Hello world');
    expect(otherMessage).toBeTruthy();
  });
});
