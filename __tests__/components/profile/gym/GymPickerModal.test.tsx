import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GymPickerModal from '@/components/profile/gym/GymPickerModal';
import { Gym } from '@/types/profile';

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

describe('GymPickerModal', () => {
  const mockGyms: Gym[] = [
    { id: '1', name: 'Fitness Club Paris' },
    { id: '2', name: 'Gym Lyon' },
    { id: '3', name: 'Sport Center' },
  ];

  const defaultProps = {
    visible: true,
    gyms: mockGyms,
    onSelect: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal title', () => {
      const { getByText } = render(<GymPickerModal {...defaultProps} />);

      expect(getByText('Sélectionnez une salle de sport')).toBeTruthy();
    });

    it('should render all gyms', () => {
      const { getByText } = render(<GymPickerModal {...defaultProps} />);

      expect(getByText('Fitness Club Paris')).toBeTruthy();
      expect(getByText('Gym Lyon')).toBeTruthy();
      expect(getByText('Sport Center')).toBeTruthy();
    });

    it('should render cancel button', () => {
      const { getByText } = render(<GymPickerModal {...defaultProps} />);

      expect(getByText('Annuler')).toBeTruthy();
    });

    it('should not render when not visible', () => {
      const { queryByText } = render(
        <GymPickerModal {...defaultProps} visible={false} />
      );

      expect(queryByText('Sélectionnez une salle de sport')).toBeNull();
    });
  });

  describe('Interactions', () => {
    it('should call onSelect when gym is selected', () => {
      const mockOnSelect = jest.fn();
      const { getByText } = render(
        <GymPickerModal {...defaultProps} onSelect={mockOnSelect} />
      );

      fireEvent.press(getByText('Fitness Club Paris'));

      expect(mockOnSelect).toHaveBeenCalledWith('1');
    });

    it('should call onClose when cancel button is pressed', () => {
      const mockOnClose = jest.fn();
      const { getByText } = render(
        <GymPickerModal {...defaultProps} onClose={mockOnClose} />
      );

      fireEvent.press(getByText('Annuler'));

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no gyms available', () => {
      const { getByText } = render(
        <GymPickerModal {...defaultProps} gyms={[]} />
      );

      expect(getByText('Aucune salle de sport disponible')).toBeTruthy();
    });

    it('should not render gym list when empty', () => {
      const { queryByText } = render(
        <GymPickerModal {...defaultProps} gyms={[]} />
      );

      expect(queryByText('Fitness Club Paris')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle gym with undefined id', () => {
      const gymsWithUndefined = [
        { id: undefined as any, name: 'Invalid Gym' },
        ...mockGyms,
      ];

      const { getByText } = render(
        <GymPickerModal {...defaultProps} gyms={gymsWithUndefined} />
      );

      expect(getByText('Invalid Gym')).toBeTruthy();
      expect(getByText('Fitness Club Paris')).toBeTruthy();
    });

    it('should handle gym with empty name', () => {
      const gymsWithEmptyName = [
        { id: '99', name: '' },
        ...mockGyms,
      ];

      const { getByText } = render(
        <GymPickerModal {...defaultProps} gyms={gymsWithEmptyName} />
      );

      expect(getByText('Fitness Club Paris')).toBeTruthy();
    });
  });
});