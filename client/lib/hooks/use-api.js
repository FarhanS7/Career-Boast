"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

/**
 * Custom hook for API calls with loading/error states
 * Pattern: Async State Management Hook
 * 
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} { data, loading, error, execute, reset }
 */
export function useApi(apiFunction, options = {}) {
  const {
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = "Success!",
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);

        const result = await apiFunction(...args);
        setData(result);

        if (showSuccessToast) {
          toast.success(successMessage);
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        setError(err);

        if (showErrorToast) {
          toast.error(err.message || "An error occurred");
        }

        if (onError) {
          onError(err);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onSuccess, onError, showSuccessToast, showErrorToast, successMessage]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

/**
 * Hook for fetching data on mount with caching
 * Pattern: Data Fetching Hook with Cache
 * 
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} { data, loading, error, refetch }
 */
export function useFetch(apiFunction, options = {}) {
  const { enabled = true, cacheKey } = options;
  const [data, setData] = useState(() => {
    // Check cache if cacheKey provided
    if (typeof window !== "undefined" && cacheKey) {
      const cached = sessionStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : null;
    }
    return null;
  });
  const [loading, setLoading] = useState(!data && enabled);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await apiFunction();
      setData(result);

      // Cache if cacheKey provided
      if (typeof window !== "undefined" && cacheKey) {
        sessionStorage.setItem(cacheKey, JSON.stringify(result));
      }

      return result;
    } catch (err) {
      setError(err);
      toast.error(err.message || "Failed to fetch data");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, cacheKey]);

  // Fetch on mount if enabled
  useState(() => {
    if (enabled && !data) {
      fetchData();
    }
  }, [enabled, data, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
