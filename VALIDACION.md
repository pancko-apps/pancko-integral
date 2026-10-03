# Validación — Pancko Gestión v0.12.17

- Se inspeccionó la captura de v0.12.16 con las X rojas. Los huecos entre campos/valores motivaron un cambio de anchos real, no sólo de padding.
- Grilla de escritorio: anchos 8 + 48 + 8 + 5 + 7 + 5 + 7 + 8 + 4 = 100%; el bloque numérico empieza al 64% y ocupa 36%, frente a 56%/44% en v0.12.16. Fórmula queda en 8%, input máximo 72 px; títulos conservan su columna. La tabla tiene `min-width:1200px` y scroll interno si no cabe.
- Sintaxis JS comprobada con `node --check` en scripts embebidos de `index.html`, `sw.js`, `assets/pwa-update.js` y `assets/budget-workbench.js`.
- Pruebas automatizadas pasadas: 21 entradas rápidas, 26 casos de presupuesto, 26 de pulido, 19 de fórmula rápida, 41 controles de frontend, Caja, integración Cuenta Corriente PC/celular, PWA y service worker.
- Byte por byte idénticos a v0.12.16: CSV de artículos/clientes/recetas, JS de presupuesto, Caja, Cuenta Corriente, Apps Script y Worker. Sólo cambian CSS, metadatos de versión/cache y documentación.
- ZIP comprobado: estructura raíz, archivos esenciales, CRC y hashes SHA256.

## Límite conocido

No hay navegador gráfico instalado en este entorno: el aspecto visual a zoom 100% y 110%, la lectura táctil en celular y el resultado de una impresión física no se comprobaron aquí. Las dimensiones y el responsive se revisaron en CSS y contra la captura, mientras que los flujos de JS se verificaron con pruebas automatizadas. La tabla puede tener scroll horizontal interno en un escritorio de menos de 1200 px de área útil, para evitar superponer los importes.
