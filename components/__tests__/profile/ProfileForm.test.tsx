import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileForm from '../../profile/ProfileForm';

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
    const { getByPlaceholderText } = render(
      <ProfileForm
        formData={mockFormData}
        saving={false}
        onFieldChange={mockOnFieldChange}
      />
    );

    expect(getByPlaceholderText('Votre prénom')).toBeTruthy();
    expect(getByPlaceholderText('Votre nom')).toBeTruthy();
    expect(getByPlaceholderText('Parlez-nous de vous...')).toBeTruthy();
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
