import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GroupMembersModal from '@/components/group/GroupMembersModal';

const mockMembers = [
  {
    id_user: 'user1',
    user: {
      firstname: 'John',
      lastname: 'Doe'
    }
  },
  {
    id_user: 'user2',
    user: {
      firstname: 'Jane',
      lastname: 'Smith'
    }
  }
];

const mockOnClose = jest.fn();

describe('GroupMembersModal', () => {
  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders modal with members correctly', () => {
    const { getByText } = render(
      <GroupMembersModal
        visible={true}
        members={mockMembers}
        onClose={mockOnClose}
        groupName="Test Group"
      />
    );

    expect(getByText('Membres du groupe - Test Group')).toBeTruthy();
    expect(getByText('2 membres')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Jane Smith')).toBeTruthy();
  });

  it('renders modal without group name', () => {
    const { getByText } = render(
      <GroupMembersModal
        visible={true}
        members={mockMembers}
        onClose={mockOnClose}
      />
    );

    expect(getByText('Membres du groupe')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const { UNSAFE_getByType } = render(
      <GroupMembersModal
        visible={true}
        members={mockMembers}
        onClose={mockOnClose}
      />
    );

    // Find close button by FontAwesome icon
    const { TouchableOpacity } = require('react-native');
    const touchableElements = UNSAFE_getByType(TouchableOpacity);
    
    fireEvent.press(touchableElements);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows empty state when no members', () => {
    const { getByText } = render(
      <GroupMembersModal
        visible={true}
        members={[]}
        onClose={mockOnClose}
      />
    );

    expect(getByText('0 membres')).toBeTruthy(); // Correction: 0 prend toujours le pluriel
    expect(getByText('Aucun membre trouvé')).toBeTruthy();
    expect(getByText('Vérifiez votre connexion et réessayez')).toBeTruthy();
  });

  it('handles singular/plural member count correctly', () => {
    const singleMember = [mockMembers[0]];
    
    const { getByText, rerender } = render(
      <GroupMembersModal
        visible={true}
        members={singleMember}
        onClose={mockOnClose}
      />
    );

    expect(getByText('1 membre')).toBeTruthy();

    rerender(
      <GroupMembersModal
        visible={true}
        members={mockMembers}
        onClose={mockOnClose}
      />
    );

    expect(getByText('2 membres')).toBeTruthy();
  });

  it('renders member avatars correctly', () => {
    const { UNSAFE_getAllByType } = render(
      <GroupMembersModal
        visible={true}
        members={mockMembers}
        onClose={mockOnClose}
      />
    );

    const { FontAwesome } = require('@expo/vector-icons');
    const fontAwesomeElements = UNSAFE_getAllByType(FontAwesome);
    
    // Should have user icons for each member plus close icon and users count icon
    expect(fontAwesomeElements.length).toBeGreaterThanOrEqual(mockMembers.length);
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(
      <GroupMembersModal
        visible={false}
        members={mockMembers}
        onClose={mockOnClose}
      />
    );

    expect(queryByText('Membres du groupe')).toBeNull();
  });
});
