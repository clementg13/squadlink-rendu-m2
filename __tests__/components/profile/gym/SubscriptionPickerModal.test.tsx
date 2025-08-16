import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SubscriptionPickerModal from '@/components/profile/gym/SubscriptionPickerModal';
import { GymSubscription } from '@/types/profile';

// Mock du Modal React Native
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  RN.Modal = ({ visible, children, onRequestClose }: any) => {
    if (!visible) return null;
    return (
      <RN.View testID="modal-container" onPress={onRequestClose}>
        {children}
      </RN.View>
    );
  };
  
  return RN;
});

describe('SubscriptionPickerModal', () => {
  const mockSubscriptions: GymSubscription[] = [
    { id: '1', name: 'Premium', id_gym: '1' },
    { id: '2', name: 'Basic', id_gym: '1' },
    { id: '3', name: 'Student', id_gym: '1' }
  ];

  const defaultProps = {
    visible: true,
    subscriptions: mockSubscriptions,
    onSelect: jest.fn(),
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal title', () => {
      const { getByText } = render(<SubscriptionPickerModal {...defaultProps} />);
      
      expect(getByText('Sélectionnez un abonnement')).toBeTruthy();
    });

    it('should render all subscriptions', () => {
      const { getByText } = render(<SubscriptionPickerModal {...defaultProps} />);
      
      expect(getByText('Premium')).toBeTruthy();
      expect(getByText('Basic')).toBeTruthy();
      expect(getByText('Student')).toBeTruthy();
    });

    it('should render cancel button', () => {
      const { getByText } = render(<SubscriptionPickerModal {...defaultProps} />);
      
      expect(getByText('Annuler')).toBeTruthy();
    });

    it('should not render when not visible', () => {
      const { queryByText } = render(
        <SubscriptionPickerModal {...defaultProps} visible={false} />
      );
      
      expect(queryByText('Sélectionnez un abonnement')).toBeNull();
    });
  });

  describe('Interactions', () => {
    it('should call onSelect when subscription is selected', () => {
      const mockOnSelect = jest.fn();
      const { getByText } = render(
        <SubscriptionPickerModal {...defaultProps} onSelect={mockOnSelect} />
      );
      
      fireEvent.press(getByText('Premium'));
      
      expect(mockOnSelect).toHaveBeenCalledWith('1');
    });

    it('should call onClose when cancel button is pressed', () => {
      const mockOnClose = jest.fn();
      const { getByText } = render(
        <SubscriptionPickerModal {...defaultProps} onClose={mockOnClose} />
      );
      
      fireEvent.press(getByText('Annuler'));
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no subscriptions available', () => {
      const { getByText } = render(
        <SubscriptionPickerModal {...defaultProps} subscriptions={[]} />
      );
      
      expect(getByText('Aucun abonnement disponible pour cette salle')).toBeTruthy();
    });

    it('should not render subscription list when empty', () => {
      const { queryByText } = render(
        <SubscriptionPickerModal {...defaultProps} subscriptions={[]} />
      );
      
      expect(queryByText('Premium')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle subscription with undefined id', () => {
      const subscriptionsWithUndefined = [
        { id: undefined as any, name: 'Invalid Sub', id_gym: '1' },
        ...mockSubscriptions
      ];
      
      const { getByText } = render(
        <SubscriptionPickerModal {...defaultProps} subscriptions={subscriptionsWithUndefined} />
      );
      
      expect(getByText('Invalid Sub')).toBeTruthy();
      expect(getByText('Premium')).toBeTruthy();
    });

    it('should handle subscription with empty name', () => {
      const subscriptionsWithEmptyName = [
        { id: '99', name: '', id_gym: '1' },
        ...mockSubscriptions
      ];
      
      const { getByText } = render(
        <SubscriptionPickerModal {...defaultProps} subscriptions={subscriptionsWithEmptyName} />
      );
      
      expect(getByText('Premium')).toBeTruthy();
    });
  });

  describe('Modal Behavior', () => {
    it('should handle rapid selection', () => {
      const mockOnSelect = jest.fn();
      const { getByText } = render(
        <SubscriptionPickerModal {...defaultProps} onSelect={mockOnSelect} />
      );
      
      // Sélections rapides
      fireEvent.press(getByText('Premium'));
      fireEvent.press(getByText('Basic'));
      
      expect(mockOnSelect).toHaveBeenCalledTimes(2);
      expect(mockOnSelect).toHaveBeenNthCalledWith(1, '1');
      expect(mockOnSelect).toHaveBeenNthCalledWith(2, '2');
    });
  });
});