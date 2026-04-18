import React, { useState, useCallback, useMemo } from 'react';
import { useMovies } from '../../hooks/useMovies';
import { useSwipeRecord } from '../../hooks/useSwipeRecord';
import { SwipeCard } from '../../components/swipe/SwipeCard';
import { useMovieActions, useMovieHistory } from '../../context/movies/MovieContext';
import { TMDBMovie } from '../../types/tmdb.types';

export const Discovery: React.FC = () => {
  const { movies, loading, error, loadMore, hasMore } = useMovies();
  const { recordSwipe, error: syncError, clearError } = useSwipeRecord();
  const dispatch = useMovieActions();
  const historyState = useMovieHistory();
  
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentMovie = movies[currentIndex] as TMDBMovie | undefined;

  const movieWithAbsoluteUrl = useMemo(() => {
    if (!currentMovie) return undefined;
    return {
      id: currentMovie.id.toString(),
      title: currentMovie.title || currentMovie.original_title,
      year: currentMovie.release_date ? new Date(currentMovie.release_date).getFullYear() : 0,
      rating: currentMovie.vote_average || 0,
      posterUrl: currentMovie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${currentMovie.poster_path}` 
        : 'https://via.placeholder.com/500x750/111827/ffffff?text=No+Poster'
    };
  }, [currentMovie]);

  // [POR QUÉ SE MEMOIZA]: useCallback asegura que 'handleSwipe' mantenga la 
  // misma referencia en memoria a menos que cambien sus dependencias. Si no se memoiza,
  // la funcion se recrearía en cada renderizado (ej. al actualizar el Context),
  // y React.memo en SwipeCard detectaría esto como un "prop diferente",
  // forzando un re-render innecesario de toda la UI de la tarjeta y el DOM.
  const handleSwipe = useCallback((direction: 'like' | 'dislike') => {
    if (currentMovie) {
       // Persistir en Supabase
       recordSwipe(currentMovie, direction);

       dispatch({ 
         type: direction === 'like' ? 'SWIPE_RIGHT' : 'SWIPE_LEFT', 
         payload: currentMovie 
       });
       
       if (currentIndex + 1 >= movies.length) {
          if (hasMore) {
             loadMore();
             setCurrentIndex(0);
          } else {
             setCurrentIndex(currentIndex + 1);
          }
       } else {
          setCurrentIndex(prev => prev + 1);
       }
    }
  }, [currentMovie, dispatch, currentIndex, movies.length, hasMore, loadMore, recordSwipe]);

  if (loading && movies.length === 0) {
    return (
      <div className="flex flex-col items-center animate-pulse">
        <div className="w-80 h-[28rem] bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center border border-gray-700">
          <p className="text-gray-400 font-bold text-lg">Cargando Películas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-sm text-center bg-gray-800 rounded-2xl border border-red-500/50">
        <p className="text-red-400 text-xl font-bold mb-2">¡Ups! Algo falló</p>
        <p className="text-sm text-gray-400">{error}</p>
      </div>
    );
  }

  if (!currentMovie) {
    return (
       <div className="p-8 text-center bg-gray-800 rounded-2xl max-w-sm w-full mx-4 shadow-2xl border border-gray-700">
         <h2 className="text-2xl font-bold text-gray-200">No hay más películas</h2>
         <p className="text-gray-400 mt-2">Has revisado todas las recomendaciones actuales.</p>
         <div className="mt-6 pt-6 border-t border-gray-700">
           <span className="text-sm text-gray-500 font-medium">Películas en Historial: </span>
           <span className="ml-2 text-xl font-bold text-indigo-400">{historyState?.history?.length || 0}</span>
         </div>
       </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center">
       <div className="mb-6 text-sm text-gray-400 font-semibold tracking-widest uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Recomendación
       </div>
       
       {movieWithAbsoluteUrl && (
         <SwipeCard 
           key={movieWithAbsoluteUrl.id}
           movie={movieWithAbsoluteUrl} 
           onSwipe={handleSwipe} 
         />
       )}
       
       {syncError && (
         <div className="fixed bottom-10 left-1/2 -translate-x-1/2 max-w-md w-full mx-4 bg-red-900/90 backdrop-blur-md border border-red-500 p-6 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.3)] z-50 animate-in fade-in slide-in-from-bottom-5">
           <div className="flex justify-between items-start mb-3">
             <h3 className="font-extrabold text-white flex items-center gap-2">
               <span className="text-xl">⚠️</span> Registro Fallido
             </h3>
             <button 
               onClick={clearError} 
               className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors"
               aria-label="Cerrar error"
             >✕</button>
           </div>
           <p className="text-sm text-red-100 mb-4 font-medium leading-relaxed">{syncError.message}</p>
           <div className="bg-black/40 p-3 rounded-lg text-xs text-red-200 border border-red-500/30">
             <strong className="text-white block mb-1">💡 Solución Sugerida:</strong>
             {syncError.solution}
           </div>
         </div>
       )}

       <div className="mt-10 flex justify-center space-x-8">
          <button 
             className="w-16 h-16 bg-gray-800 shadow-lg border-2 border-red-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-red-500/10 focus:outline-none focus:ring-4 focus:ring-red-500/50"
             onClick={() => handleSwipe('dislike')}
             aria-label="Dislike"
          >
            <span className="text-red-500 text-3xl font-bold">✗</span>
          </button>
          
          <button 
             className="w-16 h-16 bg-gray-800 shadow-lg border-2 border-green-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-green-500/10 focus:outline-none focus:ring-4 focus:ring-green-500/50"
             onClick={() => handleSwipe('like')}
             aria-label="Like"
          >
            <span className="text-green-500 text-4xl font-bold">♥</span>
          </button>
       </div>
    </div>
  );
};
