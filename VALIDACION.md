# Validación — Pancko Gestión v0.12.15

## Resultado

- `node --check`: JavaScript embebido en `index.html`, `assets/budget-workbench.js`, `assets/pwa-update.js` y `sw.js`, sin error.
- Revisión estructural del HTML: Cliente, autocompletar y Condición existen una sola vez y están dentro del bloque inferior izquierdo; las referencias locales del HTML existen.
- Prueba de render de fórmula: «Ice Age» se mantiene en snapshot y tooltip; no aparece la línea visual `budget-formula-note`; botón avanzado y estado `mod.` siguen disponibles.
- Pruebas de regresión automatizadas sobre v0.12.15: 21 entradas rápidas, 26 presupuestos, 26 casos de pulido, 19 fórmulas rápidas, 41 controles de frontend, búsqueda de Caja, integración Cuenta Corriente PC/celular, PWA y service worker. Todas pasaron.
- Se comprobó que los CSV de artículos (3998 filas), clientes (1625) y recetas (16958), backend Apps Script, Worker, Caja y sincronización de Caja son byte por byte iguales a v0.12.14. `sw.js` precarga los CSV y el CSS/JS de Presupuestos; versión de caché y registro coinciden.
- Se verificó que el ZIP contiene `index.html`, `sw.js`, `data/`, `assets/` y backend en la raíz correcta, sin carpeta contenedora.

## Límite de prueba

No se pudo abrir esta versión en un navegador gráfico del entorno para comparar a ojo zoom de PC 100% y 110% ni hacer una prueba táctil real de celular. La distribución de columnas y reglas responsive se revisaron en código y con la captura facilitada; Tincho puede comprobar la impresión visual final tras subir el paquete. Tampoco se ejecutó una sincronización contra Sheet de producción ni una impresión física, porque esta entrega no cambia esos flujos ni el backend.
