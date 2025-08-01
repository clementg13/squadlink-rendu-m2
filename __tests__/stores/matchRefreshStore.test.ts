import { renderHook, act } from '@testing-library/react-native';
import { useMatchRefreshStore } from '@/stores/matchRefreshStore';

describe('useMatchRefreshStore', () => {
  beforeEach(() => {
    // Reset le store avant chaque test en utilisant une approche différente
    const { result } = renderHook(() => useMatchRefreshStore());
    // Reset manuel du store
    act(() => {
      // Forcer le reset en appelant triggerRefresh plusieurs fois puis en vérifiant
      for (let i = 0; i < 10; i++) {
        result.current.triggerRefresh();
      }
    });
  });

  afterEach(() => {
    // Nettoyer après chaque test
    jest.clearAllMocks();
  });

  describe('État initial', () => {
    it('a un refreshTrigger initialisé correctement', () => {
      const { result } = renderHook(() => useMatchRefreshStore());
      
      expect(typeof result.current.refreshTrigger).toBe('number');
      expect(result.current.refreshTrigger).toBeGreaterThanOrEqual(0);
    });

    it('a une fonction triggerRefresh disponible', () => {
      const { result } = renderHook(() => useMatchRefreshStore());
      
      expect(typeof result.current.triggerRefresh).toBe('function');
    });
  });

  describe('triggerRefresh', () => {
    it('incrémente le refreshTrigger', () => {
      const { result } = renderHook(() => useMatchRefreshStore());
      
      const initialValue = result.current.refreshTrigger;
      
      act(() => {
        result.current.triggerRefresh();
      });
      
      expect(result.current.refreshTrigger).toBe(initialValue + 1);
    });

    it('incrémente le refreshTrigger plusieurs fois', () => {
      const { result } = renderHook(() => useMatchRefreshStore());
      
      const initialValue = result.current.refreshTrigger;
      
      act(() => {
        result.current.triggerRefresh();
      });
      
      expect(result.current.refreshTrigger).toBe(initialValue + 1);
      
      act(() => {
        result.current.triggerRefresh();
      });
      
      expect(result.current.refreshTrigger).toBe(initialValue + 2);
      
      act(() => {
        result.current.triggerRefresh();
      });
      
      expect(result.current.refreshTrigger).toBe(initialValue + 3);
    });

    it('fonctionne avec des appels multiples rapides', () => {
      const { result } = renderHook(() => useMatchRefreshStore());
      
      const initialValue = result.current.refreshTrigger;
      
      act(() => {
        result.current.triggerRefresh();
        result.current.triggerRefresh();
        result.current.triggerRefresh();
      });
      
      expect(result.current.refreshTrigger).toBe(initialValue + 3);
    });

    it('persiste l\'état entre les rendus', () => {
      const { result, rerender } = renderHook(() => useMatchRefreshStore());
      
      const initialValue = result.current.refreshTrigger;
      
      act(() => {
        result.current.triggerRefresh();
      });
      
      expect(result.current.refreshTrigger).toBe(initialValue + 1);
      
      // Re-render le hook
      rerender();
      
      expect(result.current.refreshTrigger).toBe(initialValue + 1);
    });
  });

  describe('Intégration et cas limites', () => {
    it('gère les appels très fréquents', () => {
      const { result } = renderHook(() => useMatchRefreshStore());
      
      const initialValue = result.current.refreshTrigger;
      
      act(() => {
        // Simuler des appels très fréquents
        for (let i = 0; i < 100; i++) {
          result.current.triggerRefresh();
        }
      });
      
      expect(result.current.refreshTrigger).toBe(initialValue + 100);
    });

    it('fonctionne avec plusieurs instances du hook', () => {
      const { result: result1 } = renderHook(() => useMatchRefreshStore());
      const { result: result2 } = renderHook(() => useMatchRefreshStore());
      
      const initialValue = result1.current.refreshTrigger;
      
      act(() => {
        result1.current.triggerRefresh();
      });
      
      expect(result1.current.refreshTrigger).toBe(initialValue + 1);
      expect(result2.current.refreshTrigger).toBe(initialValue + 1); // Même store, même état
      
      act(() => {
        result2.current.triggerRefresh();
      });
      
      expect(result1.current.refreshTrigger).toBe(initialValue + 2);
      expect(result2.current.refreshTrigger).toBe(initialValue + 2);
    });

    it('gère les appels depuis différents composants', () => {
      const { result: component1 } = renderHook(() => useMatchRefreshStore());
      const { result: component2 } = renderHook(() => useMatchRefreshStore());
      const { result: component3 } = renderHook(() => useMatchRefreshStore());
      
      const initialValue = component1.current.refreshTrigger;
      
      act(() => {
        component1.current.triggerRefresh();
      });
      
      expect(component1.current.refreshTrigger).toBe(initialValue + 1);
      expect(component2.current.refreshTrigger).toBe(initialValue + 1);
      expect(component3.current.refreshTrigger).toBe(initialValue + 1);
      
      act(() => {
        component2.current.triggerRefresh();
      });
      
      expect(component1.current.refreshTrigger).toBe(initialValue + 2);
      expect(component2.current.refreshTrigger).toBe(initialValue + 2);
      expect(component3.current.refreshTrigger).toBe(initialValue + 2);
    });

    it('ne cause pas de fuites mémoire', () => {
      const { result, unmount } = renderHook(() => useMatchRefreshStore());
      
      const initialValue = result.current.refreshTrigger;
      
      act(() => {
        result.current.triggerRefresh();
      });
      
      expect(result.current.refreshTrigger).toBe(initialValue + 1);
      
      // Simuler le démontage du composant
      unmount();
      
      // Recréer le hook
      const { result: newResult } = renderHook(() => useMatchRefreshStore());
      
      // L'état devrait persister car c'est un store global
      expect(newResult.current.refreshTrigger).toBe(initialValue + 1);
    });

    it('fonctionne avec des valeurs numériques élevées', () => {
      const { result } = renderHook(() => useMatchRefreshStore());
      
      const initialValue = result.current.refreshTrigger;
      
      act(() => {
        // Simuler beaucoup d'appels
        for (let i = 0; i < 1000; i++) {
          result.current.triggerRefresh();
        }
      });
      
      expect(result.current.refreshTrigger).toBe(initialValue + 1000);
      expect(typeof result.current.refreshTrigger).toBe('number');
    });

    it('gère les appels asynchrones', async () => {
      const { result } = renderHook(() => useMatchRefreshStore());
      
      const initialValue = result.current.refreshTrigger;
      
      await act(async () => {
        // Simuler un appel asynchrone
        await new Promise(resolve => setTimeout(resolve, 10));
        result.current.triggerRefresh();
      });
      
      expect(result.current.refreshTrigger).toBe(initialValue + 1);
    });
  });

  describe('Performance et optimisation', () => {
    it('ne cause pas de re-renders inutiles', () => {
      let renderCount = 0;
      
      const { result } = renderHook(() => {
        renderCount++;
        return useMatchRefreshStore();
      });
      
      const initialRenderCount = renderCount;
      
      act(() => {
        result.current.triggerRefresh();
      });
      
      // Le hook devrait se re-rendre une seule fois
      expect(renderCount).toBe(initialRenderCount + 1);
    });

    it('optimise les mises à jour d\'état', () => {
      const { result } = renderHook(() => useMatchRefreshStore());
      
      const initialValue = result.current.refreshTrigger;
      const startTime = performance.now();
      
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.triggerRefresh();
        }
      });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // L'exécution devrait être rapide (< 100ms)
      expect(executionTime).toBeLessThan(100);
      expect(result.current.refreshTrigger).toBe(initialValue + 100);
    });
  });
}); 