import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileForm from '@/components/profile/ProfileForm';

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: function MockDateTimePicker({ onChange }: any) {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');

    return (
      <TouchableOpacity
        testID="date-picker-mock"
        onPress={() => onChange({}, new Date('1995-06-15'))}
      >
        <Text>Mock DatePicker</Text>
      </TouchableOpacity>
    );
  },
}));

const mockFormData = {
  lastname: '',
  firstname: '',
  birthdate: '',
  biography: '',
};

const mockOnFieldChange = jest.fn();

describe('ProfileForm', () => {
  beforeEach(() => {
    mockOnFieldChange.mockClear();
  });

  it('renders all input fields', () => {
    const { getByPlaceholderText, getByText } = render(
      <ProfileForm
        formData={mockFormData}
        saving={false}
        onFieldChange={mockOnFieldChange}
      />
    );

    expect(getByPlaceholderText('Votre prénom')).toBeTruthy();
    expect(getByPlaceholderText('Votre nom')).toBeTruthy();
    expect(getByPlaceholderText('Parlez-nous de vous...')).toBeTruthy();
    expect(getByText('Date de naissance')).toBeTruthy();
  });

  it('shows required field indicators', () => {
    const { getByText } = render(
      <ProfileForm
        formData={mockFormData}
        saving={false}
        onFieldChange={mockOnFieldChange}
      />
    );

    expect(getByText('Prénom *')).toBeTruthy();
    expect(getByText('Nom *')).toBeTruthy();
  });

  it('calls onFieldChange when typing in firstname field', () => {
    const { getByPlaceholderText } = render(
      <ProfileForm
        formData={mockFormData}
        saving={false}
        onFieldChange={mockOnFieldChange}
      />
    );

    const firstnameInput = getByPlaceholderText('Votre prénom');
    fireEvent.changeText(firstnameInput, 'John');

    expect(mockOnFieldChange).toHaveBeenCalledWith('firstname', 'John');
  });

  it('handles date picker selection', () => {
    const { getByText, getByTestId } = render(
      <ProfileForm
        formData={mockFormData}
        saving={false}
        onFieldChange={mockOnFieldChange}
      />
    );

    // Open date picker
    fireEvent.press(getByText('Sélectionner une date'));

    // Simulate date selection
    fireEvent.press(getByTestId('date-picker-mock'));

    expect(mockOnFieldChange).toHaveBeenCalledWith('birthdate', '1995-06-15');
  });

  it('displays existing birthdate correctly', () => {
    const filledFormData = {
      ...mockFormData,
      birthdate: '1990-01-01',
    };

    const { getByText } = render(
      <ProfileForm
        formData={filledFormData}
        saving={false}
        onFieldChange={mockOnFieldChange}
      />
    );

    expect(getByText('01/01/1990')).toBeTruthy();
  });

  it('disables inputs when saving', () => {
    const { getByPlaceholderText } = render(
      <ProfileForm
        formData={mockFormData}
        saving={true}
        onFieldChange={mockOnFieldChange}
      />
    );

    const firstnameInput = getByPlaceholderText('Votre prénom');
    expect(firstnameInput.props.editable).toBe(false);
  });

  it('displays form data correctly', () => {
    const filledFormData = {
      lastname: 'Doe',
      firstname: 'John',
      birthdate: '1990-01-01',
      biography: 'Hello world',
    };

    const { getByDisplayValue } = render(
      <ProfileForm
        formData={filledFormData}
        saving={false}
        onFieldChange={mockOnFieldChange}
      />
    );

    expect(getByDisplayValue('John')).toBeTruthy();
    expect(getByDisplayValue('Doe')).toBeTruthy();
    expect(getByDisplayValue('Hello world')).toBeTruthy();
  });
});
