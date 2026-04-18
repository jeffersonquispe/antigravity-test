# BUGLOG - CineSwipe

Este archivo registra los errores detectados durante el desarrollo, su causa raíz y la solución aplicada para prevenir regresiones.

| Campo | Detalles |
| :--- | :--- |
| **ID del bug** | BUG-001 |
| **Archivo afectado** | [package.json](file:///c:/Users/Jeff/Desktop/Curso%20antigravity/sesion%207%20-%20Copy/package.json) |
| **Síntoma** | El job `lint` en GitHub Actions falla con `exit code 127`. |
| **Causa raíz** | Uso del comando `eslint` en el script de npm sin que el paquete `eslint` estuviera instalado en las `devDependencies`. |
| **Fix aplicado** | `npm install -D eslint eslint-plugin-react eslint-plugin-react-hooks @typescript-eslint/eslint-plugin @typescript-eslint/parser` y actualización de Node.js a la versión 22 en `ci.yml`. |
| **Test de regresión** | Ejecución exitosa del job `lint` en la pipeline de CI. |
| **Tipo de error agentic** | Falta de restricciones: Se generó una configuración de CI asumiendo dependencias persistentes que no estaban declaradas en el proyecto. |

---

| Campo | Detalles |
| :--- | :--- |
| **ID del bug** | BUG-002 |
| **Archivo afectado** | [src/pages/Discovery/Discovery.tsx](file:///c:/Users/Jeff/Desktop/Curso%20antigravity/sesion%207%20-%20Copy/src/pages/Discovery/Discovery.tsx) |
| **Síntoma** | Lint error: `missing dependency: 'recordSwipe'` en `useCallback`. |
| **Causa raíz** | Se añadió la lógica de grabación de wipes pero no se incluyó la función `recordSwipe` en el array de dependencias del hook `useCallback`. |
| **Fix aplicado** | Adición de `recordSwipe` a la lista de dependencias de `handleSwipe`. |
| **Test de regresión** | El linter ya no reporta advertencias de dependencias en `useCallback`. |
| **Tipo de error agentic** | Contexto acumulado: Se modificó una función existente para añadir una funcionalidad pesada pero se olvidó actualizar el boilerplate reactivo de React. |

---

| Campo | Detalles |
| :--- | :--- |
| **ID del bug** | BUG-003 |
| **Archivo afectado** | [src/main.tsx](file:///c:/Users/Jeff/Desktop/Curso%20antigravity/sesion%207%20-%20Copy/src/main.tsx) |
| **Síntoma** | Lint error: `Unexpected any. Specify a different type`. |
| **Causa raíz** | Uso deliberado de `any` para acceder a propiedades no estándar de `window` y `import.meta` para el prefetch de datos. |
| **Fix aplicado** | Uso de `import.meta.env` nativo y supresión controlada de ESLint para el acceso global a `window` mediante un comentario aclaratorio. |
| **Test de regresión** | El job de CI pasa las reglas estrictas de TypeScript de ESLint. |
| **Tipo de error agentic** | Falta de restricciones: Se utilizó un "atajo" tipado (`any`) que viola las reglas de calidad estricta del proyecto. |

---

<!-- Añadir nuevos bugs arriba de esta línea usando el mismo formato -->
