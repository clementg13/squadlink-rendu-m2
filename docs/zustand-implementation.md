# Implémentation Zustand dans SquadLink

Ce document décrit l'implémentation de Zustand pour la gestion d'état dans l'application SquadLink, en remplacement du contexte React traditionnel.

## Vue d'ensemble

**Zustand** est une bibliothèque de gestion d'état légère et moderne pour React qui offre :
- **Simplicité** : API minimale et intuitive
- **Performance** : Pas de re-renders inutiles
- **TypeScript** : Support natif avec types stricts
- **Persistance** : Intégration avec AsyncStorage
- **Devtools** : Support des outils de développement

## Pourquoi Zustand ?

### Avantages par rapport au contexte React

| Aspect | Contexte React | Zustand |
|--------|---------------|---------|
| **Performance** | Re-renders de tous les consumers | Seulement les composants qui utilisent les données modifiées |
| **Boilerplate** | Beaucoup de code (Provider, Context, hooks) | Minimal |
| **TypeScript** | Configuration complexe | Support natif |
| **Persistance** | Configuration manuelle | Middleware intégré |
| **Devtools** | Pas de support natif | Support intégré |
| **Sélecteurs** | Pas de sélecteurs optimisés | Sélecteurs granulaires |

## Architecture

### Structure des fichiers

```
squadlink/
├── stores/
│   └── authStore.ts             # Store d'authentification Zustand
├── contexts/
│   └── AuthContext.tsx          # Provider simplifié pour l'initialisation
├── app/
│   ├── _layout.tsx             # Provider d'authentification
│   └── (tabs)/
│       └── index.tsx           # Utilisation des hooks Zustand
└── docs/
    └── zustand-implementation.md # Cette documentation
```

## Implémentation

### 1. Store d'authentification

**Fichier `stores/authStore.ts`** :

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  // État
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  
  // Actions
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  
  // Utilitaires
  initialize: () => Promise<void>;
  cleanup: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      session: null,
      loading: true,
      initialized: false,

      // Actions d'authentification
      signIn: async (email, password) => {
        // Implémentation...
      },
      
      // ... autres actions
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        initialized: state.initialized,
      }),
    }
  )
);
```

### 2. Hooks optimisés

**Hooks granulaires pour éviter les re-renders** :

```typescript
// Hook principal (utilise toutes les données)
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    session: store.session,
    loading: store.loading,
    signIn: store.signIn,
    signUp: store.signUp,
    signOut: store.signOut,
    resetPassword: store.resetPassword,
  };
};

// Hooks spécialisés (re-render seulement si la donnée change)
export const useAuthUser = () => {
  return useAuthStore((state) => state.user);
};

export const useAuthLoading = () => {
  return useAuthStore((state) => state.loading);
};

export const useIsAuthenticated = () => {
  const user = useAuthStore((state) => state.user);
  return !!user;
};
```

### 3. Provider simplifié

**Fichier `contexts/AuthContext.tsx`** :

```typescript
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const initialize = useAuthStore((state) => state.initialize);
  const cleanup = useAuthStore((state) => state.cleanup);

  useEffect(() => {
    initialize();
    return () => cleanup();
  }, []);

  return (
    <AuthContext.Provider value={{ initialized }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Utilisation

### 1. Utilisation basique

```typescript
import { useAuth, useAuthUser, useAuthLoading } from '@/stores/authStore';

function MyComponent() {
  // Utilisation granulaire (optimisée)
  const user = useAuthUser();
  const loading = useAuthLoading();
  const { signIn, signOut } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (user) return <UserProfile user={user} />;
  return <LoginForm onSignIn={signIn} />;
}
```

### 2. Sélecteurs personnalisés

```typescript
// Sélecteur pour l'email utilisateur
const userEmail = useAuthStore((state) => state.user?.email);

// Sélecteur pour le statut de confirmation
const isEmailConfirmed = useAuthStore((state) => 
  !!state.user?.email_confirmed_at
);

// Sélecteur conditionnel
const userDisplayName = useAuthStore((state) => 
  state.user?.user_metadata?.full_name || state.user?.email || 'Utilisateur'
);
```

### 3. Actions asynchrones

```typescript
const handleLogin = async () => {
  const { signIn } = useAuth();
  
  try {
    const { error } = await signIn(email, password);
    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      // Succès - le store se met à jour automatiquement
      Alert.alert('Succès', 'Connexion réussie !');
    }
  } catch (error) {
    console.error('Erreur de connexion:', error);
  }
};
```

## Persistance

### Configuration AsyncStorage

```typescript
persist(
  (set, get) => ({
    // Store logic...
  }),
  {
    name: 'auth-storage',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (state) => ({
      user: state.user,
      session: state.session,
      initialized: state.initialized,
    }),
  }
)
```

### Avantages de la persistance

- ✅ **Sessions maintenues** : Entre les redémarrages
- ✅ **Données partielles** : Seulement les données essentielles
- ✅ **Hydratation automatique** : Restauration transparente
- ✅ **Gestion d'erreurs** : Fallback en cas d'erreur de lecture

## Performance

### Optimisations implémentées

1. **Sélecteurs granulaires** :
   ```typescript
   // ❌ Mauvais - re-render à chaque changement du store
   const { user, loading, session } = useAuth();
   
   // ✅ Bon - re-render seulement si user change
   const user = useAuthUser();
   const loading = useAuthLoading();
   ```

2. **Partialisation** :
   ```typescript
   // Seulement les données essentielles sont persistées
   partialize: (state) => ({
     user: state.user,
     session: state.session,
     // loading et initialized ne sont pas persistés
   })
   ```

3. **Subscriptions optimisées** :
   ```typescript
   // Supabase subscription stockée dans le store
   // Nettoyage automatique lors du démontage
   ```

## Comparaison avec l'ancienne implémentation

### Avant (Contexte React)

```typescript
// ❌ Problèmes
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  
  // Beaucoup de useEffect
  // Tous les consumers re-render
  // Pas de persistance native
  // Code verbose
};
```

### Après (Zustand)

```typescript
// ✅ Avantages
const useAuthStore = create()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      session: null,
      
      // Actions intégrées
      // Persistance native
      // Sélecteurs optimisés
    }),
    // Configuration de persistance
  )
);
```

## Bonnes pratiques

### 1. Structure du store

```typescript
// ✅ Bon - Actions et état séparés
interface AuthState {
  // État
  user: User | null;
  loading: boolean;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  
  // Utilitaires
  initialize: () => Promise<void>;
}
```

### 2. Gestion d'erreurs

```typescript
// ✅ Bon - Retourner les erreurs
signIn: async (email, password) => {
  try {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  } catch (error) {
    return { error: error as AuthError };
  } finally {
    set({ loading: false });
  }
}
```

### 3. Hooks spécialisés

```typescript
// ✅ Bon - Hooks granulaires
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthLoading = () => useAuthStore((state) => state.loading);
export const useIsAuthenticated = () => {
  const user = useAuthStore((state) => state.user);
  return !!user;
};
```

## Debugging

### 1. Devtools

```typescript
import { devtools } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Store logic...
      }),
      // Persist config...
    ),
    {
      name: 'auth-store', // Nom dans les devtools
    }
  )
);
```

### 2. Logs

```typescript
// Ajouter des logs dans les actions
signIn: async (email, password) => {
  console.log('🔐 Tentative de connexion pour:', email);
  
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error('❌ Erreur de connexion:', error);
    } else {
      console.log('✅ Connexion réussie');
    }
    
    return { error };
  } catch (error) {
    console.error('💥 Exception lors de la connexion:', error);
    return { error: error as AuthError };
  }
}
```

## Migration depuis le contexte React

### 1. Étapes de migration

1. **Installer Zustand** : `npm install zustand`
2. **Créer le store** : `stores/authStore.ts`
3. **Refactoriser le provider** : Simplifier `AuthContext.tsx`
4. **Mettre à jour les composants** : Utiliser les nouveaux hooks
5. **Tester** : Vérifier que tout fonctionne

### 2. Compatibilité

```typescript
// Maintenir la compatibilité avec les anciens hooks
export { useAuth, useIsAuthenticated } from '@/stores/authStore';
```

## Extensions futures

### 1. Stores additionnels

```typescript
// Store pour les notifications
export const useNotificationStore = create<NotificationState>()(...);

// Store pour les paramètres
export const useSettingsStore = create<SettingsState>()(...);

// Store pour les données utilisateur
export const useUserDataStore = create<UserDataState>()(...);
```

### 2. Middleware personnalisé

```typescript
// Middleware pour les logs
const logger = (config) => (set, get, api) =>
  config(
    (...args) => {
      console.log('Store updated:', args);
      set(...args);
    },
    get,
    api
  );

export const useAuthStore = create<AuthState>()(
  logger(
    persist(
      // Store logic...
    )
  )
);
```

## Ressources

- [Documentation Zustand](https://github.com/pmndrs/zustand)
- [Zustand Middleware](https://github.com/pmndrs/zustand#middleware)
- [Patterns Zustand](https://github.com/pmndrs/zustand/wiki/Patterns)
- [Zustand vs Redux](https://github.com/pmndrs/zustand#comparison-with-redux)

## Conclusion

L'implémentation de Zustand dans SquadLink apporte :

- ✅ **Meilleures performances** : Pas de re-renders inutiles
- ✅ **Code plus simple** : Moins de boilerplate
- ✅ **TypeScript natif** : Types stricts sans configuration
- ✅ **Persistance intégrée** : Avec AsyncStorage
- ✅ **Debugging facile** : Devtools et logs
- ✅ **Scalabilité** : Facilité d'ajout de nouveaux stores

Cette approche moderne améliore significativement l'expérience développeur et les performances de l'application. 