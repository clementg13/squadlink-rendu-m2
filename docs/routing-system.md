# Documentation du Système de Routage SquadLink

## Vue d'ensemble

SquadLink utilise **Expo Router** (v3) avec une architecture de routage basée sur le système de fichiers. L'application est organisée en trois groupes principaux selon les niveaux d'accès utilisateur.

## Architecture des Routes

### Structure des fichiers

```
app/
├── _layout.tsx                 # Layout racine avec AuthProvider
├── index.tsx                   # Point d'entrée et redirection automatique
├── modal.tsx                   # Modal global
├── (public)/                   # 🌐 Routes publiques (sans authentification)
│   ├── _layout.tsx
│   ├── onboarding.tsx
│   ├── terms.tsx
│   └── privacy.tsx
├── (auth)/                     # 🔐 Routes d'authentification
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   └── reset-password.tsx
└── (protected)/                # 🛡️ Routes protégées (authentification requise)
    ├── _layout.tsx
    └── (tabs)/
        ├── _layout.tsx
        ├── index.tsx
        ├── dashboard.tsx
        ├── messages.tsx
        └── profile.tsx
```

### Groupes de Routes

Les parenthèses `()` créent des groupes de routes sans affecter l'URL. Chaque groupe a son propre layout et sa logique spécifique.

## Flux de Navigation

### 1. Point d'entrée (`app/index.tsx`)

```typescript
export default function IndexScreen() {
  const router = useRouter();
  const user = useAuthUser();
  const loading = useAuthLoading();
  const initialized = useAuthStore((state) => state.initialized);
  const setOnAuthChange = useAuthStore((state) => state.setOnAuthChange);

  // Callback pour redirection automatique après connexion
  useEffect(() => {
    setOnAuthChange((user) => {
      if (user) {
        router.replace('/(protected)/(tabs)');
      } else {
        router.replace('/(public)/onboarding');
      }
    });
  }, [router, setOnAuthChange]);

  // Redirection initiale
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

**Logique :**
- Vérifie l'état d'authentification
- Redirige vers les routes protégées si connecté
- Redirige vers l'onboarding si non connecté
- Configure un callback pour les redirections automatiques

### 2. Diagramme de flux

```mermaid
graph TD
    A[App Launch] --> B[index.tsx]
    B --> C{Utilisateur connecté?}
    C -->|Oui| D[/(protected)/(tabs)]
    C -->|Non| E[/(public)/onboarding]
    E --> F[Slides d'introduction]
    F --> G[/(auth)/login]
    G --> H[Formulaire de connexion]
    H --> I{Connexion réussie?}
    I -->|Oui| D
    I -->|Non| G
    D --> J[Navigation par onglets]
```

## Layouts et Protection

### Layout Racine (`app/_layout.tsx`)

```typescript
export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(public)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(protected)" />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

### Layout Protégé (`app/(protected)/_layout.tsx`)

```typescript
export default function ProtectedLayout() {
  const router = useRouter();
  const { user, loading, initialized } = useAuthStore();

  useEffect(() => {
    if (!initialized || loading) return;

    // Redirection si non connecté
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, [user, loading, initialized, router]);

  // Écran de chargement pendant la vérification
  if (!initialized || loading || !user) {
    return <LoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
```

**Fonctionnement :**
- Vérifie automatiquement l'authentification
- Redirige vers `/login` si non connecté
- Affiche un écran de chargement pendant la vérification
- Protège toutes les routes enfants

## Gestion d'État avec Zustand

### Store d'authentification (`stores/authStore.ts`)

```typescript
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  
  // Callback pour redirection
  onAuthChange?: (user: User | null) => void;
  setOnAuthChange: (callback: (user: User | null) => void) => void;
}

// Hooks spécialisés
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthLoading = () => useAuthStore((state) => state.loading);
```

### Intégration Supabase

```typescript
// Dans initialize()
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  async (event: string, session: Session | null) => {
    // Utiliser les setters pour déclencher les callbacks
    const { setUser, setSession, setLoading } = get();
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
  }
);
```

## Écrans et Fonctionnalités

### Routes Publiques

| Écran | Route | Description |
|-------|-------|-------------|
| **Onboarding** | `/(public)/onboarding` | Introduction avec slides |
| **Terms** | `/(public)/terms` | Conditions d'utilisation |
| **Privacy** | `/(public)/privacy` | Politique de confidentialité |

### Routes d'Authentification

| Écran | Route | Description |
|-------|-------|-------------|
| **Login** | `/(auth)/login` | Connexion utilisateur |
| **Register** | `/(auth)/register` | Inscription utilisateur |
| **Forgot Password** | `/(auth)/forgot-password` | Réinitialisation mot de passe |
| **Reset Password** | `/(auth)/reset-password` | Nouveau mot de passe |

### Routes Protégées

| Écran | Route | Description |
|-------|-------|-------------|
| **Home** | `/(protected)/(tabs)/` | Accueil principal |
| **Dashboard** | `/(protected)/(tabs)/dashboard` | Tableau de bord |
| **Messages** | `/(protected)/(tabs)/messages` | Messagerie |
| **Profile** | `/(protected)/(tabs)/profile` | Profil utilisateur |

## Navigation

### Méthodes de Navigation

```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// Remplacer la route actuelle (pas d'historique)
router.replace('/(protected)/(tabs)');

// Naviguer vers une nouvelle route (avec historique)
router.push('/(public)/terms');

// Retour en arrière
router.back();
```

### Liens dans l'Interface

```typescript
// Lien vers les conditions d'utilisation
<TouchableOpacity onPress={() => router.push('/(public)/terms')}>
  <Text style={styles.linkText}>Conditions d'utilisation</Text>
</TouchableOpacity>

// Lien vers la politique de confidentialité
<TouchableOpacity onPress={() => router.push('/(public)/privacy')}>
  <Text style={styles.linkText}>Politique de confidentialité</Text>
</TouchableOpacity>
```

## Authentification et Redirection

### Processus de Connexion

1. **Saisie des identifiants** dans `/(auth)/login`
2. **Appel à `signIn()`** du store
3. **Supabase traite l'authentification**
4. **`onAuthStateChange` déclenché**
5. **Callback de redirection appelé**
6. **Redirection automatique** vers `/(protected)/(tabs)`

### Processus de Déconnexion

1. **Appel à `signOut()`** du store
2. **Supabase supprime la session**
3. **`onAuthStateChange` déclenché**
4. **Store mis à jour** (`user: null`)
5. **Redirection automatique** vers `/(auth)/login`

## Sécurité

### Protection des Routes

- **Vérification automatique** dans `ProtectedLayout`
- **Redirection forcée** si non authentifié
- **Écrans de chargement** pendant la vérification
- **Gestion des sessions expirées**

### Validation des Données

```typescript
// Exemple dans login.tsx
const handleSignIn = async () => {
  if (!email || !password) {
    Alert.alert('Erreur', 'Veuillez remplir tous les champs');
    return;
  }

  const { error } = await signIn(email, password);
  if (error) {
    Alert.alert('Erreur de connexion', error.message);
  }
};
```

## Développement

### Ajouter une Nouvelle Route

#### 1. Route Publique

```typescript
// 1. Créer le fichier
// app/(public)/help.tsx
export default function HelpScreen() {
  return <View>...</View>;
}

// 2. Ajouter au layout
// app/(public)/_layout.tsx
<Stack.Screen name="help" />

// 3. Naviguer
router.push('/(public)/help');
```

#### 2. Route Protégée

```typescript
// 1. Créer le fichier
// app/(protected)/settings.tsx
export default function SettingsScreen() {
  return <View>...</View>;
}

// 2. Ajouter au layout
// app/(protected)/_layout.tsx
<Stack.Screen name="settings" />

// 3. La protection est automatique
```

### Debugging

```typescript
// Logs utiles pour le débogage
console.log('Auth state:', { user: !!user, loading, initialized });
console.log('Navigation to:', route);
```

### Tests

```typescript
// Test de redirection
describe('Navigation', () => {
  it('should redirect to login when not authenticated', () => {
    // Test logic
  });
});
```

## Bonnes Pratiques

### 1. Navigation

- ✅ Utiliser `router.replace()` pour les redirections d'auth
- ✅ Utiliser `router.push()` pour la navigation normale
- ✅ Toujours vérifier l'état d'auth avant navigation

### 2. Layouts

- ✅ Un layout par groupe de routes
- ✅ Logique de protection dans le layout approprié
- ✅ Écrans de chargement cohérents

### 3. État

- ✅ Hooks spécialisés pour éviter les re-renders
- ✅ Callbacks pour les actions critiques
- ✅ Persistance des données importantes

### 4. Sécurité

- ✅ Validation côté client ET serveur
- ✅ Gestion des erreurs appropriée
- ✅ Nettoyage des données sensibles

## Dépannage

### Problèmes Courants

1. **Redirection ne fonctionne pas**
   - Vérifier l'état d'initialisation
   - Contrôler les dépendances useEffect
   - Vérifier les callbacks

2. **Écran blanc**
   - Vérifier les imports
   - Contrôler les layouts
   - Vérifier la configuration Stack

3. **Boucle de redirection**
   - Vérifier les conditions de redirection
   - Contrôler l'état d'authentification
   - Vérifier les dépendances useEffect

### Logs de Debug

```typescript
// Temporairement pour debug
console.log('Current route:', router.pathname);
console.log('Auth state:', { user, loading, initialized });
```

## Conclusion

Ce système de routage offre :

- **Sécurité** : Protection automatique des routes
- **Simplicité** : Structure claire et intuitive
- **Performance** : Chargement optimisé
- **Maintenabilité** : Code organisé et extensible
- **UX** : Redirections fluides et feedback approprié

Pour toute question ou problème, référez-vous à cette documentation ou consultez les fichiers de code correspondants. 