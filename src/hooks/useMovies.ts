import { useState, useEffect, useRef, useCallback } from 'react';
import { TMDBDiscoverResponse, TMDBMovie } from '../types/tmdb.types';

// ==========================================
// CONSTANTES Y TIPOS
// ==========================================
const BASE_URL = 'https://api.themoviedb.org/3';
const CACHE_TTL = 5 * 60 * 1000;

interface CacheItem {
  timestamp: number;
  data: TMDBDiscoverResponse;
}

export interface UseMoviesOptions {
  genreId?: number;
  year?: number;
}

interface UseMoviesReturn {
  movies: TMDBMovie[];
  loading: boolean;
  error: string | null;
  loadMore: () => void;
  hasMore: boolean;
}

// ==========================================
// HELPER: VALIDACIÓN DE RESPUESTA
// ==========================================
function isValidTMDBResponse(data: unknown): data is TMDBDiscoverResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'page' in data &&
    'results' in data &&
    Array.isArray((data as any).results)
  );
}

// ==========================================
// HOOK SECUNDARIO 1: GESTIÓN DE CACHÉ
// ==========================================
function useMovieCache() {
  const getCache = useCallback((key: string): TMDBDiscoverResponse | null => {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;

    try {
      const parsed: CacheItem = JSON.parse(cached);
      const isFresh = Date.now() - parsed.timestamp < CACHE_TTL;
      if (isFresh) return parsed.data;
      
      sessionStorage.removeItem(key);
      return null;
    } catch {
      sessionStorage.removeItem(key);
      return null;
    }
  }, []);

  const setCache = useCallback((key: string, data: TMDBDiscoverResponse) => {
    sessionStorage.setItem(key, JSON.stringify({
      timestamp: Date.now(),
      data
    }));
  }, []);

  return { getCache, setCache };
}

// ==========================================
// HOOK SECUNDARIO 2: SOLICITUDES DE RED
// ==========================================
function useMovieFetch() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const performFetch = useCallback(async (url: string, signal?: AbortSignal) => {
    const response = await fetch(url, { signal });
    
    if (!response.ok) {
      if (response.status === 401) throw new Error('API Key inválida');
      if (response.status === 429) throw new Error('Rate limit excedido');
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();
    if (!isValidTMDBResponse(data)) {
      throw new Error('Respuesta de API corrupta');
    }
    return data;
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  }, []);

  return { performFetch, cancelRequest };
}

// ==========================================
// HOOK PRINCIPAL: ORQUESTADOR
// ==========================================
/**
 * Hook principal para obtener películas.
 * Orquesta la lógica de caché y red dividida en sub-hooks.
 */
export function useMovies(options: UseMoviesOptions = {}): UseMoviesReturn {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const { getCache, setCache } = useMovieCache();
  const { performFetch, cancelRequest } = useMovieFetch();

  // Reset al cambiar filtros
  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
  }, [options.genreId, options.year]);

  const loadMovies = useCallback(async () => {
    if (!hasMore) return;

    setLoading(true);
    setError(null);
    const signal = cancelRequest();

    try {
      const apiKey = (import.meta as any).env.VITE_TMDB_KEY;
      const params = new URLSearchParams({
        page: page.toString(),
        api_key: apiKey,
        language: 'es-ES',
        sort_by: 'popularity.desc'
      });

      if (options.genreId) params.append('with_genres', options.genreId.toString());
      if (options.year) params.append('primary_release_year', options.year.toString());

      const cacheKey = `movies_${options.genreId || 'all'}_${options.year || 'all'}_p${page}`;
      const url = `${BASE_URL}/discover/movie?${params.toString()}`;

      // 1. Intentar Caché
      const cachedData = getCache(cacheKey);
      if (cachedData) {
        setMovies(prev => page === 1 ? cachedData.results : [...prev, ...cachedData.results]);
        setHasMore(cachedData.page < cachedData.total_pages);
        setLoading(false);
        return;
      }

      // 2. Intentar Red
      const data = await performFetch(url, signal);
      
      // 3. Guardar en Caché y Estado
      setCache(cacheKey, data);
      setMovies(prev => page === 1 ? data.results : [...prev, ...data.results]);
      setHasMore(data.page < data.total_pages);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Error desconocido');
      }
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [page, options.genreId, options.year, hasMore, cancelRequest, getCache, setCache, performFetch]);

  useEffect(() => {
    loadMovies();
    return () => { cancelRequest(); };
  }, [loadMovies, cancelRequest]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) setPage(p => p + 1);
  }, [loading, hasMore]);

  return { movies, loading, error, loadMore, hasMore };
}
