// Polyfill pour structuredClone qui n'existe pas dans React Native
// Requis pour Supabase JS v2

// Vérifier si structuredClone existe déjà
if (typeof globalThis.structuredClone === 'undefined') {
  // Polyfill simple utilisant JSON.parse/stringify
  // Note: Cette implémentation ne gère pas tous les cas comme les objets complexes,
  // mais elle est suffisante pour les besoins de Supabase
  globalThis.structuredClone = function structuredClone(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    // Gestion des types primitifs et des objets simples
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
      return obj.map((item: any): any => structuredClone(item));
    }
    
    if (typeof obj === 'object') {
      const cloned: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = structuredClone(obj[key]);
        }
      }
      return cloned;
    }
    
    return obj;
  };
}

// Polyfill pour d'autres fonctions manquantes si nécessaire
if (typeof globalThis.crypto === 'undefined') {
  // Polyfill basique pour crypto (pour les UUID)
  globalThis.crypto = {
    getRandomValues: (arr: any): any => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  } as any;
}

export {}; // Pour faire de ce fichier un module 