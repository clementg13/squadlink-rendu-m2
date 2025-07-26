import { useState, useEffect, useCallback } from 'react';
import { CompatibleProfileService, EnrichedCompatibleProfile } from '@/services/compatibleProfileService';

interface UseEnrichedCompatibleProfilesState {
  profiles: EnrichedCompatibleProfile[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
  isEmpty: boolean;
}

export function useEnrichedCompatibleProfiles(userId: string | null, pageSize: number = 10) {
  const [state, setState] = useState<UseEnrichedCompatibleProfilesState>({
    profiles: [],
    loading: false,
    error: null,
    hasMore: true,
    totalCount: 0,
    currentPage: 0,
    isEmpty: false,
  });

  // Chargement initial
  const loadInitial = useCallback(async () => {
    if (!userId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await CompatibleProfileService.getEnrichedCompatibleProfiles(
        userId,
        { page_offset: 0, page_size: pageSize }
      );

      setState(prev => ({
        ...prev,
        profiles: response.profiles,
        loading: false,
        hasMore: response.has_more,
        totalCount: response.total_count,
        currentPage: response.current_page,
        isEmpty: response.profiles.length === 0,
      }));

      console.log('✅ useEnrichedCompatibleProfiles: Profils initiaux chargés:', response.profiles.length);
    } catch (error) {
      console.error('❌ useEnrichedCompatibleProfiles: Erreur chargement initial:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        isEmpty: true,
      }));
    }
  }, [userId, pageSize]);

  // Charger plus de profils (pagination)
  const loadMore = useCallback(async () => {
    if (!userId || state.loading || !state.hasMore) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const nextOffset = (state.currentPage + 1) * pageSize;
      const response = await CompatibleProfileService.getEnrichedCompatibleProfiles(
        userId,
        { page_offset: nextOffset, page_size: pageSize }
      );

      setState(prev => ({
        ...prev,
        profiles: [...prev.profiles, ...response.profiles],
        loading: false,
        hasMore: response.has_more,
        currentPage: response.current_page,
      }));

      console.log('✅ useEnrichedCompatibleProfiles: Plus de profils chargés:', response.profiles.length);
    } catch (error) {
      console.error('❌ useEnrichedCompatibleProfiles: Erreur chargement pagination:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      }));
    }
  }, [userId, pageSize, state.loading, state.hasMore, state.currentPage]);

  // Actualiser la liste (pull-to-refresh)
  const refresh = useCallback(async () => {
    if (!userId) return;

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      currentPage: 0,
      hasMore: true,
    }));

    try {
      const response = await CompatibleProfileService.getEnrichedCompatibleProfiles(
        userId,
        { page_offset: 0, page_size: pageSize }
      );

      setState(prev => ({
        ...prev,
        profiles: response.profiles,
        loading: false,
        hasMore: response.has_more,
        totalCount: response.total_count,
        currentPage: response.current_page,
        isEmpty: response.profiles.length === 0,
      }));

      console.log('✅ useEnrichedCompatibleProfiles: Liste actualisée:', response.profiles.length);
    } catch (error) {
      console.error('❌ useEnrichedCompatibleProfiles: Erreur actualisation:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        isEmpty: prev.profiles.length === 0,
      }));
    }
  }, [userId, pageSize]);

  // Effet pour le chargement initial
  useEffect(() => {
    if (userId) {
      loadInitial();
    } else {
      // Réinitialiser l'état si pas d'utilisateur
      setState({
        profiles: [],
        loading: false,
        error: null,
        hasMore: true,
        totalCount: 0,
        currentPage: 0,
        isEmpty: false,
      });
    }
  }, [loadInitial, userId]);

  return {
    profiles: state.profiles,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    totalCount: state.totalCount,
    isEmpty: state.isEmpty,
    loadMore,
    refresh,
  };
} 