# Intégration Sentry - SquadLink

## Vue d'ensemble

Cette documentation décrit l'intégration complète de Sentry dans l'application SquadLink pour le monitoring des erreurs, des performances et des métriques utilisateur.

## Architecture

### Composants principaux

1. **Configuration Sentry** (`lib/sentry.ts`)
   - Initialisation de Sentry avec configuration optimisée
   - Gestion des environnements (dev, staging, production)
   - Intégration de la navigation React Navigation
   - Fonctions utilitaires pour l'utilisation de Sentry

2. **Error Boundary** (`components/ErrorBoundary.tsx`)
   - Gestion des erreurs React avec interface utilisateur
   - Intégration automatique avec Sentry
   - Fallback UI pour les erreurs non gérées

3. **Monitoring réseau** (`hooks/useSentryNetworkMonitoring.ts`)
   - Suivi automatique des requêtes HTTP
   - Monitoring des performances réseau
   - Capture des erreurs réseau

4. **Service de métriques** (`services/sentryMetricsService.ts`)
   - Métriques utilisateur (actions, session, erreurs)
   - Métriques d'application (vues, appels API, crashes)
   - Métriques de performance (temps de chargement, réponse API)

5. **Hook de métriques** (`hooks/useSentryMetrics.ts`)
   - Interface simplifiée pour utiliser les métriques
   - Hooks spécialisés pour le suivi automatique
   - Gestion des compteurs de session

## Configuration

### Variables d'environnement

```bash
# Sentry DSN (obligatoire)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Environnement (optionnel, défaut: development)
NODE_ENV=development|staging|production

# Debug (optionnel, défaut: false)
DEBUG=true|false
```

### Configuration Metro

Le fichier `metro.config.js` est configuré pour :
- Générer des source maps pour le debugging
- Exclure les fichiers de test
- Optimiser la compilation pour Sentry

## Utilisation

### 1. Error Boundary

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### 2. Monitoring des métriques

```tsx
import { useSentryMetrics } from '@/hooks/useSentryMetrics';

function MyComponent() {
  const { 
    trackUserAction, 
    trackScreenView, 
    useScreenTracking 
  } = useSentryMetrics();

  // Suivi automatique de l'écran
  useScreenTracking('MyScreen');

  const handleButtonPress = () => {
    trackUserAction('button_pressed', { buttonId: 'submit' });
  };

  return (
    <Button onPress={handleButtonPress}>
      Submit
    </Button>
  );
}
```

### 3. Monitoring des performances

```tsx
import { useSentryPerformance } from '@/lib/sentry';

function MyComponent() {
  const { measurePerformance } = useSentryPerformance();

  const handleAsyncOperation = async () => {
    const result = await measurePerformance(
      'api_call',
      () => fetch('/api/data')
    );
    return result;
  };
}
```

### 4. Monitoring réseau automatique

```tsx
import { useSentryNetworkMonitoring } from '@/hooks/useSentryNetworkMonitoring';

function App() {
  // Le monitoring réseau est automatiquement activé
  useSentryNetworkMonitoring();
  
  return <YourApp />;
}
```

## Métriques disponibles

### Métriques utilisateur
- `user_type`: 'new' | 'returning'
- `session_duration`: Durée de la session en millisecondes
- `actions_performed`: Nombre d'actions utilisateur
- `errors_encountered`: Nombre d'erreurs rencontrées

### Métriques d'application
- `app_version`: Version de l'application
- `platform`: 'ios' | 'android' | 'web'
- `screen_views`: Nombre de vues d'écran
- `api_calls`: Nombre d'appels API
- `crash_count`: Nombre de crashes

### Métriques de performance
- `screen_load_time`: Temps de chargement des écrans
- `api_response_time`: Temps de réponse des API
- `memory_usage`: Utilisation mémoire
- `battery_level`: Niveau de batterie (si disponible)

## Fonctions utilitaires

### Gestion des utilisateurs

```tsx
import { setSentryUser, clearSentryUser } from '@/lib/sentry';

// Définir l'utilisateur
setSentryUser({
  id: 'user123',
  email: 'user@example.com',
  username: 'username'
});

// Effacer l'utilisateur
clearSentryUser();
```

### Ajout de contexte

```tsx
import { addSentryContext, addSentryTag } from '@/lib/sentry';

// Ajouter du contexte
addSentryContext('user_preferences', {
  theme: 'dark',
  language: 'fr'
});

// Ajouter des tags
addSentryTag('feature_flag', 'enabled');
```

### Capture d'erreurs

```tsx
import { captureSentryException, captureSentryMessage } from '@/lib/sentry';

// Capturer une exception
try {
  // Code qui peut échouer
} catch (error) {
  captureSentryException(error, {
    additional_context: 'value'
  });
}

// Envoyer un message
captureSentryMessage('User completed onboarding', 'info');
```

## Breadcrumbs

Les breadcrumbs sont automatiquement ajoutés pour :
- Navigation entre écrans
- Actions utilisateur
- Appels API
- Erreurs
- Métriques de performance

## Configuration des environnements

### Développement
- Debug activé
- Traces complètes (100%)
- Logs détaillés
- Source maps incluses

### Production
- Debug désactivé
- Traces échantillonnées (20%)
- Logs minimaux
- Optimisations activées

## Monitoring des performances

### Métriques automatiques
- Temps de chargement des écrans
- Durée des appels API
- Utilisation mémoire
- Temps de réponse utilisateur

### Métriques personnalisées
```tsx
import { sentryMetricsService } from '@/services/sentryMetricsService';

// Envoyer une métrique personnalisée
sentryMetricsService.sendCustomMetric('feature_usage', 1, {
  feature: 'chat',
  user_type: 'premium'
});
```

## Rapports de session

```tsx
import { sentryMetricsService } from '@/services/sentryMetricsService';

// Générer un rapport de session
const report = sentryMetricsService.generateSessionReport();
console.log('Session Report:', report);
```

## Dépannage

### Problèmes courants

1. **Sentry non initialisé**
   - Vérifier que `SENTRY_DSN` est défini
   - Vérifier la configuration dans `app.config.js`

2. **Erreurs de compilation**
   - Vérifier la configuration Metro
   - Nettoyer le cache: `npx expo start --clear`

3. **Métriques manquantes**
   - Vérifier que les hooks sont correctement utilisés
   - Vérifier les permissions réseau

### Logs de debug

En mode développement, les logs Sentry sont affichés dans la console :
```
🔧 Sentry initialisé avec configuration optimisée
🔧 Environnement: development
🔧 Version: 1.0.1
```

## Bonnes pratiques

1. **Utiliser les Error Boundaries** pour capturer les erreurs React
2. **Tracer les actions utilisateur** importantes
3. **Monitorer les performances** des opérations critiques
4. **Ajouter du contexte** aux erreurs pour faciliter le debugging
5. **Utiliser les breadcrumbs** pour tracer le parcours utilisateur
6. **Configurer les environnements** correctement
7. **Tester l'intégration** en développement

## Maintenance

### Mise à jour de Sentry
```bash
npm update @sentry/react-native
```

### Nettoyage des métriques
```tsx
import { sentryMetricsService } from '@/services/sentryMetricsService';

// Réinitialiser les métriques
sentryMetricsService.resetMetrics();
```

### Vérification de l'intégration
```tsx
import { captureSentryMessage } from '@/lib/sentry';

// Tester l'intégration
captureSentryMessage('Sentry integration test', 'info');
``` 