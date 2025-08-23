# Implémentation Supabase dans SquadLink

Ce document décrit l'implémentation complète de Supabase dans l'application SquadLink, incluant l'authentification, la configuration et les bonnes pratiques.

## Vue d'ensemble

**Supabase** est une alternative open-source à Firebase qui fournit :
- **Authentification** : Gestion des utilisateurs avec email/mot de passe
- **Base de données** : PostgreSQL avec API REST automatique
- **Stockage** : Stockage de fichiers
- **Temps réel** : Subscriptions en temps réel

## Architecture

### Structure des fichiers

```
squadlink/
├── lib/
│   └── supabase.ts              # Configuration client Supabase
├── contexts/
│   └── AuthContext.tsx          # Contexte d'authentification React
├── constants/
│   └── Environment.ts           # Variables d'environnement (mise à jour)
├── app/
│   ├── _layout.tsx             # Provider d'authentification
│   └── (tabs)/
│       └── index.tsx           # Interface d'authentification
└── docs/
    └── supabase-implementation.md # Cette documentation
```

## Configuration

### 1. Variables d'environnement

Les variables Supabase sont configurées dans le système d'environnement existant :

**Fichier `.env`** :
```env
# Configuration Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
```

**Validation dans `constants/Environment.ts`** :
```typescript
const envSchema = z.object({
  // Variables Supabase (requises)
  EXPO_PUBLIC_SUPABASE_URL: z.string().url('EXPO_PUBLIC_SUPABASE_URL doit être une URL valide'),
  EXPO_PUBLIC_SUPABASE_KEY: z.string().min(1, 'EXPO_PUBLIC_SUPABASE_KEY est requis'),
  // ... autres variables
});
```

### 2. Client Supabase

**Fichier `lib/supabase.ts`** :
```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { env } from '@/constants/Environment';

export const supabase = createClient(
  env.EXPO_PUBLIC_SUPABASE_URL,
  env.EXPO_PUBLIC_SUPABASE_KEY,
  {
    auth: {
      storage: AsyncStorage,           // Persistance des sessions
      autoRefreshToken: true,          // Rafraîchissement automatique
      persistSession: true,            // Session persistante
      detectSessionInUrl: false,       // Pas de détection URL (mobile)
    },
  }
);
```

## Authentification

### 1. Contexte d'authentification

Le contexte `AuthContext` fournit une interface centralisée pour l'authentification :

**Fonctionnalités** :
- ✅ Gestion de l'état utilisateur
- ✅ Connexion/Déconnexion
- ✅ Inscription
- ✅ Réinitialisation de mot de passe
- ✅ Persistance des sessions
- ✅ Écoute des changements d'état

**Utilisation** :
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (user) return <UserProfile />;
  return <LoginForm />;
}
```

### 2. Hooks disponibles

```typescript
// Hook principal
const { user, session, loading, signIn, signUp, signOut } = useAuth();

// Hook pour vérifier l'authentification
const isAuthenticated = useIsAuthenticated();
```

### 3. Gestion des erreurs

Le système gère automatiquement les erreurs d'authentification :

```typescript
const handleSignIn = async () => {
  const { error } = await signIn(email, password);
  if (error) {
    Alert.alert('Erreur de connexion', error.message);
  }
};
```

## Interface utilisateur

### 1. Page d'accueil avec authentification

L'interface s'adapte automatiquement selon l'état d'authentification :

- **Non connecté** : Formulaire de connexion/inscription
- **Connecté** : Profil utilisateur et informations
- **Chargement** : Indicateur de chargement

### 2. Fonctionnalités implémentées

✅ **Connexion** : Email + mot de passe
✅ **Inscription** : Avec validation email
✅ **Déconnexion** : Nettoyage de session
✅ **Validation** : Champs requis, format email
✅ **Feedback** : Alerts pour succès/erreurs
✅ **Responsive** : Adaptation mobile/tablet

## Bonnes pratiques implémentées

### 1. Sécurité

- ✅ **Variables d'environnement** : Clés API non commitées
- ✅ **Validation Zod** : Validation stricte des variables
- ✅ **AsyncStorage** : Stockage sécurisé des sessions
- ✅ **Gestion d'erreurs** : Pas d'exposition d'informations sensibles

### 2. Performance

- ✅ **Lazy loading** : Chargement à la demande
- ✅ **Memoization** : Optimisation des re-rendus
- ✅ **Persistance** : Sessions maintenues entre redémarrages
- ✅ **Auto-refresh** : Tokens rafraîchis automatiquement

### 3. UX/UI

- ✅ **États de chargement** : Indicateurs visuels
- ✅ **Feedback utilisateur** : Messages de succès/erreur
- ✅ **Validation temps réel** : Vérification des champs
- ✅ **Accessibilité** : Labels et navigation clavier

## Utilisation avancée

### 1. Écoute des changements d'authentification

```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log('Auth event:', event);
      // Gérer les changements d'état
    }
  );
  
  return () => subscription.unsubscribe();
}, []);
```

### 2. Accès aux métadonnées utilisateur

```typescript
const { user } = useAuth();

// Informations utilisateur
const email = user?.email;
const userId = user?.id;
const isConfirmed = user?.email_confirmed_at;
const metadata = user?.user_metadata;
```

### 3. Gestion des sessions

```typescript
import { getCurrentSession, getCurrentUser } from '@/lib/supabase';

// Obtenir la session actuelle
const session = await getCurrentSession();

// Obtenir l'utilisateur actuel
const user = await getCurrentUser();
```

## Déploiement

### 1. Configuration Supabase

1. **Créer un projet** sur [supabase.com](https://supabase.com)
2. **Récupérer les clés** :
   - Project URL
   - Anon key (clé publique)
3. **Configurer l'authentification** :
   - Activer Email/Password
   - Configurer les URLs de redirection
   - Personnaliser les templates d'email

### 2. Variables d'environnement

**Développement** :
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
```

**Production** :
- Utiliser les variables d'environnement du système de déploiement
- Vérifier que les URLs de redirection sont correctes

## Dépannage

### 1. Erreurs communes

**"Invalid JWT"** :
- Vérifier que la clé API est correcte
- Vérifier que l'URL du projet est correcte
- Redémarrer l'application

**"Session not found"** :
- Vérifier la configuration AsyncStorage
- Vérifier que `persistSession: true`
- Nettoyer le cache : `npx expo start --clear`

**"User not confirmed"** :
- Vérifier l'email de confirmation
- Vérifier la configuration email dans Supabase
- Désactiver la confirmation email pour les tests

### 2. Debug

Activer les logs pour le debug :

```typescript
// Dans lib/supabase.ts
export const supabase = createClient(url, key, {
  auth: {
    debug: env.DEBUG, // Activer les logs en développement
    // ... autres options
  },
});
```

## Tests

### 1. Tests d'authentification

```typescript
// Exemple de test avec Jest
describe('Authentication', () => {
  it('should sign in user', async () => {
    const { error } = await signIn('test@example.com', 'password');
    expect(error).toBeNull();
  });
});
```

### 2. Tests d'intégration

Tester l'intégration complète avec un projet Supabase de test.

## Extensions futures

### 1. Fonctionnalités à ajouter

- **OAuth** : Connexion avec Google, Apple, etc.
- **Profils** : Gestion des profils utilisateur
- **Rôles** : Système de permissions
- **2FA** : Authentification à deux facteurs

### 2. Optimisations

- **Offline** : Mode hors ligne
- **Caching** : Cache des données
- **Monitoring** : Suivi des performances
- **Analytics** : Analyse d'usage

## Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [Expo Router](https://expo.github.io/router/docs/)

## Support

Pour toute question ou problème :
1. Consulter cette documentation
2. Vérifier les logs de l'application
3. Consulter la documentation Supabase
4. Contacter l'équipe de développement 