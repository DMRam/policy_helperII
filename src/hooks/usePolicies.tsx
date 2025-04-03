import { useQuery } from '@tanstack/react-query';
import { fetchPolicies } from '../services/policyService';
import { useAuth } from '../context/useAuth';

/**
 * Custom hook to fetch policies with proper authentication handling
 */
export const usePolicies = (query?: string) => {
  const { isAuthenticated } = useAuth();

  console.debug('usePolicies:', { isAuthenticated, query });
  // Check if the user is authenticated
  if (!isAuthenticated) {
    console.warn('User is not authenticated, skipping policy fetch');
    return {
      data: undefined,
      isLoading: false,
      error: new Error('Not authenticated'),
    };
  }
  return useQuery({
    queryKey: ['policies', query, isAuthenticated], // Include auth state in query key
    queryFn: async () => {
      // Clear cache if not authenticated
      if (!isAuthenticated) {
        clearPoliciesCache(query);
        throw new Error('Not authenticated');
      }

      const cacheKey = query ? `policies-${query}` : 'policies';
      
      // Only use cache if authenticated
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData && isAuthenticated) {
        const parsedCache = JSON.parse(cachedData);
        const cacheAge = Date.now() - parsedCache.timestamp;

        if (cacheAge < 86400000) { // 24 hours
          console.debug('[Cache] Returning cached policies');
          return parsedCache.data;
        }
        localStorage.removeItem(cacheKey);
      }

      console.debug('[Cache] Fetching fresh policies');
      const freshData = await fetchPolicies(
        query ? parseInt(query, 10) : undefined,
        1000
      );

      // Only cache if authenticated
      if (isAuthenticated) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            data: freshData,
            timestamp: Date.now()
          }));
        } catch (error) {
          console.error('[Cache] Failed to update localStorage:', error);
        }
      }

      return freshData;
    },
    staleTime: 86400000,
    gcTime: 86400000,
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
    enabled: isAuthenticated, // Only fetch when authenticated
    placeholderData: undefined // Disable placeholder data
  });
};

// Helper function to clear cache
const clearPoliciesCache = (query?: string) => {
  const cacheKey = query ? `policies-${query}` : 'policies';
  localStorage.removeItem(cacheKey);
};