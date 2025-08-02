# Implémentation des Safe Areas

## Problème résolu

Sur Android, les éléments de l'interface utilisateur passaient derrière la barre de navigation (camera notch, boutons home/retour) car les écrans n'utilisaient pas correctement `react-native-safe-area-context`.

## Solution implémentée

### 1. Composant SafeAreaWrapper

Création d'un composant wrapper réutilisable dans `components/ui/SafeAreaWrapper.tsx` qui :

- Utilise `react-native-safe-area-context` pour gérer les safe areas
- Gère automatiquement la StatusBar avec `translucent={true}` sur Android
- Permet de personnaliser la couleur de fond et le style de la StatusBar
- Inclut tous les edges (top, left, right, bottom) pour une protection complète

### 2. Configuration du SafeAreaProvider

Ajout du `SafeAreaProvider` dans le layout principal (`app/_layout.tsx`) pour que tous les écrans puissent utiliser les safe areas.

### 3. Mise à jour des écrans publics

Tous les écrans du dossier `app/(public)/` ont été mis à jour pour utiliser le nouveau `SafeAreaWrapper` :

- `auth.tsx` - Écran de connexion
- `forgot-password.tsx` - Écran de mot de passe oublié
- `onboarding.tsx` - Écran d'onboarding
- `privacy.tsx` - Page de politique de confidentialité
- `terms.tsx` - Page de conditions d'utilisation

### 4. Mise à jour des écrans protégés

Tous les écrans du dossier `app/(protected)/` ont également été mis à jour :

#### Écrans des onglets (`app/(protected)/(tabs)/`)
- `index.tsx` - Écran d'accueil
- `messages.tsx` - Écran des messages
- `profile.tsx` - Écran du profil

#### Écrans de navigation (`app/(protected)/`)
- `conversation.tsx` - Écran de conversation
- `pending-matches.tsx` - Écran des demandes d'amis en attente
- `profile-detail.tsx` - Écran de détail du profil

### 5. Mise à jour du composant OnboardingContainer

Le composant `OnboardingContainer` a également été mis à jour pour utiliser `SafeAreaWrapper` au lieu de `SafeAreaView`.

## Avantages

- **Cohérence** : Tous les écrans utilisent le même système de safe areas
- **Maintenabilité** : Un seul composant à maintenir pour la gestion des safe areas
- **Compatibilité** : Fonctionne correctement sur Android et iOS
- **Flexibilité** : Permet de personnaliser les couleurs et styles par écran

## Utilisation

```tsx
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';

export default function MonEcran() {
  return (
    <SafeAreaWrapper 
      backgroundColor="#fff" 
      statusBarStyle="dark"
    >
      {/* Contenu de l'écran */}
    </SafeAreaWrapper>
  );
}
```

## Paramètres disponibles

- `backgroundColor` : Couleur de fond (défaut: '#fff')
- `statusBarStyle` : Style de la StatusBar ('light' | 'dark' | 'auto', défaut: 'dark')
- `statusBarBackgroundColor` : Couleur de fond de la StatusBar (optionnel)

## Couleurs utilisées par écran

### Écrans publics
- `auth.tsx` : `#fff` (blanc)
- `forgot-password.tsx` : `#fff` (blanc)
- `onboarding.tsx` : `#fff` (blanc)
- `privacy.tsx` : `#fff` (blanc)
- `terms.tsx` : `#fff` (blanc)

### Écrans protégés
- `index.tsx` : `#FFFFFF` (blanc)
- `messages.tsx` : `#f5f5f5` (gris clair)
- `profile.tsx` : `#f8f9fa` (gris très clair)
- `conversation.tsx` : `#f5f5f5` (gris clair)
- `pending-matches.tsx` : `#F8F9FA` (gris très clair)
- `profile-detail.tsx` : `#f8f9fa` (gris très clair) 