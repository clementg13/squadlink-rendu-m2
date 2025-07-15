# Guide de Migration vers Zustand

Ce guide vous accompagne dans la migration du contexte React vers Zustand pour une meilleure gestion d'état.

## Pourquoi migrer ?

### Problèmes avec le contexte React

```typescript
// ❌ Problèmes de l'ancienne approche
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  
  // Problème 1: Tous les composants re-render
  // Problème 2: Pas de persistance native
  // Problème 3: Code verbose et complexe
  // Problème 4: Difficile à tester
  
  useEffect(() => {
    // Logique d'initialisation complexe
  }, []);
  
  const value = {
    user,
    loading,
    session,
    signIn,
    signOut,
    // ... beaucoup de props
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Avantages de Zustand

```typescript
// ✅ Avantages de la nouvelle approche
const useAuthStore = create()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      session: null,
      
      // Avantage 1: Sélecteurs optimisés
      // Avantage 2: Persistance intégrée
      // Avantage 3: Code concis
      // Avantage 4: Facilement testable
      
      signIn: async (email, password) => {
        // Logique simple et claire
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

## Étapes de migration

### 1. Installation

```bash
npm install zustand
```

### 2. Créer le store Zustand

**Nouveau fichier : `stores/authStore.ts`**

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

      // Actions
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
      },

      signUp: async (email, password) => {
        try {
          set({ loading: true });
          const { error } = await supabase.auth.signUp({ email, password });
          return { error };
        } catch (error) {
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      signOut: async () => {
        try {
          set({ loading: true });
          const { error } = await supabase.auth.signOut();
          if (!error) {
            set({ user: null, session: null });
          }
          return { error };
        } catch (error) {
          return { error: error as AuthError };
        } finally {
          set({ loading: false });
        }
      },

      initialize: async () => {
        try {
          set({ loading: true });
          
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (!error) {
            set({ session, user: session?.user ?? null });
          }

          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
              set({ 
                session, 
                user: session?.user ?? null,
                loading: false 
              });
            }
          );

          (get() as any)._subscription = subscription;
          set({ initialized: true });
        } catch (error) {
          console.error('Erreur initialisation:', error);
        } finally {
          set({ loading: false });
        }
      },

      cleanup: () => {
        const subscription = (get() as any)._subscription;
        if (subscription) {
          subscription.unsubscribe();
        }
      },
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

// Hooks optimisés
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    session: store.session,
    loading: store.loading,
    initialized: store.initialized,
    signUp: store.signUp,
    signIn: store.signIn,
    signOut: store.signOut,
    initialize: store.initialize,
    cleanup: store.cleanup,
  };
};

export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthLoading = () => useAuthStore((state) => state.loading);
export const useIsAuthenticated = () => {
  const user = useAuthStore((state) => state.user);
  return !!user;
};
```

### 3. Simplifier le provider

**Modifier : `contexts/AuthContext.tsx`**

```typescript
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface AuthContextType {
  initialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const initialize = useAuthStore((state) => state.initialize);
  const cleanup = useAuthStore((state) => state.cleanup);
  const initialized = useAuthStore((state) => state.initialized);

  useEffect(() => {
    initialize();
    return () => cleanup();
  }, [initialize, cleanup]);

  return (
    <AuthContext.Provider value={{ initialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext doit être utilisé dans un AuthProvider');
  }
  return context;
};

// Re-export pour compatibilité
export { useAuth, useIsAuthenticated, useAuthUser, useAuthLoading } from '@/stores/authStore';
```

### 4. Mettre à jour les composants

**Avant (Contexte React) :**

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  // ❌ Tous les composants re-render à chaque changement
  const { user, loading, signIn, signOut } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (user) return <UserProfile user={user} />;
  return <LoginForm onSignIn={signIn} />;
}
```

**Après (Zustand) :**

```typescript
import { useAuthUser, useAuthLoading, useAuth } from '@/stores/authStore';

function MyComponent() {
  // ✅ Re-render seulement si les données utilisées changent
  const user = useAuthUser();
  const loading = useAuthLoading();
  const { signIn, signOut } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (user) return <UserProfile user={user} />;
  return <LoginForm onSignIn={signIn} />;
}
```

### 5. Optimiser les sélecteurs

**Sélecteurs granulaires :**

```typescript
// ✅ Sélecteurs optimisés
const userEmail = useAuthStore((state) => state.user?.email);
const isEmailConfirmed = useAuthStore((state) => !!state.user?.email_confirmed_at);
const userDisplayName = useAuthStore((state) => 
  state.user?.user_metadata?.full_name || state.user?.email || 'Utilisateur'
);
```

## Comparaison des performances

### Avant (Contexte React)

```typescript
// ❌ Problèmes de performance
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Tous les composants qui utilisent useAuth re-render
  // même s'ils n'utilisent qu'une partie des données
  
  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Composant qui ne veut que loading
function LoadingComponent() {
  const { loading } = useAuth(); // ❌ Re-render si user change
  return loading ? <Spinner /> : null;
}
```

### Après (Zustand)

```typescript
// ✅ Performances optimisées
const useAuthStore = create()(
  persist((set, get) => ({
    user: null,
    loading: true,
    // ...
  }))
);

// Composant optimisé
function LoadingComponent() {
  const loading = useAuthLoading(); // ✅ Re-render seulement si loading change
  return loading ? <Spinner /> : null;
}
```

## Tests

### Avant (Contexte React)

```typescript
// ❌ Tests complexes
const renderWithAuth = (component) => {
  const mockValue = {
    user: null,
    loading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
  };
  
  return render(
    <AuthContext.Provider value={mockValue}>
      {component}
    </AuthContext.Provider>
  );
};
```

### Après (Zustand)

```typescript
// ✅ Tests simples
import { useAuthStore } from '@/stores/authStore';

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    loading: false,
  });
});

test('should display login form when not authenticated', () => {
  render(<MyComponent />);
  expect(screen.getByText('Se connecter')).toBeInTheDocument();
});
```

## Debugging

### Ajouter les devtools

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
      name: 'auth-store',
    }
  )
);
```

### Ajouter des logs

```typescript
signIn: async (email, password) => {
  console.log('🔐 Connexion:', email);
  
  try {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error('❌ Erreur:', error.message);
    } else {
      console.log('✅ Connexion réussie');
    }
    
    return { error };
  } catch (error) {
    console.error('💥 Exception:', error);
    return { error: error as AuthError };
  } finally {
    set({ loading: false });
  }
}
```

## Checklist de migration

### ✅ Étapes techniques

- [ ] Installer Zustand : `npm install zustand`
- [ ] Créer `stores/authStore.ts`
- [ ] Simplifier `contexts/AuthContext.tsx`
- [ ] Mettre à jour les imports dans les composants
- [ ] Optimiser les sélecteurs
- [ ] Ajouter la persistance
- [ ] Configurer les devtools
- [ ] Mettre à jour les tests

### ✅ Vérifications

- [ ] L'authentification fonctionne
- [ ] La persistance fonctionne (redémarrage app)
- [ ] Les performances sont améliorées
- [ ] Pas de re-renders inutiles
- [ ] Les tests passent
- [ ] La documentation est à jour

## Bonnes pratiques post-migration

### 1. Sélecteurs optimisés

```typescript
// ✅ Bon - Sélecteurs granulaires
const user = useAuthUser();
const loading = useAuthLoading();

// ❌ Éviter - Sélection large
const { user, loading, session, initialized } = useAuth();
```

### 2. Actions asynchrones

```typescript
// ✅ Bon - Gestion d'erreurs propre
const handleLogin = async () => {
  const { signIn } = useAuth();
  const { error } = await signIn(email, password);
  
  if (error) {
    Alert.alert('Erreur', error.message);
  }
};
```

### 3. Persistance sélective

```typescript
// ✅ Bon - Persister seulement les données importantes
partialize: (state) => ({
  user: state.user,
  session: state.session,
  // Ne pas persister loading, initialized
}),
```

## Dépannage

### Problème : Store non initialisé

```typescript
// Solution : Vérifier l'initialisation
const initialized = useAuthStore((state) => state.initialized);

if (!initialized) {
  return <LoadingSpinner />;
}
```

### Problème : Persistance ne fonctionne pas

```typescript
// Solution : Vérifier la configuration
{
  name: 'auth-storage', // Nom unique
  storage: createJSONStorage(() => AsyncStorage),
  partialize: (state) => ({
    // Seulement les données sérialisables
  }),
}
```

### Problème : Re-renders excessifs

```typescript
// Solution : Utiliser des sélecteurs granulaires
// ❌ Éviter
const { user, loading, session } = useAuth();

// ✅ Préférer
const user = useAuthUser();
const loading = useAuthLoading();
```

## Ressources

- [Documentation Zustand](https://github.com/pmndrs/zustand)
- [Patterns Zustand](https://github.com/pmndrs/zustand/wiki/Patterns)
- [Middleware Zustand](https://github.com/pmndrs/zustand#middleware)
- [React DevTools](https://github.com/pmndrs/zustand#react-devtools)

## Conclusion

La migration vers Zustand apporte des améliorations significatives :

- ✅ **Performances** : Pas de re-renders inutiles
- ✅ **Simplicité** : Moins de code boilerplate
- ✅ **Persistance** : Intégration native
- ✅ **Debugging** : Outils intégrés
- ✅ **Tests** : Plus faciles à écrire
- ✅ **TypeScript** : Support natif

Cette migration moderne améliore l'expérience développeur et les performances de l'application. 