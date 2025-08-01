import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { captureSentryException } from '@/lib/sentry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Capturer l'erreur dans Sentry
    captureSentryException(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Appeler le callback personnalisé si fourni
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Mettre à jour l'état
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReportError = () => {
    if (this.state.error) {
      Alert.alert(
        'Erreur signalée',
        'L\'erreur a été signalée à notre équipe technique. Merci de votre patience.',
        [{ text: 'OK' }]
      );
    }
  };

  render() {
    if (this.state.hasError) {
      // Utiliser le fallback personnalisé si fourni
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback par défaut avec ScrollView
      return (
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.container}>
            <View style={styles.content}>
              <Text style={styles.title}>Oups ! Quelque chose s'est mal passé</Text>
              <Text style={styles.message}>
                Une erreur inattendue s'est produite. Notre équipe a été notifiée.
              </Text>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
                  <Text style={styles.retryButtonText}>Réessayer</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.reportButton} onPress={this.handleReportError}>
                  <Text style={styles.reportButtonText}>Signaler l'erreur</Text>
                </TouchableOpacity>
              </View>

              {__DEV__ && this.state.error && (
                <View style={styles.debugContainer}>
                  <Text style={styles.debugTitle}>Détails de l'erreur (Développement):</Text>
                  <Text style={styles.debugText}>{this.state.error.toString()}</Text>
                  {this.state.errorInfo && (
                    <Text style={styles.debugText}>{this.state.errorInfo.componentStack}</Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%', // Added to ensure it takes full width within scrollContent
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#2c3e50',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#7f8c8d',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  reportButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  reportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  debugContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f1f2f6',
    borderRadius: 8,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  debugText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontFamily: 'monospace',
  },
});

// Hook pour utiliser l'Error Boundary avec Sentry
export const useSentryErrorBoundary = () => {
  const captureError = (error: Error, context?: Record<string, unknown>) => {
    captureSentryException(error, context);
  };

  return { captureError };
}; 