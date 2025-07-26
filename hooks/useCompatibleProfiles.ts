import { useState, useEffect, useCallback } from 'react';
import { ProfileService } from '@/services/profileService';
import { CompatibleProfilesState } from '@/types/profile';

/**
 * Hook personnalisé pour gérer les profils compatibles avec lazy loading
 */
export const useCompatibleProfiles = (currentUserId: string | null, pageSize: number = 10) => {
  const [state, setState] = useState<CompatibleProfilesState>({
    profiles: [],
    loading: false,
    error: null,
    hasMore: true,
    totalCount: 0,
    currentPage: 0
  });

  /**
   * Charge la première page des profils compatibles
   */
  const loadInitialProfiles = useCallback(async () => {
    if (!currentUserId) {
      setState(prev => ({
        ...prev,
        profiles: [],
        loading: false,
        error: 'Utilisateur non connecté',
        hasMore: false
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await ProfileService.getCompatibleProfiles(currentUserId, {
        page_offset: 0,
        page_size: pageSize
      });

      setState(prev => ({
        ...prev,
        profiles: response.profiles,
        loading: false,
        hasMore: response.has_more,
        totalCount: response.total_count,
        currentPage: 0,
        error: null
      }));

    } catch (error) {
      console.error('❌ Erreur lors du chargement initial des profils:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        hasMore: false
      }));
    }
  }, [currentUserId, pageSize]);

  /**
   * Charge la page suivante des profils (lazy loading)
   */
  const loadMoreProfiles = useCallback(async () => {
    if (!currentUserId || state.loading || !state.hasMore) {
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const nextOffset = (state.currentPage + 1) * pageSize;
      const response = await ProfileService.getCompatibleProfiles(currentUserId, {
        page_offset: nextOffset,
        page_size: pageSize
      });

      setState(prev => ({
        ...prev,
        profiles: [...prev.profiles, ...response.profiles],
        loading: false,
        hasMore: response.has_more,
        currentPage: prev.currentPage + 1,
        error: null
      }));

    } catch (error) {
      console.error('❌ Erreur lors du chargement de profils supplémentaires:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur lors du chargement'
      }));
    }
  }, [currentUserId, pageSize, state.loading, state.hasMore, state.currentPage]);

  /**
   * Rafraîchit complètement la liste des profils
   */
  const refreshProfiles = useCallback(async () => {
    if (!currentUserId) return;

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      profiles: [],
      currentPage: 0,
      hasMore: true
    }));

    try {
      const response = await ProfileService.refreshCompatibleProfiles(currentUserId, pageSize);

      setState(prev => ({
        ...prev,
        profiles: response.profiles,
        loading: false,
        hasMore: response.has_more,
        totalCount: response.total_count,
        currentPage: 0,
        error: null
      }));

    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement des profils:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur lors du rafraîchissement'
      }));
    }
  }, [currentUserId, pageSize]);

  /**
   * Charge les profils initiaux quand le hook est monté ou que l'utilisateur change
   */
  useEffect(() => {
    loadInitialProfiles();
  }, [loadInitialProfiles]);

  return {
    profiles: state.profiles,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    totalCount: state.totalCount,
    loadMore: loadMoreProfiles,
    refresh: refreshProfiles,
    isEmpty: state.profiles.length === 0 && !state.loading
  };
}; 