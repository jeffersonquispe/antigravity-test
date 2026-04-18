import { useState, useCallback } from 'react';
import { swipeService } from '../services/swipeService';
import { SwipeType } from '../types/swipe.types';
import { TMDBMovie } from '../types/tmdb.types';

export function useSwipeRecord() {
  const [error, setError] = useState<{ message: string; solution: string } | null>(null);

  const recordSwipe = useCallback(async (movie: TMDBMovie, type: SwipeType) => {
    try {
      setError(null);
      const user_id = 'c101683d-3644-411a-85d1-d2a933391b4c'; 

      const result = await swipeService.recordSwipe({
        user_id,
        movie_id: movie.id,
        movie_title: movie.title || movie.original_title,
        movie_poster_url: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
          : null,
        swipe_type: type
      });

      if (!result) {
        setError({
          message: 'No se pudo sincronizar con la base de datos.',
          solution: 'Verifica que la URL en el .env sea correcta y que hayas ejecutado el archivo supabase/schema.sql en tu dashboard.'
        });
      }
    } catch (err: any) {
      setError({
        message: `Error de conexión: ${err.message}`,
        solution: 'Asegúrate de tener conexión a internet y de que tu proyecto de Supabase no esté pausado.'
      });
    }
  }, []);

  return { recordSwipe, error, clearError: () => setError(null) };
}
