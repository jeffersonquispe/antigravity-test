import React, { useState, useRef, PointerEvent, KeyboardEvent, useEffect } from 'react';

// ==========================================
// TIPOS E INTERFACES EXPLICITOS
// ==========================================
export interface Movie {
  id: string;
  title: string;
  year: number;
  rating: number;
  posterUrl: string;
}

export interface SwipeCardProps {
  movie: Movie;
  /** Callback accionado cuando el usuario desliza la tarjeta más allá del umbral */
  onSwipe: (direction: 'like' | 'dislike') => void;
}

// ==========================================
// CONSTANTES DE CONFIGURACIÓN
// ==========================================
const SWIPE_THRESHOLD = 80;
const ROTATION_FACTOR = 0.05;

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

// [POR QUÉ SE MEMOIZA]: React.memo() evalúa superficialmente (shallow compare) los props
// 'movie' y 'onSwipe'. Si ninguno de los dos cambia su referencia en memoria, omite por
// completo los procesos de reconciliación de DOM virtual y repintado de esto componente.
// Evita que SwipeCard se re-renderice si el componente padre (Discovery) sufre cambios
// de estado irrelevantes (ej: se actualiza el context del historial, pero la película en 
// pantalla sigue siendo la misma).
const SwipeCardComponent: React.FC<SwipeCardProps> = ({ movie, onSwipe }) => {
  // Refs para manipular el DOM sin disparar re-renders de React
  const cardRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [status, setStatus] = useState<'none' | 'like' | 'dislike'>('none');
  
  // Estado y Refs para el Lazy Loading & Blur-up de la imagen
  const imgObserverRef = useRef<HTMLImageElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Dejar de observar una vez que se hace visible
        }
      },
      { rootMargin: '100px' } 
    );

    if (imgObserverRef.current) {
      observer.observe(imgObserverRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const imgUrl300 = movie.posterUrl.replace('/w500/', '/w300/');
  const imgUrlTiny = movie.posterUrl.replace('/w500/', '/w92/');

  // Referencias para el seguimiento de la posición inicial sin re-renders
  const startXRef = useRef<number>(0);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    startXRef.current = e.clientX - offsetRef.current;
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const currentOffset = e.clientX - startXRef.current;
    offsetRef.current = currentOffset;

    if (cardRef.current) {
      const rotation = currentOffset * ROTATION_FACTOR;
      cardRef.current.style.transform = `translate3d(${currentOffset}px, 0, 0) rotate(${rotation}deg)`;
    }

    if (currentOffset > SWIPE_THRESHOLD && status !== 'like') setStatus('like');
    else if (currentOffset < -SWIPE_THRESHOLD && status !== 'dislike') setStatus('dislike');
    else if (Math.abs(currentOffset) <= SWIPE_THRESHOLD && status !== 'none') setStatus('none');
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    if (offsetRef.current > SWIPE_THRESHOLD) {
      onSwipe('like');
    } else if (offsetRef.current < -SWIPE_THRESHOLD) {
      onSwipe('dislike');
    } else {
      offsetRef.current = 0;
      setStatus('none');
      if (cardRef.current) {
        cardRef.current.style.transform = `translate3d(0px, 0, 0) rotate(0deg)`;
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      onSwipe('like');
    } else if (e.key === 'ArrowLeft') {
      onSwipe('dislike');
    }
  };

  const isLiking = status === 'like';
  const isDisliking = status === 'dislike';

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      aria-label={`Tarjeta de pelicula: ${movie.title}`}
      className={`relative w-80 h-[28rem] rounded-2xl shadow-xl overflow-hidden touch-none select-none focus:outline-none focus:ring-4 focus:ring-indigo-500
        ${!isDragging ? 'transition-transform duration-300 ease-out' : 'cursor-grabbing'}
        ${isDragging && offsetRef.current === 0 ? 'cursor-grab' : ''}
      `}
      style={{ transform: 'translate3d(0px, 0, 0) rotate(0deg)' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp} 
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 w-full h-full bg-gray-800 flex items-center justify-center overflow-hidden">
        {isVisible && !isLoaded && (
          <img
            src={imgUrlTiny}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-70 pointer-events-none"
            aria-hidden="true"
          />
        )}
        
        <img 
          ref={imgObserverRef}
          src={isVisible ? movie.posterUrl : ''} 
          srcSet={isVisible ? `${imgUrl300} 300w, ${movie.posterUrl} 500w` : undefined}
          sizes="(max-width: 640px) 300px, 500px"
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          alt={movie.title} 
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500 ease-in
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          draggable="false"
        />
      </div>
      
      {isLiking && (
        <div className="absolute top-6 left-6 border-4 border-green-500 text-green-500 text-3xl font-bold uppercase py-1 px-4 rounded transform -rotate-12 bg-black bg-opacity-30">
          Like
        </div>
      )}
      {isDisliking && (
        <div className="absolute top-6 right-6 border-4 border-red-500 text-red-500 text-3xl font-bold uppercase py-1 px-4 rounded transform rotate-12 bg-black bg-opacity-30">
          Dislike
        </div>
      )}

      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent pt-16 pb-6 px-6 pointer-events-none">
        <h2 className="text-white text-2xl font-bold leading-tight truncate">
          {movie.title}
        </h2>
        <div className="flex items-center space-x-3 mt-2 text-gray-300 text-sm">
          <span className="font-semibold">{movie.year}</span>
          <span className="flex items-center text-yellow-400 font-bold">
            {'★ '}{movie.rating}
          </span>
        </div>
      </div>
    </div>
  );
};

// [POR QUÉ SE MEMOIZA]: Usamos una función personaliza de comparación en vez de
// la igualdad estricta por defecto. Como el objeto 'movie' se regenera ocasionalmente 
// (creando una nueva referencia en memoria), validamos especificamente el 'movie.id'.
// Si el ID es el mismo, nos saltamos el renderizado porque visualmente representa 
// la misma película y su poster.
export const SwipeCard = React.memo(SwipeCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.movie.id === nextProps.movie.id &&
    // Importante: también compramos el prop onSwipe, el cual debe estar memoizado 
    // en con useCallback() en el padre (Discovery.tsx).
    prevProps.onSwipe === nextProps.onSwipe
  );
});
