# Système de Routage SquadLink

Ce document décrit l'implémentation complète du système de routage dans l'application SquadLink, utilisant Expo Router avec les dernières bonnes pratiques.

## Vue d'ensemble

Le système de routage est basé sur **Expo Router** (v3) avec une architecture organisée en groupes de routes selon les niveaux d'accès :

- **Routes publiques** : Accessibles sans authentification (onboarding, conditions, etc.)
- **Routes d'authentification** : Connexion, inscription, mot de passe oublié
- **Routes protégées** : Nécessitent une authentification (dashboard, profil, etc.)

## Architecture des Routes

### Structure des fichiers

```
app/
├── _layout.tsx                 # Layout principal avec AuthProvider
├── index.tsx                   # Route de redirection automatique
├── modal.tsx                   # Modal global
├── (public)/                   # Routes publiques
│   ├── _layout.tsx
│   ├── onboarding.tsx
│   ├── terms.tsx
│   └── privacy.tsx
├── (auth)/                     # Routes d'authentification
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   └── reset-password.tsx
└── (protected)/                # Routes protégées
    ├── _layout.tsx             # Protection d'accès
    └── (tabs)/                 # Navigation par onglets
        ├── _layout.tsx
        ├── index.tsx           # Accueil
        ├── dashboard.tsx
        ├── messages.tsx
        └── profile.tsx
```

## Fonctionnalités Principales

### 1. Redirection Automatique

**Fichier : `app/index.tsx`**

Le système de redirection a été amélioré avec un callback système pour gérer les problèmes de persistance Zustand :

```typescript
export default function IndexScreen() {
  const router = useRouter();
  
  // Utiliser des selectors spécifiques pour forcer les re-renders
  const user = useAuthUser();
  const loading = useAuthLoading();
  const initialized = useAuthStore((state) => state.initialized);
  const setOnAuthChange = useAuthStore((state) => state.setOnAuthChange);

  // Configurer le callback de redirection
  useEffect(() => {
    setOnAuthChange((user) => {
      if (user) {
        router.replace('/(protected)/(tabs)');
      } else {
        router.replace('/(public)/onboarding');
      }
    });
  }, [router, setOnAuthChange]);

  useEffect(() => {
    if (!initialized || loading) return;

    if (user) {
      router.replace('/(protected)/(tabs)');
    } else {
      router.replace('/(public)/onboarding');
    }
  }, [user, initialized, loading, router]);

  return <LoadingScreen />;
}
```

**Améliorations récentes :**
- ✅ Callback système pour forcer la redirection après connexion
- ✅ Selectors Zustand spécifiques pour éviter les problèmes de re-render
- ✅ Gestion robuste des états de chargement
- ✅ Logs détaillés pour le débogage

### 2. Store d'Authentification Amélioré

**Fichier : `stores/authStore.ts`**

Le store a été amélioré avec un système de callbacks pour les redirections :

```typescript
interface AuthState {
  // ... autres propriétés
  
  // Callback de redirection
  onAuthChange?: (user: User | null) => void;
  setOnAuthChange: (callback: (user: User | null) => void) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ... autres méthodes
      
      setUser: (user) => {
        set({ user });
        
        // Appeler le callback de redirection si défini
        const { onAuthChange } = get();
        if (onAuthChange) {
          onAuthChange(user);
        }
      },
      
      setOnAuthChange: (callback) => {
        set({ onAuthChange: callback });
      },
      
      // Correction dans onAuthStateChange
      initialize: async () => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event: string, session: Session | null) => {
            // Utiliser setUser et setSession pour déclencher les callbacks
            const { setUser, setSession, setLoading } = get();
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
          }
        );
      }
    })
  )
);
```

**Corrections apportées :**
- ✅ Callback système pour redirection forcée
- ✅ Correction du `onAuthStateChange` pour utiliser `setUser()`
- ✅ Hooks spécialisés (`useAuthUser`, `useAuthLoading`)

### 3. Protection des Routes

**Fichier : `app/(protected)/_layout.tsx`**

```typescript
export default function ProtectedLayout() {
  const router = useRouter();
  const { user, loading, initialized } = useAuthStore();

  useEffect(() => {
    if (!initialized || loading) return;

    // Rediriger vers l'authentification si pas connecté
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, [user, loading, initialized, router]);

  // Écrans de chargement pendant la vérification
  if (!initialized || loading || !user) {
    return <LoadingScreen />;
  }

  return <Stack>{/* Routes protégées */}</Stack>;
}
```

**Avantages :**
- ✅ Protection automatique de toutes les routes enfants
- ✅ Redirection vers l'authentification si non connecté
- ✅ Gestion des états de chargement

### 4. Layouts Spécialisés

#### Layout Public
```typescript
// app/(public)/_layout.tsx
export default function PublicLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="privacy" />
    </Stack>
  );
}
```

#### Layout d'Authentification
```typescript
// app/(auth)/_layout.tsx
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      animation: 'slide_from_right' 
    }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
```

#### Layout Protégé avec Tabs
```typescript
// app/(protected)/(tabs)/_layout.tsx
export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#007AFF',
      headerShown: true,
    }}>
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
```

## Écrans Implémentés

### Routes Publiques (`(public)`)

| Écran | Fichier | Description | Liens vers |
|-------|---------|-------------|------------|
| **Onboarding** | `onboarding.tsx` | Introduction à l'application avec slides | Terms, Privacy |
| **Conditions** | `terms.tsx` | Conditions d'utilisation | - |
| **Confidentialité** | `privacy.tsx` | Politique de confidentialité | - |

### Routes d'Authentification (`(auth)`)

| Écran | Fichier | Description | Liens vers |
|-------|---------|-------------|------------|
| **Connexion** | `login.tsx` | Formulaire de connexion | Register, Forgot Password, Terms, Privacy |
| **Inscription** | `register.tsx` | Formulaire d'inscription | Login, Terms, Privacy |
| **Mot de passe oublié** | `forgot-password.tsx` | Réinitialisation par email | Login |
| **Nouveau mot de passe** | `reset-password.tsx` | Saisie du nouveau mot de passe | Login |

### Routes Protégées (`(protected)`)

| Écran | Fichier | Description |
|-------|---------|-------------|
| **Accueil** | `(tabs)/index.tsx` | Tableau de bord principal |
| **Dashboard** | `(tabs)/dashboard.tsx` | Statistiques et métriques |
| **Messages** | `(tabs)/messages.tsx` | Communication d'équipe |
| **Profil** | `(tabs)/profile.tsx` | Profil utilisateur (onglet) |

## Intégration avec l'Authentification

### 1. Hooks Optimisés

```typescript
// Hooks spécialisés pour éviter les re-renders inutiles
const user = useAuthUser();
const loading = useAuthLoading();
const initialized = useAuthStore((state) => state.initialized);

// Hook complet pour les actions
const { signIn, signOut, signUp } = useAuth();
```

### 2. Redirections Automatiques

```typescript
// Après connexion réussie
const { error } = await signIn(email, password);
if (!error) {
  // Redirection automatique via le callback système
  // Pas besoin de router.push() manuel
}
```

### 3. Gestion des Erreurs

```typescript
// Gestion cohérente des erreurs d'auth
if (error) {
  Alert.alert('Erreur de connexion', error.message);
} else {
  Alert.alert('Succès', 'Connexion réussie !');
}
```

## Navigation et Liens

### 1. Navigation Typée

```typescript
// Utilisation de router.replace() pour éviter l'historique
router.replace('/(protected)/(tabs)');

// Utilisation de router.push() pour la navigation normale
router.push('/(public)/terms');

// Utilisation de router.back() pour revenir
router.back();
```

### 2. Liens vers Terms et Privacy

Les liens vers les conditions d'utilisation et la politique de confidentialité sont disponibles dans :

- **Écran d'onboarding** : Liens en bas de page
- **Écrans d'authentification** : Liens dans le footer
- **Navigation directe** : `/(public)/terms` et `/(public)/privacy`

## Débogage et Monitoring

### 1. Logs de Navigation

```typescript
// Logs détaillés pour le débogage
console.log('🔄 IndexScreen render #', renderCount, '- État:', { 
  user: !!user, 
  loading, 
  initialized,
  userEmail: user?.email || 'null' 
});
```

### 2. Gestion des Erreurs de Navigation

```typescript
// Wrapper pour les erreurs de navigation
try {
  router.replace('/(protected)/(tabs)');
} catch (error) {
  console.error('❌ Erreur de navigation:', error);
}
```

## Problèmes Résolus

### 1. Redirection après Connexion

**Problème :** La redirection automatique ne fonctionnait pas après une connexion réussie.

**Solution :** 
- Ajout d'un système de callbacks dans le store
- Correction du `onAuthStateChange` pour utiliser `setUser()`
- Utilisation de selectors spécifiques pour forcer les re-renders

### 2. Persistance Zustand

**Problème :** La persistance Zustand interférait avec les mises à jour d'état.

**Solution :**
- Callback système pour contourner les problèmes de persistance
- Hooks spécialisés pour éviter les re-renders inutiles

### 3. Gestion des États de Chargement

**Problème :** États de chargement incohérents entre les écrans.

**Solution :**
- Centralisation de la logique de chargement
- Écrans de chargement cohérents
- Gestion appropriée des dépendances `useEffect`

## Bonnes Pratiques

### 1. Structure des Routes

- ✅ Groupement logique par niveau d'accès
- ✅ Layouts spécialisés pour chaque groupe
- ✅ Protection automatique des routes sensibles

### 2. Gestion d'État

- ✅ Store Zustand avec persistance
- ✅ Hooks spécialisés pour éviter les re-renders
- ✅ Callbacks pour les actions critiques

### 3. Navigation

- ✅ Redirection automatique selon l'état d'auth
- ✅ Navigation typée avec TypeScript
- ✅ Gestion cohérente des erreurs

### 4. UX/UI

- ✅ Écrans de chargement pendant les transitions
- ✅ Animations fluides entre les écrans
- ✅ Feedback utilisateur approprié

## Maintenance et Extension

### 1. Ajouter une Nouvelle Route

```typescript
// 1. Créer le fichier dans le bon groupe
// app/(public)/help.tsx

// 2. Ajouter au layout correspondant
// app/(public)/_layout.tsx
<Stack.Screen name="help" />

// 3. Naviguer vers la route
router.push('/(public)/help');
```

### 2. Modifier les Redirections

```typescript
// Dans app/index.tsx ou le callback
if (user) {
  router.replace('/(protected)/dashboard');
} else {
  router.replace('/(public)/welcome');
}
```

### 3. Ajouter des Liens

```typescript
// Dans n'importe quel écran
<TouchableOpacity onPress={() => router.push('/(public)/terms')}>
  <Text>Conditions d'utilisation</Text>
</TouchableOpacity>
```

## Sécurité

### 1. Protection des Routes

- ✅ Vérification automatique de l'authentification
- ✅ Redirection forcée si non autorisé
- ✅ Gestion des tokens expirés

### 2. Navigation Sécurisée

- ✅ Validation des routes avant navigation
- ✅ Nettoyage de l'historique sur déconnexion
- ✅ Gestion des deep links sécurisée

## Performance

### 1. Optimisations

- ✅ Lazy loading des écrans
- ✅ Memoization des composants lourds
- ✅ Selectors optimisés pour Zustand

### 2. Monitoring

- ✅ Logs détaillés pour le débogage
- ✅ Métriques de performance
- ✅ Gestion des erreurs centralisée 