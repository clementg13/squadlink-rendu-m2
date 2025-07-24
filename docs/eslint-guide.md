# ESLint Configuration

Ce projet utilise ESLint pour maintenir la qualité du code et assurer la cohérence du style de codage.

## Configuration

La configuration ESLint est définie dans `eslint.config.js` et inclut :

- **@typescript-eslint** : Règles spécifiques à TypeScript
- **eslint-plugin-react** : Règles pour React
- **eslint-plugin-react-hooks** : Règles pour les hooks React
- **eslint-plugin-react-native** : Règles spécifiques à React Native

## Scripts disponibles

### `npm run lint`
Exécute ESLint sur tous les fichiers du projet et affiche les erreurs et avertissements.

### `npm run lint:fix`
Exécute ESLint et corrige automatiquement les problèmes qui peuvent l'être.

### `npm run lint:check`
Exécute ESLint en mode strict (aucun avertissement autorisé). Utile pour les pipelines CI/CD.

### `npm run type-check`
Vérifie les types TypeScript sans générer de fichiers de sortie.

## Intégration VS Code

La configuration VS Code est automatiquement définie dans `.vscode/settings.json` pour :

- Activer ESLint dans l'éditeur
- Corriger automatiquement les problèmes à la sauvegarde
- Utiliser ESLint comme formateur par défaut pour les fichiers TypeScript/JavaScript

## Règles configurées

### Règles TypeScript
- Variables non utilisées détectées (sauf celles commençant par `_`)
- Utilisation d'`any` découragée mais autorisée avec avertissement
- Fonctions sans type de retour explicite autorisées

### Règles React
- `React` n'a pas besoin d'être importé (React 17+)
- PropTypes désactivés (utilisation de TypeScript)
- Règles des hooks appliquées

### Règles React Native
- Styles non utilisés détectés
- Styles inline autorisés en développement
- Couleurs littérales autorisées en développement

## Fichiers ignorés

Les fichiers suivants sont automatiquement ignorés par ESLint :
- `node_modules/`
- `android/` et `ios/` (builds natifs)
- `.expo/` (cache Expo)
- Fichiers de configuration (`.config.js`, etc.)
- Tests (`__tests__/`, `*.test.*`, `*.spec.*`)

## Conseils d'utilisation

1. **Avant de commiter** : Exécutez `npm run lint:fix` pour corriger automatiquement les problèmes
2. **Variables non utilisées** : Préfixez-les avec `_` pour éviter les erreurs (ex: `_unusedVar`)
3. **Types any** : Essayez de les remplacer par des types plus spécifiques quand possible
4. **Console.log** : Autorisés en développement, pensez à les retirer en production

## Résolution des problèmes courants

### Variables non utilisées
```typescript
// ❌ Erreur
const unusedVariable = getValue();

// ✅ OK
const _unusedVariable = getValue();
```

### Dépendances manquantes dans useEffect
```typescript
// ❌ Avertissement
useEffect(() => {
  doSomething();
}, []); // dépendance manquante

// ✅ OK
useEffect(() => {
  doSomething();
}, [doSomething]);
```

### Types any
```typescript
// ❌ Avertissement
const data: any = getData();

// ✅ Mieux
interface ApiResponse {
  id: string;
  name: string;
}
const data: ApiResponse = getData();
```
