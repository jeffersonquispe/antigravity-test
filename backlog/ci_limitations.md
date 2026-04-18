# Backlog de CI: Limitaciones y Roadmap de Mejoras

Este documento contiene los casos borde y riesgos técnicos que el workflow de CI actual no detecta, los cuales deben ser abordados en futuras fases del proyecto CineSwipe.

## 🔴 Riesgos Críticos (No detectados por CI)

### 1. Desfase de Esquema de Base de Datos (Supabase)
- **Problema**: El CI no realiza pruebas de integración contra la base de datos real.
- **Riesgo**: Los cambios en las tablas o políticas RLS de Supabase podrían romper la aplicación sin que el CI falle.
- **Acción Pendiente**: Implementar tests de integración con una base de datos de "staging" o usar Supabase CLI para migraciones locales probadas en CI.

### 2. Caducidad de Tokens y API Keys
- **Problema**: Las claves se inyectan como texto plano o secretos fijos.
- **Riesgo**: Si TMDB revoca la clave, el build pasará pero Discovery fallará en producción.
- **Acción Pendiente**: Implementar un check de "Health" antes del build para verificar que las claves externas siguen activas.

### 3. Integridad Visual y Responsividad
- **Problema**: Vitest no evalúa el renderizado CSS/Tailwind.
- **Riesgo**: Componentes que se ven mal o se desbordan en móviles.
- **Acción Pendiente**: Añadir Playwright o Cypress para E2E Testing y Visual Regression.

## 🟡 Mejoras de Rendimiento en Pipeline

### 4. Paralelización de Jobs
- **Idea**: Si el proyecto crece, el lint y los tests podrían correr en paralelo para reducir el tiempo total de 3 minutos a 1.5 minutos.

### 5. Reportes de Cobertura
- **Idea**: Integrar `@vitest/coverage-v8` para que el CI falle si el código nuevo no tiene al menos un 80% de cobertura de tests.
