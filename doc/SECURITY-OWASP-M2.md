# Vérification OWASP M2 – Inadequate Supply Chain Security

Après analyse du code fourni :

- Toutes les dépendances tierces sont déclarées explicitement dans `package.json` et sont des librairies open source reconnues.
- Aucune dépendance n’est téléchargée ou chargée dynamiquement à l’exécution.
- Le processus de build et de distribution est sécurisé via EAS (Expo Application Services), avec signature et distribution contrôlées.
- Des tests unitaires, du linting et des workflows CI/CD sont présents pour détecter les vulnérabilités et garantir la qualité du code.
- Les mises à jour et correctifs sont appliqués via des canaux sûrs (npm/yarn, EAS Update).
- Aucun code tiers obscur ou non maintenu n’est utilisé.

**Aucune modification n’est nécessaire pour la règle OWASP M2.**
