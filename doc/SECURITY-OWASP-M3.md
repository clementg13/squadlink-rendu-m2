# Vérification OWASP M3 – Insecure Authentication/Authorization

Après analyse du code fourni :

- Toutes les actions sensibles nécessitent une authentification côté serveur (Supabase Auth).
- Les tokens de session sont utilisés pour chaque requête, aucune API n’est accessible anonymement.
- Les rôles/permissions ne sont jamais transmis par le client : tout contrôle d’accès est fait côté serveur.
- Les mots de passe ne sont jamais stockés localement, ni transmis en clair.
- La politique de mot de passe impose un minimum de 6 caractères (pas de PIN faible).
- Les accès aux données sont toujours filtrés par l’ID utilisateur issu de la session (pas d’IDOR possible).
- Toute la logique d’authentification et d’autorisation est renforcée côté serveur (RLS, RPC).
- Aucune authentification offline ou locale n’est implémentée.

**Aucune modification n’est nécessaire pour la règle OWASP M3.**
