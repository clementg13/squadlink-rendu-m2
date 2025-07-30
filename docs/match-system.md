# Système de Match - SquadLink

Ce document décrit l'implémentation complète du système de match dans l'application SquadLink, incluant la fonction Supabase, le service TypeScript, et l'interface utilisateur.

## Vue d'ensemble

Le système de match permet aux utilisateurs d'initier des demandes de match avec d'autres utilisateurs compatibles. Le système inclut :

- **Fonction Supabase** : Logique métier sécurisée côté serveur
- **Service TypeScript** : Interface client pour interagir avec la base de données
- **Composant UI** : Bouton de match moderne et responsive
- **Tests** : Couverture complète des tests unitaires

## Architecture

### Structure des fichiers

```
squadlink/
├── services/
│   └── matchService.ts              # Service de match
├── components/
│   └── profile/
│       └── MatchButton.tsx          # Composant bouton de match
├── app/
│   └── (protected)/
│       ├── profile-detail.tsx       # Page de détail avec bouton match
│       └── (tabs)/
│           └── index.tsx            # Liste des profils avec boutons match
├── components/
│   └── profile/
│       └── ProfileCard.tsx          # Carte de profil avec bouton match
└── docs/
    └── match-system.md              # Cette documentation
```

## Fonction Supabase

### Fonction `initiate_match`

La fonction PostgreSQL gère toute la logique métier de création de match :

```sql
CREATE OR REPLACE FUNCTION musclemeet.initiate_match(
    initiator_user_id UUID,
    target_user_id UUID
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    match_id BIGINT
)
```

**Vérifications effectuées :**
1. ✅ L'utilisateur ne peut pas matcher avec lui-même
2. ✅ Les deux profils existent
3. ✅ Aucun match existant (dans les deux sens)
4. ✅ Création du match avec statut initial

**Retour :**
- `success` : Boolean indiquant le succès
- `message` : Message explicatif
- `match_id` : ID du match créé (si succès)

## Service TypeScript

### MatchService

Le service fournit une interface TypeScript pour interagir avec la fonction Supabase :

```typescript
export class MatchService {
  static async initiateMatch(targetUserId: string): Promise<MatchResult>
  static async getUserMatches(): Promise<Match[]>
  static async hasExistingMatch(targetUserId: string): Promise<boolean>
}
```

**Fonctionnalités :**
- ✅ Authentification automatique
- ✅ Gestion d'erreurs complète
- ✅ Logs détaillés pour le debug
- ✅ Types TypeScript stricts

### Interfaces

```typescript
export interface MatchResult {
  success: boolean;
  message: string;
  match_id?: number;
}

export interface Match {
  id: number;
  id_user_initiator: string;
  id_user_receiver: string;
  date_initiation: string;
  is_accepted: boolean | null;
  is_closed: boolean;
  created_at: string;
}
```

## Composant UI

### MatchButton

Le composant `MatchButton` offre une interface moderne et intuitive :

**Props :**
```typescript
interface MatchButtonProps {
  profile: CompatibleProfile;
  onMatchSuccess?: (result: MatchResult) => void;
  onMatchError?: (error: string) => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}
```

**Fonctionnalités :**
- ✅ **États visuels** : Normal, chargement, succès, erreur
- ✅ **Animations** : Scale animation sur succès
- ✅ **Responsive** : Tailles et variantes configurables
- ✅ **Accessibilité** : Support des lecteurs d'écran
- ✅ **Feedback** : Alerts informatifs

**États du bouton :**
1. **Normal** : "Match 💕" (rose)
2. **Chargement** : "Envoi..." (avec spinner)
3. **Succès** : "Match envoyé ✓" (vert)
4. **Erreur** : Message d'erreur dans alert

## Intégration dans l'application

### 1. Page de détail du profil

Le bouton de match est intégré dans `profile-detail.tsx` :

```typescript
<MatchButton 
  profile={profileData}
  size="large"
  variant="primary"
  onMatchSuccess={(result) => {
    console.log('💕 ProfileDetail: Match successful:', result);
  }}
  onMatchError={(error) => {
    console.error('❌ ProfileDetail: Match error:', error);
  }}
/>
```

### 2. Cartes de profil

Le bouton est également intégré dans `ProfileCard.tsx` :

```typescript
<MatchButton 
  profile={profile}
  size="small"
  variant="primary"
  onMatchSuccess={(result) => {
    console.log('💕 ProfileCard: Match successful:', result);
  }}
  onMatchError={(error) => {
    console.error('❌ ProfileCard: Match error:', error);
  }}
/>
```

## Design et UX

### Palette de couleurs

- **Primary** : `#FF6B9D` (rose moderne)
- **Secondary** : `#F8F9FA` (gris clair)
- **Outline** : `#007AFF` (bleu iOS)
- **Success** : `#4CAF50` (vert)
- **Error** : `#F44336` (rouge)

### Animations

- **Scale animation** : Bouton grossit puis revient à la normale
- **Loading spinner** : Indicateur de chargement
- **Smooth transitions** : Transitions fluides entre états

### Responsive Design

- **Small** : 36px de hauteur (cartes)
- **Medium** : 44px de hauteur (défaut)
- **Large** : 52px de hauteur (pages détaillées)

## Tests

### Tests du service

Le fichier `matchService.test.ts` couvre :

- ✅ Initiation de match réussie
- ✅ Gestion des erreurs d'authentification
- ✅ Gestion des erreurs RPC
- ✅ Récupération des matches utilisateur
- ✅ Vérification des matches existants

### Tests du composant

Le fichier `MatchButton.test.tsx` couvre :

- ✅ Rendu avec différentes props
- ✅ Gestion des états (normal, chargement, succès)
- ✅ Gestion des erreurs
- ✅ Accessibilité et désactivation

## Bonnes pratiques implémentées

### 1. Sécurité

- ✅ **Fonction RPC** : Logique métier côté serveur
- ✅ **Validation** : Vérifications multiples avant création
- ✅ **Authentification** : Vérification de l'utilisateur connecté
- ✅ **Prévention des doublons** : Vérification des matches existants

### 2. Performance

- ✅ **Optimistic UI** : Feedback immédiat à l'utilisateur
- ✅ **Caching** : Vérification des matches existants
- ✅ **Lazy loading** : Chargement à la demande
- ✅ **Animations fluides** : 60fps sur tous les appareils

### 3. UX/UI

- ✅ **Feedback visuel** : États clairs et informatifs
- ✅ **Animations** : Transitions fluides et modernes
- ✅ **Accessibilité** : Support des lecteurs d'écran
- ✅ **Responsive** : Adaptation à toutes les tailles d'écran

### 4. Code Quality

- ✅ **TypeScript** : Types stricts et interfaces claires
- ✅ **Tests** : Couverture complète des tests
- ✅ **Documentation** : Code commenté et documentation
- ✅ **Error handling** : Gestion d'erreurs robuste

## Utilisation

### Exemple d'utilisation basique

```typescript
import MatchButton from '@/components/profile/MatchButton';

<MatchButton 
  profile={userProfile}
  onMatchSuccess={(result) => {
    console.log('Match créé:', result.match_id);
  }}
/>
```

### Exemple d'utilisation avancée

```typescript
<MatchButton 
  profile={userProfile}
  size="large"
  variant="outline"
  onMatchSuccess={(result) => {
    // Navigation vers la page de match
    router.push(`/matches/${result.match_id}`);
  }}
  onMatchError={(error) => {
    // Affichage d'une notification d'erreur
    showErrorNotification(error);
  }}
/>
```

## Évolutions futures

### 1. Fonctionnalités à ajouter

- **Notifications push** : Notifications en temps réel
- **Chat intégré** : Messagerie après match
- **Filtres avancés** : Critères de compatibilité
- **Statistiques** : Analytics des matches

### 2. Optimisations

- **Cache intelligent** : Mise en cache des profils
- **Pagination** : Chargement progressif
- **Offline support** : Mode hors ligne
- **Real-time updates** : Mises à jour en temps réel

## Dépannage

### Erreurs communes

**"User not authenticated"** :
- Vérifier que l'utilisateur est connecté
- Vérifier la configuration Supabase
- Redémarrer l'application

**"Match already exists"** :
- Vérifier qu'il n'y a pas déjà un match
- Nettoyer le cache local
- Vérifier la base de données

**"Profile not found"** :
- Vérifier que le profil existe
- Vérifier les permissions Supabase
- Vérifier la configuration RLS

### Debug

Activer les logs pour le debug :

```typescript
// Dans le service
console.log('💕 MatchService: Initiating match with user:', targetUserId);

// Dans le composant
console.log('💕 MatchButton: Match successful:', result);
```

## Support

Pour toute question ou problème :
1. Consulter cette documentation
2. Vérifier les logs de l'application
3. Consulter la documentation Supabase
4. Contacter l'équipe de développement

## Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [React Native Animations](https://reactnative.dev/docs/animated)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing](https://jestjs.io/docs/getting-started) 