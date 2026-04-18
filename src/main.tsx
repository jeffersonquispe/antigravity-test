import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// -- PREFETCH DE DATOS (Critical Rendering Path) --
// Adelantamos la descarga de TMDB antes de que React cargue y pinte
const apiKey = import.meta.env.VITE_TMDB_KEY;
if (apiKey) {
  const url = `https://api.themoviedb.org/3/discover/movie?page=1&sort_by=popularity.desc&language=es-ES&api_key=${apiKey}`;
  const prefetchPromise = fetch(url, { headers: { 'Accept': 'application/json' } })
    .then(res => res.ok ? res.json() : null)
    .catch(() => null);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__moviePrefetch = prefetchPromise;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
