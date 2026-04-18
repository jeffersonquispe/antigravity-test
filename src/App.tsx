import React, { Suspense, lazy } from 'react';
import { MovieProvider } from './context/movies/MovieContext';

// Importación perezosa para aplicar Code Splitting (dividir el código JS)
const Discovery = lazy(() => import('./pages/Discovery/Discovery').then(module => ({ default: module.Discovery })));

const App: React.FC = () => {
  return (
    <MovieProvider>
      <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-indigo-500 selection:text-white">
        <header className="py-6 text-center border-b border-gray-800 bg-gray-900/80 backdrop-blur-md fixed top-0 w-full z-10">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 tracking-wide">
            CineSwipe
          </h1>
        </header>
        <main className="flex justify-center items-center h-screen pt-20">
          {/* El fallback se muestra mientras se descarga el chunk Javascript de Discovery */}
          <Suspense fallback={
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-indigo-400 font-medium">Cargando películas...</p>
            </div>
          }>
            <Discovery />
          </Suspense>
        </main>
      </div>
    </MovieProvider>
  );
};

export default App;
