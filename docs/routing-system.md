# Documentation du Système de Routage SquadLink

## Vue d'ensemble

SquadLink utilise **Expo Router** (v3) avec une architecture de routage basée sur le système de fichiers. L'application est organisée en deux groupes principaux selon les niveaux d'accès utilisateur.

## Architecture des Routes

### Structure des fichiers

```
app/
├── _layout.tsx                 # Layout racine avec AuthProvider
├── index.tsx                   # Point d'entrée et redirection automatique
├── modal.tsx                   # Modal global
├── (public)/                   # 🌐 Routes publiques (sans authentification)
│   ├── _layout.tsx
│   ├── auth.tsx                # Page de connexion
│   ├── forgot-password.tsx     # Réinitialisation mot de passe
│   ├── onboarding.tsx          # Processus d'inscription
│   ├── terms.tsx
│   └── privacy.tsx
└── (protected)/                # 🛡️ Routes protégées (authentification requise)
    ├── _layout.tsx
    ├── conversation.tsx
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

Le point d'entrée gère la redirection automatique selon l'état d'authentification :

```typescript
// Redirection automatique
if (user) {
  router.replace('/(protected)/(tabs)');
} else {
  router.replace('/(public)/onboarding');
}
```

### 2. Layout racine (`app/_layout.tsx`)

Configure l'authentification globale et la navigation :

```typescript
// Navigation automatique après changement d'état d'auth
if (user && session) {
  router.replace('/(protected)/(tabs)');
} else {
  router.replace('/(public)/onboarding');
}
```

### 3. Layout protégé (`app/(protected)/_layout.tsx`)

Vérifie l'authentification avant d'afficher le contenu :

```typescript
if (isOnboarding) {
  return <Redirect href="/(public)/onboarding" />;
}

if (!user) {
  return <Redirect href="/(public)/onboarding" />;
}
```

## Écrans et Fonctionnalités

### Routes Publiques

| Écran | Route | Description |
|-------|-------|-------------|
| **Onboarding** | `/(public)/onboarding` | Processus d'inscription complet |
| **Connexion** | `/(public)/auth` | Connexion utilisateur existant |
| **Mot de passe oublié** | `/(public)/forgot-password` | Réinitialisation mot de passe |
| **Terms** | `/(public)/terms` | Conditions d'utilisation |
| **Privacy** | `/(public)/privacy` | Politique de confidentialité |

### Routes Protégées

| Écran | Route | Description |
|-------|-------|-------------|
| **Home** | `/(protected)/(tabs)/` | Accueil principal |
| **Dashboard** | `/(protected)/(tabs)/dashboard` | Tableau de bord |
| **Messages** | `/(protected)/(tabs)/messages` | Messagerie |
| **Profile** | `/(protected)/(tabs)/profile` | Profil utilisateur |
| **Conversation** | `/(protected)/conversation` | Chat individuel |

## Navigation

### Méthodes de Navigation

```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// Remplacer la route actuelle (pas d'historique)
router.replace('/(protected)/(tabs)');

// Naviguer vers une nouvelle route (avec historique)
router.push('/(public)/terms');

// Navigation avec contournement de types (si nécessaire)
router.navigate('/(public)/auth' as any);

// Retour en arrière
router.back();
```

### Liens dans l'Interface

```typescript
// Lien vers les conditions d'utilisation
<TouchableOpacity onPress={() => router.push('/(public)/terms')}>
  <Text style={styles.linkText}>Conditions d'utilisation</Text>
</TouchableOpacity>

// Lien vers la connexion depuis l'onboarding
<TouchableOpacity onPress={() => router.navigate('/(public)/auth' as any)}>
  <Text style={styles.linkText}>Se connecter</Text>
</TouchableOpacity>
```

## Authentification et Redirection

### Processus d'Inscription (Onboarding)

1. **Accueil** dans `/(public)/onboarding`
2. **Création du compte** avec email/mot de passe
3. **Saisie du profil** (nom, prénom, date de naissance)
4. **Sélection des sports** et niveaux
5. **Choix des hobbies**
6. **Finalisation** et redirection vers `/(protected)/(tabs)`

### Processus de Connexion

1. **Saisie des identifiants** dans `/(public)/auth`
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
5. **Redirection automatique** vers `/(public)/onboarding`

## Sécurité

### Protection des Routes

- **Vérification automatique** dans `ProtectedLayout`
- **Redirection forcée** si non authentifié
- **Écrans de chargement** pendant la vérification
- **Gestion des sessions expirées**

### Validation des Données

```typescript
// Exemple dans auth.tsx
const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Erreur', 'Veuillez remplir tous les champs');
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
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

### Gestion des Types de Routes

Si les types de routes ne sont pas reconnus :

```typescript
// Solution temporaire avec assertion de type
router.navigate('/(public)/auth' as any);

// Ou régénérer les types
npx expo start --clear
```

## Architecture de l'Authentification

### Flux Principal

1. **Non authentifié** → `/(public)/onboarding`
2. **En cours d'onboarding** → `/(public)/onboarding` (étapes)
3. **Utilisateur existant** → `/(public)/auth` (depuis onboarding)
4. **Authentifié** → `/(protected)/(tabs)`

### États de l'Application

- `loading`: Chargement initial de l'auth
- `user`: Utilisateur connecté ou null
- `isOnboarding`: Mode onboarding activé
- `initialized`: Store d'auth initialisé 