# Skill: Explain Code - useMovies Hook

## Objetivo
Analizar y explicar la arquitectura modular del hook `useMovies`, asegurando que cualquier desarrollador (especialmente perfiles junior) comprenda la separación de responsabilidades entre la persistencia de datos y la capa de red.

## Estructura Requerida de Respuesta
Al realizar una explicación o modificación de este hook, se debe incluir:

1.  **Análisis Modular**: Desglose de los 3 sub-hooks componentes (`useMovieCache`, `useMovieFetch`, `useMovies`).
2.  **Flujo de Datos (Mermaid)**: Representación visual del ciclo "Consulta Caché -> Fetch Red -> Persistencia".
3.  **Guía de Implementación**: Ejemplo de código real que maneje los estados de `loading`, `error` y `hasMore`.
4.  **Matriz de Casos Edge**: Lista explícita de lo que el hook NO cubre (ej. errores de red no manejados visualmente, estados globales).

## Principios de Diseño
- **Separación de Preocupaciones**: La lógica de `sessionStorage` nunca debe mezclarse con la lógica de `fetch`.
- **Defensa ante Fugas de Memoria**: Uso obligatorio de `AbortController` para limpiar peticiones en vuelo durante el desmontaje o cambios de filtro.
- **Cache-First Strategy**: Siempre se debe intentar rescatar una respuesta de la sesión antes de consumir cuota de la API de TMDB.
- **Saneamiento de Datos**: Validación estricta del payload de la API (Type Guards) antes de inyectar datos al estado de React.

---
*Este skill garantiza la consistencia arquitectónica del descubrimiento de películas en CineSwipe (Abril 2026).*
