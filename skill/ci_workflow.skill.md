# Skill: GitHub Actions CI - CineSwipe Flow

Esta skill define un workflow de Integración Continua (CI) optimizado para proyectos React + Vite con Vitest, asegurando que el código solo se compile si pasa el análisis estático y las pruebas unitarias.

## 🚀 Archivo YAML completo (`.github/workflows/ci.yml`)

```yaml
name: CI CineSwipe (jeffersonquispe/antigravity-test)

# Disparadores: Se ejecuta en cada PUSH o Pull Request hacia la rama main
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  # Variable de entorno global para los jobs que la necesiten (Ej. Build o Tests)
  VITE_TMDB_KEY: b0711a10c0b62a36755f50c4ef6e3858

jobs:
  # JOB 1: Análisis Estático (Linting)
  # Verifica que el código siga las reglas de estilo y no tenga errores de sintaxis.
  lint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout del código
        uses: actions/checkout@v4

      - name: Configurar Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm' # Habilita el cache nativo de npm para node_modules

      - name: Instalar dependencias
        run: npm ci # Usa npm ci para una instalación determinística basada en el lockfile

      - name: Ejecutar ESLint
        run: npm run lint

  # JOB 2: Pruebas Unitarias (Vitest)
  # Depende de que 'lint' termine con éxito para ahorrar tiempo de cómputo.
  test:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout del código
        uses: actions/checkout@v4

      - name: Configurar Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Instalar dependencias
        run: npm ci

      - name: Ejecutar Tests con Vitest
        run: npm test

  # JOB 3: Compilación (Build)
  # Depende de que 'test' termine con éxito. Garantiza que solo código probado llegue a dist/.
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout del código
        uses: actions/checkout@v4

      - name: Configurar Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Instalar dependencias
        run: npm ci

      - name: Compilar proyecto (Vite)
        run: npm run build

      - name: Subir Artifact de compilación
        uses: actions/upload-artifact@v4
        with:
          name: dist-artifact
          path: dist/
          retention-days: 7 # Mantiene el bundle por 7 días para descargas manuales o despliegue
```
