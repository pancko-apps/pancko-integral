# Validación — Pancko Gestión v0.12.16

- Sintaxis JS comprobada con `node --check`: scripts embebidos en `index.html`, `sw.js`, `assets/pwa-update.js` y `assets/budget-workbench.js`.
- Anchos de las nueve columnas comprobados: 8 + 36 + 12 + 6 + 9 + 6 + 9 + 10 + 4 = 100%. El bloque numérico comienza al 56% (v0.12.15: 54%) y ocupa 44% (antes 46%). Las columnas monetarias conservan su ancho para precios grandes. Reglas nuevas limitadas a `min-width:1024px`.
- Pruebas de regresión: 21 de carga rápida, 26 de presupuesto, 26 de pulido, 19 de fórmula rápida y 41 de frontend. También pasaron Caja, integración Cuenta Corriente PC/celular, PWA y service worker.
- Comprobado byte por byte respecto de v0.12.15: CSV de artículos/clientes/recetas, lógica JS de Presupuestos, Caja, Cuenta Corriente, Apps Script y Worker idénticos. Sólo cambian CSS de grilla, versión/cache y documentación.
- ZIP completo verificado con CRC y hashes: `index.html`, `sw.js`, `assets/`, `data/`, backend y documentación en la raíz correcta. Los CSV se incluyen sin cambios.

## Límite conocido

No hay navegador gráfico instalado en este entorno. Por eso no pude comprobar visualmente el resultado a zoom 100% y 110% en el PC de mostrador ni probar un celular real; esos puntos se verifican al abrir el paquete publicado. Tampoco se ejecutó una impresión física ni una sincronización contra la Sheet de producción, ya que sus archivos y lógica no se modificaron.
