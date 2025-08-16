# Vérification OWASP M5 – Insecure Communication

Après analyse du code fourni :

- Toutes les communications réseau passent par HTTPS/TLS (jamais de HTTP ou de canaux non chiffrés).
- Les SDK utilisés (Supabase, Expo, React Native) appliquent TLS par défaut et n’acceptent pas de certificats invalides en production.
- Aucune donnée sensible n’est transmise via des canaux non sécurisés (SMS, Bluetooth, NFC, etc.).
- Aucun code ne désactive la vérification des certificats ou n’accepte de certificats auto-signés en production.
- Aucun protocole faible ou obsolète n’est utilisé pour la communication réseau.
- Les identifiants, tokens et données personnelles sont toujours transmis via TLS.

**Aucune modification n’est nécessaire pour la règle OWASP M5.**
