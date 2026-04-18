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

<!-- Añadir nuevos bugs arriba de esta línea usando el mismo formato -->
