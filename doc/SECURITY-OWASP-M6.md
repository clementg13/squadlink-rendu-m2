# Vérification OWASP M6 – Inadequate Privacy Controls

Après analyse du code fourni :

- Seules les données personnelles strictement nécessaires sont collectées (profil, email, localisation, etc.).
- Toutes les PII sont transmises via des canaux sécurisés (HTTPS/TLS).
- Aucune PII n’est loggée dans les logs applicatifs ou transmise dans les messages d’erreur.
- Aucune PII n’est transmise dans les URL (query params).
- Les données PII ne sont pas copiées dans le presse-papier ni exposées à d’autres apps.
- Les données sont stockées dans le sandbox de l’app, sans backup non chiffré géré par l’app.
- L’accès aux PII est protégé par authentification.
- L’utilisateur est informé lors de l’inscription ; il est recommandé d’ajouter une politique de confidentialité accessible.
- La suppression des données personnelles à la demande n’est pas explicitement implémentée : à prévoir pour la conformité RGPD.

**Aucune modification n’est nécessaire pour la règle OWASP M6, mais il est recommandé d’ajouter une politique de confidentialité accessible et une fonctionnalité de suppression de compte/PII pour une conformité totale.**
