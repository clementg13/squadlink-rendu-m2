# Vérification OWASP M1 – Improper Credential Usage

Après analyse du code fourni :

- Aucun credential (identifiant, mot de passe, clé API) n'est codé en dur dans le code source ou les fichiers de configuration.
- Les credentials utilisateurs ne sont jamais stockés localement sur l'appareil.
- La transmission des credentials se fait via Supabase (HTTPS/TLS).
- L'authentification repose sur Supabase Auth, sans protocole faible ni bypass possible côté client.
- Les clés API sont chargées via des variables d'environnement et ne sont pas exposées dans le code client.

**Aucune modification n'est nécessaire pour la règle OWASP M1.**
