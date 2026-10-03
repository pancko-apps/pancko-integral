# Validación v0.12.13

## Pruebas automáticas

- Carga directa de producto común y de PASTEL, BLANCO, TINT, DEEP y ACCENT; sin modal y con input/🎨 sólo para tintométricos. Modal abre al pedirlo.
- Búsqueda «82»: sugerencias de bases compatibles, orden por código, click que aplica snapshot, Enter con varias opciones que pide elegir, Enter con código exacto único que aplica; fórmula incompatible no modifica la línea.
- Fórmula + Enter salta una línea común para pasar al siguiente tintométrico. Cantidad y % Dto. + Enter confirman el valor y enfocan la línea siguiente. Cambio por Tab conserva input y actualiza línea/resumen sin reconstruir grilla. Select-all presente.
- Historial/copia, A4/ticket/compartir simulado, línea y precio, recuperación offline del snapshot, PWA/cache y sintaxis/rutas/versionado.
- Regresión Presupuestos v0.12.12 (26 pruebas), pulido v0.12.11 (26), fórmula rápida v0.12.12 (19), frontend general (41), Caja local, Cuenta Corriente PC/celular con backend simulado, PWA y service worker.
- CSV `articulos.csv`, `clientes.csv`, `recetas.csv` y archivos backend comparados byte a byte contra v0.12.12. ZIP con raíz correcta, hashes SHA256 y CRC.

## Límites

El DOM/backend son simulados; la presentación visual en navegadores físicos, impresión física, WhatsApp real y Sheet productiva no se probaron. El simulador offline conserva una fórmula ya guardada. La búsqueda de fórmulas nuevas sin red requiere recetas.csv previamente cacheado por la PWA; se inspeccionó su presencia en el precache, pero no se hizo una prueba offline en un dispositivo físico.
