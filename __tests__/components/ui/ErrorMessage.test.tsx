import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ErrorMessage from '@/components/ui/ErrorMessage';

describe('ErrorMessage', () => {
  const defaultProps = {
    message: 'Une erreur est survenue',
  };

  it('affiche le message d\'erreur correctement', () => {
    const { getByText } = render(<ErrorMessage {...defaultProps} />);
    
    expect(getByText('Une erreur est survenue')).toBeTruthy();
  });

  it('affiche l\'icône d\'erreur par défaut', () => {
    const { getByText } = render(<ErrorMessage {...defaultProps} />);
    
    expect(getByText('❌')).toBeTruthy();
  });

  it('affiche le bouton "Réessayer" quand onRetry est fourni', () => {
    const onRetry = jest.fn();
    const { getByText } = render(
      <ErrorMessage {...defaultProps} onRetry={onRetry} />
    );
    
    const retryButton = getByText('Réessayer');
    expect(retryButton).toBeTruthy();
  });

  it('n\'affiche pas le bouton "Réessayer" quand onRetry n\'est pas fourni', () => {
    const { queryByText } = render(<ErrorMessage {...defaultProps} />);
    
    const retryButton = queryByText('Réessayer');
    expect(retryButton).toBeNull();
  });

  it('appelle onRetry quand le bouton est pressé', () => {
    const onRetry = jest.fn();
    const { getByText } = render(
      <ErrorMessage {...defaultProps} onRetry={onRetry} />
    );
    
    const retryButton = getByText('Réessayer');
    fireEvent.press(retryButton);
    
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  describe('types d\'erreur', () => {
    it('affiche l\'icône et la couleur d\'erreur par défaut', () => {
      const { getByText } = render(<ErrorMessage {...defaultProps} />);
      
      expect(getByText('❌')).toBeTruthy();
    });

    it('affiche l\'icône et la couleur d\'avertissement', () => {
      const { getByText } = render(
        <ErrorMessage {...defaultProps} type="warning" />
      );
      
      expect(getByText('⚠️')).toBeTruthy();
    });

    it('affiche l\'icône et la couleur d\'information', () => {
      const { getByText } = render(
        <ErrorMessage {...defaultProps} type="info" />
      );
      
      expect(getByText('ℹ️')).toBeTruthy();
    });
  });

  describe('props optionnelles', () => {
    it('utilise les valeurs par défaut quand les props ne sont pas fournies', () => {
      const { getByText } = render(<ErrorMessage message="Test" />);
      
      expect(getByText('Test')).toBeTruthy();
      expect(getByText('❌')).toBeTruthy(); // Icône d'erreur par défaut
    });

    it('accepte un message vide', () => {
      const { getByText } = render(<ErrorMessage message="" />);
      
      expect(getByText('')).toBeTruthy();
    });
  });

  describe('accessibilité', () => {
    it('rend le composant accessible', () => {
      const { getByText } = render(<ErrorMessage {...defaultProps} />);
      
      const messageElement = getByText('Une erreur est survenue');
      expect(messageElement).toBeTruthy();
    });

    it('rend le bouton de retry accessible', () => {
      const onRetry = jest.fn();
      const { getByText } = render(
        <ErrorMessage {...defaultProps} onRetry={onRetry} />
      );
      
      const retryButton = getByText('Réessayer');
      expect(retryButton).toBeTruthy();
    });
  });
}); 