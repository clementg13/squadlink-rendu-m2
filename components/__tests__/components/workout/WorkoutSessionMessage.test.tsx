import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WorkoutSessionMessage from '../../../workout/WorkoutSessionMessage';

const mockOnJoin = jest.fn();
const mockOnLeave = jest.fn();
const mockOnDelete = jest.fn();

const mockSession = {
  id: 1,
  id_sport: 'sport1',
  start_date: '2024-01-15T18:00:00Z',
  end_date: '2024-01-15T19:30:00Z',
  created_at: '2024-01-15T10:00:00Z',
  created_by: 'user1', // Ajout du créateur
  sport: {
    id: 'sport1',
    name: 'Football'
  },
  participants: [
    {
      id_workout_session: 1,
      id_user: 'user1',
      user: {
        firstname: 'John',
        lastname: 'Doe'
      }
    }
  ],
  participantCount: 1
};

describe('WorkoutSessionMessage', () => {
  beforeEach(() => {
    mockOnJoin.mockClear();
    mockOnLeave.mockClear();
    mockOnDelete.mockClear();
  });

  it('renders workout session correctly', () => {
    const { getByText } = render(
      <WorkoutSessionMessage
        session={mockSession}
        currentUserId="user2"
        isParticipating={false}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
      />
    );

    expect(getByText('Séance d\'entraînement')).toBeTruthy();
    expect(getByText('🏃‍♂️ Football')).toBeTruthy();
    expect(getByText('1 participant')).toBeTruthy();
    expect(getByText('Je participe !')).toBeTruthy();
  });

  it('shows correct button when user is participating', () => {
    const { getByText } = render(
      <WorkoutSessionMessage
        session={mockSession}
        currentUserId="user1"
        isParticipating={true}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
      />
    );

    expect(getByText('Ne plus participer')).toBeTruthy();
  });

  it('calls onJoin when join button is pressed', () => {
    const { getByText } = render(
      <WorkoutSessionMessage
        session={mockSession}
        currentUserId="user2"
        isParticipating={false}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
      />
    );

    fireEvent.press(getByText('Je participe !'));
    expect(mockOnJoin).toHaveBeenCalled();
  });

  it('calls onLeave when leave button is pressed', () => {
    const { getByText } = render(
      <WorkoutSessionMessage
        session={mockSession}
        currentUserId="user1"
        isParticipating={true}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
      />
    );

    fireEvent.press(getByText('Ne plus participer'));
    expect(mockOnLeave).toHaveBeenCalled();
  });

  it('formats dates correctly', () => {
    const { getByText } = render(
      <WorkoutSessionMessage
        session={mockSession}
        currentUserId="user2"
        isParticipating={false}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
      />
    );

    // Check that date and time are formatted (specific format may vary by locale)
    expect(getByText(/De \d{2}:\d{2} à \d{2}:\d{2}/)).toBeTruthy();
  });

  it('handles invalid dates gracefully', () => {
    const sessionWithInvalidDate = {
      ...mockSession,
      start_date: 'invalid-date',
      end_date: 'invalid-date'
    };

    const { getByText } = render(
      <WorkoutSessionMessage
        session={sessionWithInvalidDate}
        currentUserId="user2"
        isParticipating={false}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
      />
    );

    expect(getByText('Date invalide')).toBeTruthy();
    expect(getByText('De Heure invalide à Heure invalide')).toBeTruthy();
  });

  it('shows participants modal when info button is pressed', () => {
    const { getByText } = render(
      <WorkoutSessionMessage
        session={mockSession}
        currentUserId="user2"
        isParticipating={false}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
      />
    );

    fireEvent.press(getByText('Voir les participants'));
    expect(getByText('Participants (1)')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
  });

  it('shows current user badge in participants list', () => {
    const { getByText } = render(
      <WorkoutSessionMessage
        session={mockSession}
        currentUserId="user1"
        isParticipating={true}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
      />
    );

    fireEvent.press(getByText('Voir les participants'));
    expect(getByText('Vous')).toBeTruthy();
  });

  it('handles plural participant count correctly', () => {
    const sessionWithMultipleParticipants = {
      ...mockSession,
      participantCount: 2
    };

    const { getByText } = render(
      <WorkoutSessionMessage
        session={sessionWithMultipleParticipants}
        currentUserId="user2"
        isParticipating={false}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
      />
    );

    expect(getByText('2 participants')).toBeTruthy();
  });

  it('shows delete button when user is creator and onDelete is provided', () => {
    const { getByTestId } = render(
      <WorkoutSessionMessage
        session={mockSession}
        currentUserId="user1"
        isParticipating={false}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
        onDelete={mockOnDelete}
      />
    );

    expect(getByTestId('delete-session')).toBeTruthy();
  });

  it('does not show delete button when user is not creator', () => {
    const { queryByTestId } = render(
      <WorkoutSessionMessage
        session={mockSession}
        currentUserId="user2"
        isParticipating={false}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
        onDelete={mockOnDelete}
      />
    );

    expect(queryByTestId('delete-session')).toBeNull();
  });

  it('does not show delete button when onDelete is not provided', () => {
    const { queryByTestId } = render(
      <WorkoutSessionMessage
        session={mockSession}
        currentUserId="user1"
        isParticipating={false}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
      />
    );

    expect(queryByTestId('delete-session')).toBeNull();
  });

  it('calls onDelete when delete button is pressed', () => {
    const { getByTestId } = render(
      <WorkoutSessionMessage
        session={mockSession}
        currentUserId="user1"
        isParticipating={false}
        onJoin={mockOnJoin}
        onLeave={mockOnLeave}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.press(getByTestId('delete-session'));
    expect(mockOnDelete).toHaveBeenCalled();
  });
});
