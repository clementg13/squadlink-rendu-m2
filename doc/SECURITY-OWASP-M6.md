# Vérification OWASP M6 – Inadequate Privacy Controls

## Analyse du code fourni (mise à jour) :

- **Collecte de données personnelles** : seules les données strictement nécessaires sont collectées (profil, email, localisation, etc.).
- **Transmission sécurisée** : toutes les PII sont transmises via des canaux sécurisés (HTTPS/TLS).
- **Logs et erreurs** : aucune PII n’est loggée dans les logs applicatifs ou transmise dans les messages d’erreur.
- **URL** : aucune PII n’est transmise dans les URL (query params).
- **Presse-papier et autres apps** : les données PII ne sont pas copiées dans le presse-papier ni exposées à d’autres apps.
- **Stockage** : les données sont stockées dans le sandbox de l’app, sans backup non chiffré géré par l’app.
- **Authentification** : l’accès aux PII est protégé par authentification.
- **Information utilisateur** : l’utilisateur est informé lors de l’inscription, et une politique de confidentialité ainsi que des conditions d’utilisation sont désormais accessibles dans l’onboarding et depuis le profil.
- **Suppression des données** : la suppression des données personnelles à la demande est implémentée via la fonctionnalité de suppression de compte.

## Conclusion

**La règle OWASP M6 est respectée** :  
- Les contrôles de confidentialité sont en place et accessibles à l’utilisateur (CGU et politique de confidentialité).
- La suppression de compte/PII est disponible.
- Aucun flux ou stockage non sécurisé de PII n’a été détecté.

**Aucune modification supplémentaire n’est nécessaire pour la conformité à OWASP M6.**
