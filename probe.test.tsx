import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SwipeCard } from './src/components/swipe/SwipeCard';
import React from 'react';

// ==========================================
// MOCKS Y CONFIGURACIÓN
// ==========================================

// Mock de IntersectionObserver para simular la entrada al viewport (Lazy Loading)
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
let observerCallback: (entries: any[]) => void;

window.IntersectionObserver = vi.fn((callback) => {
  observerCallback = callback;
  return {
    observe: mockObserve,
    disconnect: mockDisconnect,
    unobserve: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
  };
}) as any;

// Mock de fetch global por buena práctica aunque SwipeCard no lo use directamente
global.fetch = vi.fn();

describe('SwipeCard Component', () => {
  const mockMovie = {
    id: 'm1',
    title: 'Interstellar',
    year: 2014,
    rating: 8.7,
    posterUrl: 'https://image.tmdb.org/t/p/w500/interstellar.jpg'
  };

  const mockOnSwipe = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------
  // COMPORTAMIENTO: RENDERIZADO INICIAL
  // ---------------------------------------------------------
  describe('Initial Setup', () => {
    it('should render the movie title, year and rating from props', () => {
      // Arrange & Act
      render(<SwipeCard movie={mockMovie} onSwipe={mockOnSwipe} />);

      // Assert
      expect(screen.getByText('Interstellar')).toBeTruthy();
      expect(screen.getByText('2014')).toBeTruthy();
      expect(screen.getByText(/8.7/)).toBeTruthy();
    });

    it('should have the correct accessibility role', () => {
      // Arrange & Act
      render(<SwipeCard movie={mockMovie} onSwipe={mockOnSwipe} />);

      // Assert
      expect(screen.getByRole('button', { name: /Tarjeta de pelicula: Interstellar/i })).toBeTruthy();
    });
  });

  // ---------------------------------------------------------
  // COMPORTAMIENTO: ESTADOS DE CARGA (Imagen)
  // ---------------------------------------------------------
  describe('Image Lazy Loading', () => {
    it('should initially have an empty src and then load the poster URL when visible', () => {
      // Arrange
      render(<SwipeCard movie={mockMovie} onSwipe={mockOnSwipe} />);
      const finalImage = screen.getByAltText('Interstellar');
      expect(finalImage.getAttribute('src')).toBe('');

      // Act: Simulate entering viewport
      act(() => {
        observerCallback([{ isIntersecting: true }]);
      });

      // Assert: Now it should have the URL
      expect(finalImage.getAttribute('src')).toBe(mockMovie.posterUrl);
    });

    it('should transition opacity when the image finishes loading', () => {
      // Arrange
      render(<SwipeCard movie={mockMovie} onSwipe={mockOnSwipe} />);
      act(() => {
        observerCallback([{ isIntersecting: true }]);
      });
      const finalImage = screen.getByAltText('Interstellar');
      expect(finalImage).toHaveClass('opacity-0');

      // Act: Trigger onLoad event
      fireEvent.load(finalImage);

      // Assert: Opacity should change
      expect(finalImage).toHaveClass('opacity-100');
    });
  });

  // ---------------------------------------------------------
  // COMPORTAMIENTO: ACCESIBILIDAD Y TECLADO (Edge Case)
  // ---------------------------------------------------------
  describe('Accessibility Fallbacks', () => {
    it('should allow swiping via keyboard as a fallback for accessibility', () => {
      // Arrange
      render(<SwipeCard movie={mockMovie} onSwipe={mockOnSwipe} />);
      const card = screen.getByRole('button');

      // Act: Simular flecha derecha
      fireEvent.keyDown(card, { key: 'ArrowRight' });
      expect(mockOnSwipe).toHaveBeenCalledWith('like');

      // Act: Simular flecha izquierda
      fireEvent.keyDown(card, { key: 'ArrowLeft' });
      expect(mockOnSwipe).toHaveBeenCalledWith('dislike');
    });
  });

  // ---------------------------------------------------------
  // VALIDACIÓN: LO QUE NO CUBRE
  // ---------------------------------------------------------
  // 1. Estados de error globales (API Error): El componente no recibe prop de error ni tiene UI de fallback.
  // 2. Estados de carga globales (Movies Loading): El componente se asume renderizado solo con datos válidos.
  // 3. Lógica de arrastre compleja: Requiere simuladores de eventos de puntero con coordenadas acumuladas.
});
