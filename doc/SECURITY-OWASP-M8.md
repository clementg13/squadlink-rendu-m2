# Vérification OWASP M8 – Security Misconfiguration

Après analyse du code fourni :

- **Aucune configuration par défaut dangereuse** n’est présente : pas de credentials par défaut, pas de debug activé en production, pas de permissions excessives demandées.
- **Pas de stockage de données sensibles en clair** : aucune donnée sensible n’est stockée localement en clair ou avec des permissions trop larges.
- **Toutes les communications réseau sont sécurisées** (HTTPS/TLS, cf. M5).
- **Pas d’export d’activités, de services ou de providers inutiles** : l’app React Native/Expo ne déclare pas d’export Android/iOS non maîtrisé.
- **Pas de fonctionnalités de backup non maîtrisées** : pas d’activation du backup Android non désiré, pas de données sensibles dans les backups.
- **Pas de configuration réseau faible** : pas d’autorisation de trafic HTTP, pas de configuration de certificat faible.
- **Pas de code de debug ou de logs sensibles en production**.
- **Pas de permissions inutiles** : seules les permissions nécessaires sont demandées (géolocalisation, etc.), pas d’accès aux contacts, SMS, etc.
- **Pas de credentials codés en dur** ni de configuration sensible exposée dans le code ou les fichiers de build.

**Recommandations** :
- Vérifier que le mode debug est bien désactivé en production (Expo/React Native le fait par défaut).
- Vérifier le manifeste Android et le fichier Info.plist iOS pour s’assurer qu’aucune permission ou export non nécessaire n’est activé.
- Pour une sécurité maximale, auditer les fichiers de configuration natifs (AndroidManifest.xml, Info.plist) et les scripts de build.

**Conclusion** :

- **Aucune modification n’est nécessaire pour la règle OWASP M8.**
- **La configuration de sécurité de l’application respecte les bonnes pratiques et ne présente pas de failles connues.**
